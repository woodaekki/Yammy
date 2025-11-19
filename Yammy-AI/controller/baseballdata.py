from fastapi import APIRouter, HTTPException
from config import driver_path, save_data_to_db, get_mysql_connection
from config import scoreboard_to_df, etc_info_to_df, batters_to_df, pitchers_to_df
from datetime import datetime
from typing import List, Dict, Optional

import kbodata
import pandas as pd
import numpy as np

router = APIRouter(
    prefix="/kbodata",
    tags= ["kbodata"],
    responses= {404: {"description": "Not found"}},
)


@router.get("/matches/date/{match_date}")
def get_matches_by_date(match_date: str):
    """특정 날짜의 경기 목록 조회 - scoreboard 테이블 기반"""
    print(match_date)
    try:
        connection = get_mysql_connection()
        cursor = connection.cursor(dictionary=True)
        
        # scoreboard 테이블에서 해당 날짜의 모든 경기 조회 (중복 제거)
        query = """
        SELECT s.* FROM scoreboard s
        INNER JOIN (
            SELECT matchcode, team, MAX(id) as max_id
            FROM scoreboard 
            WHERE matchcode LIKE %s
            GROUP BY matchcode, team
        ) latest ON s.matchcode = latest.matchcode 
                 AND s.team = latest.team 
                 AND s.id = latest.max_id
        ORDER BY s.id DESC
        """
        
        cursor.execute(query, (match_date+'%',))
        scoreboards = cursor.fetchall()
        print('>>>', scoreboards)
        cursor.close()
        connection.close()
        
        # matchcode별로 그룹핑해서 팀 대 팀 형태로 변환
        matches = {}
        for scoreboard in scoreboards:
            matchcode = scoreboard['matchcode']
            if matchcode not in matches:
                matches[matchcode] = []
            matches[matchcode].append(scoreboard)
        
        # 각 경기를 team1 vs team2 형태로 변환
        match_list = []
        for matchcode, teams in matches.items():
            print(f"Matchcode: {matchcode}, Teams count: {len(teams)}")
            
            if len(teams) >= 2:  # 2팀 이상인 경우
                # result 값으로 승리팀(1)과 패배팀(-1) 구분
                team1 = next((t for t in teams if t['result'] == 1), teams[0])  # 승리팀 우선
                team2 = next((t for t in teams if t['result'] == -1), teams[1])  # 패배팀
                
                match_info = {
                    'matchcode': matchcode,
                    'matchdate': team1['matchdate'],
                    'team1': {
                        'name': team1['team'],
                        'result': team1['result'],
                        'run': team1['run']
                    },
                    'team2': {
                        'name': team2['team'], 
                        'result': team2['result'],
                        'run': team2['run']
                    }
                }
                match_list.append(match_info)
            else:
                print(f"⚠️ {matchcode}: 팀 데이터 부족 ({len(teams)}팀)")
        print('전달 값', match_list)
        
        return {
            "status": "success",
            "data": match_list,
            "count": len(match_list),
            "date": match_date
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/match/{matchcode}")
def get_match_detail(matchcode: str):
    """특정 matchcode의 경기 상세 정보 조회"""
    print('>>>', matchcode)
    try:
        connection = get_mysql_connection()
        cursor = connection.cursor(dictionary=True)
        
        # game_info 테이블에서 경기 상세 정보 조회
        query = "SELECT * FROM game_info WHERE matchcode = %s LIMIT 1"
        cursor.execute(query, (matchcode,))
        match_detail = cursor.fetchone()
        
        if not match_detail:
            cursor.close()
            connection.close()
            raise HTTPException(status_code=404, detail="Match not found")
        
        cursor.close()
        connection.close()
        
        return {
            "status": "success",
            "data": match_detail
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule")
def get_yearly_schedule(year: int):
    try:
        schedule = kbodata.get.schedule.get_yearly_schedule(year, driver_path)
        # print(f"=================== {year}년도 경기일정 ===================")
        # print(schedule)

        connection = get_mysql_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM match_schedule WHERE year = %s", (year, ))

        cursor.execute("SET @count = 0")
        cursor.execute("UPDATE match_schedule SET id = @count := @count + 1")

        cursor.execute("SELECT MAX(id) FROM match_schedule")
        max_id = cursor.fetchone()[0]
        if max_id is None:
            max_id = 0
        cursor.execute("ALTER TABLE match_schedule AUTO_INCREMENT = %s", (max_id + 1,))

        connection.commit()
        cursor.close()
        connection.close()
        
        schedule_query = """
        INSERT INTO match_schedule (match_status, match_date, home, away, dbheader, gameid, year)
        VALUES (%(status)s, %(date)s, %(home)s, %(away)s, %(dbheader)s, %(gameid)s, {})
        """.format(year)

        saved_count = save_data_to_db(schedule, schedule_query)
        saved_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        return {
            "status": "success",
            "year": year,
            "saved_records": saved_count,
            "message": f'{year}년도 kbo 경기일정 업로드 완료',
            "saved_at": saved_time
        }

    except Exception as e:
        return {
            "status" : "error",
            "message" : str(e)
        }
    

@router.post('/result')
def get_match_info():
    
    now = datetime.now()
    year, month, day = now.year, now.month, now.day-1

    #year, month, day = 2025, 10, 31
    try:
        daily_schedule = kbodata.get.schedule.get_daily_schedule(year, month, day, driver_path)
        game_datas = kbodata.get.game.get_game_data(daily_schedule, driver_path)

        for game_data in game_datas:

            match_data, match_dict = game_data.values()

            connection = get_mysql_connection()
            cursor = connection.cursor()
            match_data_query = """
            INSERT IGNORE INTO match_result (matchcode)
            VALUES (%s)
            """
            cursor.execute(match_data_query, (match_data,))
            connection.commit()
            cursor.close()
            connection.close()

            # scoreboard 데이터 중복 체크 및 저장
            scoreboards = match_dict['scoreboard']
            scoreboard_df = scoreboard_to_df(scoreboards, match_data)
            
            # 기존 scoreboard 데이터 중복 체크
            connection = get_mysql_connection()
            cursor = connection.cursor()
            
            new_scoreboards = []
            for _, row in scoreboard_df.iterrows():
                # matchcode와 team 조합으로 중복 체크
                cursor.execute(
                    "SELECT COUNT(*) FROM scoreboard WHERE matchcode = %s AND team = %s", 
                    (row['matchcode'], row['team'])
                )
                count = cursor.fetchone()[0]
                if count == 0:
                    new_scoreboards.append(row.to_dict())
                else:
                    print(f"ℹ️ scoreboard 중복 스킵: {row['matchcode']} - {row['team']}")
            
            cursor.close()
            connection.close()
            
            if new_scoreboards:
                new_scoreboard_df = pd.DataFrame(new_scoreboards)
                scoreboard_query = """
                    INSERT INTO scoreboard (matchcode, idx, team, result, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, run, hit, err, balls, matchdate, matchday, home, away, dbheader, place, audience, starttime, endtime, gametime)
                    VALUES (%(matchcode)s, %(idx)s, %(team)s, %(result)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(run)s, %(hit)s, %(err)s, %(balls)s, %(matchdate)s, %(matchday)s, %(home)s, %(away)s, %(dbheader)s, %(place)s, %(audience)s, %(starttime)s, %(endtime)s, %(gametime)s)
                    """
                save_data_to_db(new_scoreboard_df, scoreboard_query)
                print(f'scoreboard 완료: {len(new_scoreboards)}개 새로운 레코드 삽입')
            else:
                print('scoreboard 완료: 새로운 데이터 없음')

            # game_info 데이터 중복 체크 및 저장
            etc_info = match_dict['ETC_info']
            etc_info_df = etc_info_to_df(etc_info, match_data)
            
            # 기존 game_info 데이터 중복 체크
            connection = get_mysql_connection()
            cursor = connection.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM game_info WHERE matchcode = %s", (match_data,))
            count = cursor.fetchone()[0]
            
            if count == 0:
                game_info_query = """
                INSERT INTO game_info (matchcode, gwrbi, gametime, stadium, endtime, referee, triple, cs, sb, pickoff, starttime, passedball, err, oob, doublehit, doubleout, wildpitch, homerun, crowd)
                VALUES (%(matchcode)s, %(gwrbi)s, %(gametime)s, %(stadium)s, %(endtime)s, %(referee)s, %(triple)s, %(cs)s, %(sb)s, %(pickoff)s, %(starttime)s, %(passedball)s, %(err)s, %(oob)s, %(doublehit)s, %(doubleout)s, %(wildpitch)s, %(homerun)s, %(crowd)s)
                """
                save_data_to_db(etc_info_df, game_info_query)
                print('game_info 완료: 새로운 데이터 삽입')
            else:
                print(f'game_info 완료: {match_data} 이미 존재')
            
            cursor.close()
            connection.close()

            away_batters = match_dict['away_batter']
            home_batters = match_dict['home_batter']

            away_batters_df = batters_to_df(away_batters, match_data)
            home_batters_df = batters_to_df(home_batters, match_data)
            
            batters_df = pd.concat([away_batters_df, home_batters_df], ignore_index=True)
            batters_df = batters_df.replace([np.nan], [None])
            
            print(batters_df.head())
            print(batters_df.info())
            
            connection = get_mysql_connection()
            cursor = connection.cursor()
            
            existing_batters = []
            for _, row in batters_df.iterrows():
                cursor.execute("SELECT COUNT(*) FROM batter_info WHERE matchcode = %s AND idx = %s", 
                             (row['matchcode'], row['idx']))
                count = cursor.fetchone()[0]
                if count == 0:
                    existing_batters.append(row.to_dict())
            
            cursor.close()
            connection.close()
            
            if existing_batters:
                new_batters_df = pd.DataFrame(existing_batters)
                batter_query = """
                INSERT INTO batter_info (matchcode, idx, player_name, team, position, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, hit, bat_num, hit_get, own_get)
                VALUES (%(matchcode)s, %(idx)s, %(player_name)s, %(team)s, %(position)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(hit)s, %(bat_num)s, %(hit_get)s, %(own_get)s)
                """
                save_data_to_db(new_batters_df, batter_query)
                print(f'타자 완료: {len(existing_batters)}개 새로운 레코드 삽입')
            else:
                print('타자 완료: 새로운 데이터 없음')

            away_pitchers = match_dict['away_pitcher']
            home_pitchers = match_dict['home_pitcher']

            away_pitchers_df = pitchers_to_df(away_pitchers, match_data)
            home_pitchers_df = pitchers_to_df(home_pitchers, match_data)

            pitchers_df = pd.concat([away_pitchers_df, home_pitchers_df], ignore_index=True)
            pitchers_df = pitchers_df.replace([np.nan], [None])

            connection = get_mysql_connection()
            cursor = connection.cursor()
            
            existing_pitchers = []
            for _, row in pitchers_df.iterrows():
                cursor.execute("SELECT COUNT(*) FROM pitcher_info WHERE matchcode = %s AND idx = %s", 
                             (row['matchcode'], row['idx']))
                count = cursor.fetchone()[0]
                if count == 0:
                    existing_pitchers.append(row.to_dict())
            
            cursor.close()
            connection.close()
            
            if existing_pitchers:
                new_pitchers_df = pd.DataFrame(existing_pitchers)
                pitcher_query = """
                INSERT INTO pitcher_info (matchcode, idx, player_name, team, mound, inning, result, strikeout, dead4ball, losescore, earnedrun, pitchnum, hitted, homerun, battednum, batternum)
                VALUES (%(matchcode)s, %(idx)s, %(player_name)s, %(team)s, %(mound)s, %(inning)s, %(result)s, %(strikeout)s, %(dead4ball)s, %(losescore)s, %(earnedrun)s, %(pitchnum)s, %(hitted)s, %(homerun)s, %(battednum)s, %(batternum)s)
                """
                save_data_to_db(new_pitchers_df, pitcher_query)
                print(f'투수 완료: {len(existing_pitchers)}개 새로운 레코드 삽입')
            else:
                print('투수 완료: 새로운 데이터 없음')

        saved_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "status": "success",
            "message": f'{year}년 {month}월 {day}일 kbo 경기결과 업로드 완료',
            "saved_at": saved_time
        }

    except Exception as e:
        return {
            "status" : "error",
            "message" : str(e)
        }
    

@router.post('/save')
def save_before_data():

    calender = {
        3 : 31,
        4 : 30,
        5 : 31,
        6 : 30,
        7 : 31,
        8 : 31,
        9 : 30,
        10 : 31,
        11 : 30
    }
    try:
        for month, days in calender.items():
            for day in range(1, days+1):
                print(f'처리 중: 2025년 {month}월 {day}일')
                daily_schedule = kbodata.get.schedule.get_daily_schedule(2025, month, day, driver_path)
                game_datas = kbodata.get.game.get_game_data(daily_schedule, driver_path)
        
                for game_data in game_datas:

                    match_data, match_dict = game_data.values()
                    
                    connection = get_mysql_connection()
                    cursor = connection.cursor()
                    match_data_query = """
                    INSERT IGNORE INTO match_result (matchcode)
                    VALUES (%s)
                    """
                    cursor.execute(match_data_query, (match_data,))
                    connection.commit()
                    cursor.close()
                    connection.close()

                    # 우선 match_result 테이블에 담는 부분 제외하고 주석처리 해놓음

                    # scoreboard 데이터 중복 체크 및 저장
                    scoreboards = match_dict['scoreboard']
                    scoreboard_df = scoreboard_to_df(scoreboards, match_data)
                    
                    # 기존 scoreboard 데이터 중복 체크
                    connection = get_mysql_connection()
                    cursor = connection.cursor()
                    
                    new_scoreboards = []
                    for _, row in scoreboard_df.iterrows():
                        # matchcode와 team 조합으로 중복 체크
                        cursor.execute(
                            "SELECT COUNT(*) FROM scoreboard WHERE matchcode = %s AND team = %s", 
                            (row['matchcode'], row['team'])
                        )
                        count = cursor.fetchone()[0]
                        if count == 0:
                            new_scoreboards.append(row.to_dict())
                    
                    cursor.close()
                    connection.close()
                    
                    if new_scoreboards:
                        new_scoreboard_df = pd.DataFrame(new_scoreboards)
                        scoreboard_query = """
                            INSERT INTO scoreboard (matchcode, idx, team, result, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, run, hit, err, balls, matchdate, matchday, home, away, dbheader, place, audience, starttime, endtime, gametime)
                            VALUES (%(matchcode)s, %(idx)s, %(team)s, %(result)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(run)s, %(hit)s, %(err)s, %(balls)s, %(matchdate)s, %(matchday)s, %(home)s, %(away)s, %(dbheader)s, %(place)s, %(audience)s, %(starttime)s, %(endtime)s, %(gametime)s)
                            """
                        save_data_to_db(new_scoreboard_df, scoreboard_query)

                    # game_info 데이터 중복 체크 및 저장
                    etc_info = match_dict['ETC_info']
                    etc_info_df = etc_info_to_df(etc_info, match_data)
                    
                    # 기존 game_info 데이터 중복 체크
                    connection = get_mysql_connection()
                    cursor = connection.cursor()
                    
                    cursor.execute("SELECT COUNT(*) FROM game_info WHERE matchcode = %s", (match_data,))
                    count = cursor.fetchone()[0]
                    
                    if count == 0:
                        game_info_query = """
                        INSERT INTO game_info (matchcode, gwrbi, gametime, stadium, endtime, referee, triple, cs, sb, pickoff, starttime, passedball, err, oob, doublehit, doubleout, wildpitch, homerun, crowd)
                        VALUES (%(matchcode)s, %(gwrbi)s, %(gametime)s, %(stadium)s, %(endtime)s, %(referee)s, %(triple)s, %(cs)s, %(sb)s, %(pickoff)s, %(starttime)s, %(passedball)s, %(err)s, %(oob)s, %(doublehit)s, %(doubleout)s, %(wildpitch)s, %(homerun)s, %(crowd)s)
                        """
                        save_data_to_db(etc_info_df, game_info_query)
                    
                    cursor.close()
                    connection.close()

                    # away_batters = match_dict['away_batter']
                    # home_batters = match_dict['home_batter']

                    # away_batters_df = batters_to_df(away_batters, match_data)
                    # home_batters_df = batters_to_df(home_batters, match_data)
                    
                    # batters_df = pd.concat([away_batters_df, home_batters_df], ignore_index=True)
                    # batters_df = batters_df.replace([np.nan], [None])

                    # connection = get_mysql_connection()
                    # cursor = connection.cursor()
                    
                    # existing_batters = []
                    # for _, row in batters_df.iterrows():
                    #     cursor.execute("SELECT COUNT(*) FROM batter_info WHERE matchcode = %s AND idx = %s", 
                    #                  (row['matchcode'], row['idx']))
                    #     count = cursor.fetchone()[0]
                    #     if count == 0:
                    #         existing_batters.append(row.to_dict())
                    
                    # cursor.close()
                    # connection.close()
                    
                    # if existing_batters:
                    #     new_batters_df = pd.DataFrame(existing_batters)
                    #     batter_query = """
                    #     INSERT INTO batter_info (matchcode, idx, player_name, team, position, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, hit, bat_num, hit_get, own_get)
                    #     VALUES (%(matchcode)s, %(idx)s, %(player_name)s, %(team)s, %(position)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(hit)s, %(bat_num)s, %(hit_get)s, %(own_get)s)
                    #     """
                    #     save_data_to_db(new_batters_df, batter_query)

                    # away_pitchers = match_dict['away_pitcher']
                    # home_pitchers = match_dict['home_pitcher']

                    # away_pitchers_df = pitchers_to_df(away_pitchers, match_data)
                    # home_pitchers_df = pitchers_to_df(home_pitchers, match_data)

                    # pitchers_df = pd.concat([away_pitchers_df, home_pitchers_df], ignore_index=True)
                    # pitchers_df = pitchers_df.replace([np.nan], [None])

                    # connection = get_mysql_connection()
                    # cursor = connection.cursor()
                    
                    # existing_pitchers = []
                    # for _, row in pitchers_df.iterrows():
                    #     cursor.execute("SELECT COUNT(*) FROM pitcher_info WHERE matchcode = %s AND idx = %s", 
                    #                  (row['matchcode'], row['idx']))
                    #     count = cursor.fetchone()[0]
                    #     if count == 0:
                    #         existing_pitchers.append(row.to_dict())
                    
                    # cursor.close()
                    # connection.close()
                    
                    # if existing_pitchers:
                    #     new_pitchers_df = pd.DataFrame(existing_pitchers)
                    #     pitcher_query = """
                    #     INSERT INTO pitcher_info (matchcode, idx, player_name, team, mound, inning, result, strikeout, dead4ball, losescore, earnedrun, pitchnum, hitted, homerun, battednum, batternum)
                    #     VALUES (%(matchcode)s, %(idx)s, %(player_name)s, %(team)s, %(mound)s, %(inning)s, %(result)s, %(strikeout)s, %(dead4ball)s, %(losescore)s, %(earnedrun)s, %(pitchnum)s, %(hitted)s, %(homerun)s, %(battednum)s, %(batternum)s)
                    #     """
                    #     save_data_to_db(new_pitchers_df, pitcher_query)

                print(f'2025년 {month}월 {day}일 처리 완료')

        saved_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        return {
            "status": "success",
            "message": f'2025년 kbo 경기데이터 저장 완료',
            "saved_at": saved_time
        }

    except Exception as e:
        return {
            "status" : "error",
            "message" : str(e)
        }