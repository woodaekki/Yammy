from fastapi import APIRouter
from config import driver_path, save_data_to_db, get_mysql_connection
from config import scoreboard_to_df, etc_info_to_df, batters_to_df, pitchers_to_df
from datetime import datetime

import kbodata
import pandas as pd
import numpy as np

router = APIRouter(
    prefix="/kbodata",
    tags= ["kbodata"],
    responses= {404: {"description": "Not found"}},
)

# @router.get("/{user_id}")
# def read_user(user_id: int):
#     return {"user_id": user_id}

@router.get("/schedule")
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
    

@router.get('/result')
def get_match_info():
    
    now = datetime.now()
    year, month, day = now.year, now.month, now.day-1

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

            scoreboards = match_dict['scoreboard']
            scoreboard_df = scoreboard_to_df(scoreboards, match_data)
            scoreboard_query = """
                INSERT IGNORE INTO scoreboard (matchcode, idx, team, result, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, run, hit, err, balls, matchdate, matchday, home, away, dbheader, place, audience, starttime, endtime, gametime)
                VALUES (%(matchcode)s, %(idx)s, %(team)s, %(result)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(run)s, %(hit)s, %(err)s, %(balls)s, %(matchdate)s, %(matchday)s, %(home)s, %(away)s, %(dbheader)s, %(place)s, %(audience)s, %(starttime)s, %(endtime)s, %(gametime)s)
                """
          
            save_data_to_db(scoreboard_df, scoreboard_query)
            print('scoreboard 완료')

            etc_info = match_dict['ETC_info']
            etc_info_df = etc_info_to_df(etc_info, match_data)
            game_info_query = """
            INSERT IGNORE INTO game_info (matchcode, gwrbi, gametime, stadium, endtime, referee, triple, cs, sb, pickoff, starttime, passedball, err, oob, doublehit, doubleout, wildpitch, homerun, crowd)
            VALUES (%(matchcode)s, %(gwrbi)s, %(gametime)s, %(stadium)s, %(endtime)s, %(referee)s, %(triple)s, %(cs)s, %(sb)s, %(pickoff)s, %(starttime)s, %(passedball)s, %(err)s, %(oob)s, %(doublehit)s, %(doubleout)s, %(wildpitch)s, %(homerun)s, %(crowd)s)
            """
            save_data_to_db(etc_info_df, game_info_query)
            print('etc_info 완료')

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
    

@router.get('/save')
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

                    # scoreboards = match_dict['scoreboard']
                    # scoreboard_df = scoreboard_to_df(scoreboards, match_data)
                    # scoreboard_query = """
                    #     INSERT IGNORE INTO scoreboard (matchcode, idx, team, result, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9, i_10, i_11, i_12, i_13, i_14, i_15, i_16, i_17, i_18, run, hit, err, balls, matchdate, matchday, home, away, dbheader, place, audience, starttime, endtime, gametime)
                    #     VALUES (%(matchcode)s, %(idx)s, %(team)s, %(result)s, %(i_1)s, %(i_2)s, %(i_3)s, %(i_4)s, %(i_5)s, %(i_6)s, %(i_7)s, %(i_8)s, %(i_9)s, %(i_10)s, %(i_11)s, %(i_12)s, %(i_13)s, %(i_14)s, %(i_15)s, %(i_16)s, %(i_17)s, %(i_18)s, %(run)s, %(hit)s, %(err)s, %(balls)s, %(matchdate)s, %(matchday)s, %(home)s, %(away)s, %(dbheader)s, %(place)s, %(audience)s, %(starttime)s, %(endtime)s, %(gametime)s)
                    #     """
                    # save_data_to_db(scoreboard_df, scoreboard_query)

                    # etc_info = match_dict['ETC_info']
                    # etc_info_df = etc_info_to_df(etc_info, match_data)
                    # game_info_query = """
                    # INSERT IGNORE INTO game_info (matchcode, gwrbi, gametime, stadium, endtime, referee, triple, cs, sb, pickoff, starttime, passedball, err, oob, doublehit, doubleout, wildpitch, homerun, crowd)
                    # VALUES (%(matchcode)s, %(gwrbi)s, %(gametime)s, %(stadium)s, %(endtime)s, %(referee)s, %(triple)s, %(cs)s, %(sb)s, %(pickoff)s, %(starttime)s, %(passedball)s, %(err)s, %(oob)s, %(doublehit)s, %(doubleout)s, %(wildpitch)s, %(homerun)s, %(crowd)s)
                    # """
                    # save_data_to_db(etc_info_df, game_info_query)

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