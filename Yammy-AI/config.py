import os
import mysql.connector
import pandas as pd

from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
from mysql.connector import Error

load_dotenv()

# ChromeDriver 설치 및 경로 설정
driver_path = ChromeDriverManager().install()

PORT = 3306

MYSQL_DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "database": os.getenv("MYSQL_DATABASE", "yammy"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD"),
    "port": int(os.getenv("MYSQL_PORT", 3306)),
}

def get_mysql_connection():
    try:
        connection = mysql.connector.connect(**MYSQL_DB_CONFIG)
        return connection
    
    except Error as e:
        print(f'MySQL 연결 오류: {e}')
        return None
    
def save_data_to_db(data_df, insert_query):
    """범용 DB 저장 함수"""
    
    # 빈 DataFrame인 경우 0 반환
    if data_df.empty:
        return 0
        
    connection = get_mysql_connection()
    if not connection:
        raise Exception("DB 연결 실패")
    
    try:
        cursor = connection.cursor()
        records = data_df.to_dict('records')
        cursor.executemany(insert_query, records)
        connection.commit()
        
        return len(records)

    except Exception as e:
        print(f"DB 저장 중 오류: {e}")
        raise

    finally:
        if connection:
            cursor.close()
            connection.close()

def scoreboard_to_df(scoreboard, match_code):
    """
    scoreboard 리스트를 DataFrame으로 변환하는 함수
    """
    if not scoreboard:
        # 빈 리스트인 경우 빈 DataFrame 반환
        return pd.DataFrame()

    df = pd.DataFrame(scoreboard)

    # 컬럼 존재 여부 확인 후 변환
    if 'r' in df.columns:
        df['run'] = df['r']
    if 'h' in df.columns:
        df['hit'] = df['h'] 
    if 'e' in df.columns:
        df['err'] = df['e']
    if 'b' in df.columns:
        df['balls'] = df['b']
    
    df['matchcode'] = match_code
    
    # 날짜 컬럼들이 존재하는지 확인
    if all(col in df.columns for col in ['year', 'month', 'day']):
        df['matchdate'] = (df['year'].astype(str) + '-' + 
                          df['month'].astype(str).str.zfill(2) + '-' + 
                          df['day'].astype(str).str.zfill(2))
    
    if 'week' in df.columns:
        df['matchday'] = df['week']

    # 삭제할 컬럼들 중 존재하는 것만 삭제
    columns_to_drop = ['r', 'h', 'e', 'b', 'year', 'month', 'day', 'week']
    existing_columns_to_drop = [col for col in columns_to_drop if col in df.columns]
    if existing_columns_to_drop:
        df = df.drop(existing_columns_to_drop, axis=1)
    
    return df

def etc_info_to_df(etc_info_dict, match_code):
    """
    etc_info 딕셔너리를 DataFrame으로 변환하는 함수
    """

    data = {
        'matchcode': match_code,
        'gwrbi': etc_info_dict.get('결승타', ''),
        'gametime': etc_info_dict.get('경기시간', ''),
        'stadium': etc_info_dict.get('구장', ''),
        'endtime': etc_info_dict.get('종료', ''),
        'referee': str(etc_info_dict.get('심판', '')), 
        'triple': str(etc_info_dict.get('3루타', '')),
        'cs': str(etc_info_dict.get('도루자', '')),
        'sb': str(etc_info_dict.get('도루', '')), 
        'pickoff': str(etc_info_dict.get('견제', '')),
        'starttime': etc_info_dict.get('개시', ''),
        'passedball': str(etc_info_dict.get('포일', '')),
        'err': str(etc_info_dict.get('실책', '')),
        'oob': str(etc_info_dict.get('주루사', '')),
        'doublehit': str(etc_info_dict.get('2루타', '')), 
        'doubleout': str(etc_info_dict.get('병살타', '')), 
        'wildpitch': str(etc_info_dict.get('폭투', '')),
        'homerun': str(etc_info_dict.get('홈런', '')),
        'crowd': etc_info_dict.get('관중', '').replace(',', '') if etc_info_dict.get('관중') else ''
    }
    
    df = pd.DataFrame(data, index=[0])  # 명시적으로 index 지정
    return df

def batters_to_df(batters_list, match_code):
    """
    타자 리스트를 DataFrame으로 변환하는 함수
    """
    if not batters_list:
        return pd.DataFrame()

    df = pd.DataFrame(batters_list)
    
    df['matchcode'] = match_code
    if 'name' in df.columns:
        df['player_name'] = df['name']
    
    if 'position' in df.columns:
        df['position'] = df['position'].astype(str)
    
    i_columns = ['i_10', 'i_11', 'i_12', 'i_13', 'i_14', 'i_15', 'i_16', 'i_17', 'i_18']
    for col in i_columns:
        if col in df.columns:
            df[col] = df[col].replace('-', None)
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    numeric_columns = ['i_1', 'i_2', 'i_3', 'i_4', 'i_5', 'i_6', 'i_7', 'i_8', 'i_9']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    numeric_cols = ['hit', 'bat_num', 'hit_get', 'own_get']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    if 'name' in df.columns:
        df = df.drop(['name'], axis=1)
    
    return df

def pitchers_to_df(pitchers_list, match_code):
    """
    투수 리스트를 DataFrame으로 변환하는 함수
    """
    if not pitchers_list:
        return pd.DataFrame()

    df = pd.DataFrame(pitchers_list)
    
    df['matchcode'] = match_code
    if 'name' in df.columns:
        df['player_name'] = df['name']
    
    if 'mound' in df.columns:
        df['mound'] = pd.to_numeric(df['mound'], errors='coerce')
    if 'inning' in df.columns:
        df['inning'] = pd.to_numeric(df['inning'], errors='coerce')
    
    numeric_cols = ['strikeout', 'dead4ball', 'losescore', 'earnedrun', 'pitchnum', 'hitted', 'homerun', 'battednum', 'batternum']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    if 'name' in df.columns:
        df = df.drop(['name'], axis=1)
    
    return df