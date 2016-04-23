# -*- coding: utf-8 -*-
import os
import sys
# import pymysql
import sqlite3
import json
import time
from datetime import datetime

__DATA_PATH__ = '/Users/Adward/OneDrive/YelpData/'
__DB_PATH__ = os.path.join(__DATA_PATH__, 'yelp.sqlite')
VALID_STATES = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]
TOTAL_NUM = {'b': {'open': 66878, 'all': 77445},
             'u': {'elite': 31461, 'all': 552339},
             'r': 2225213}
n_sample = 2225213  # 1992542
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
earliest_day = datetime(2004, 10, 18)


def init_business(): # & checkin
    busiDataPath = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_business.json')
    ckinDataPath = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_checkin.json')
    try:
        with sqlite3.connect(__DB_PATH__) as conn:
            cur = conn.cursor()
            try:
                with open(busiDataPath, mode='r', encoding='utf-8') as f:
                    cur.execute('DROP TABLE IF EXISTS business')
                    cur.execute('''CREATE TABLE business
                            (
                            business_id TEXT PRIMARY KEY NOT NULL,
                            business_name TEXT,
                            neighborhoods TEXT,
                            city TEXT,
                            state TEXT,
                            stars REAL,
                            review_count INT,
                            categories TEXT,
                            weekends_open INT,
                            checkins INT
                            )''')  # intrinsic commit
                    cur.execute('DROP TABLE IF EXISTS closed_business')
                    cur.execute('CREATE TABLE closed_business (business_id TEXT PRIMARY KEY NOT NULL)')
                    conn.commit()
                    try:
                        row_num = 0
                        while True:
                            busi = json.loads(f.readline())
                            if True:  # busi['open'] and (busi['state'] in VALID_STATES):
                                hours = busi['hours']
                                weekends = 0
                                if ('Saturday' in hours) or ('Saturday' in hours):
                                    weekends = 1
                                insTuple = (busi['business_id'],
                                            busi['name'],
                                            '&'.join(busi['neighborhoods']),
                                            busi['city'],
                                            busi['state'],
                                            busi['stars'],
                                            busi['review_count'],
                                            '&'.join(busi['categories']),
                                            weekends,
                                            0)
                                cur.execute('INSERT INTO business VALUES (?,?,?,?,?,?,?,?,?,?)', insTuple)
                                conn.commit()
                            if not busi['open']:
                                cur.execute('INSERT INTO closed_business VALUES (?)', (busi['business_id'],)) # ',' in the tail is indispensable
                                conn.commit()
                            row_num += 1
                            if row_num % 100 == 0:
                                print("%.2f %%" % (row_num * 100 / TOTAL_NUM['b']['all']))
                    except:
                        # print(sys.exc_info())
                        pass  # encountered EOF of business
            except:
                print('Cannot find business data file')

            try:
                with open(ckinDataPath, mode='r', encoding='utf-8') as f_ckin:
                    try:
                        while True:
                            ckin = json.loads(f_ckin.readline())
                            cur.execute('UPDATE business SET checkins = ? WHERE business_id = ?',
                                        (sum(ckin['checkin_info'].values()), ckin['business_id']))
                            conn.commit()
                    except:
                        pass  #encountered EOF of checkin
            except:
                print('Cannot find checkin data file')
    except:
        print('Cannot be connected to database QAQ')


def init_user():
    dataPath = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_user.json')
    try:
        with open(dataPath, mode='r', encoding='utf-8') as f:
            try:
                with sqlite3.connect(__DB_PATH__) as conn:
                    cur = conn.cursor()
                    cur.execute('DROP TABLE IF EXISTS user')
                    cur.execute('''CREATE TABLE user
                            (
                            user_id TEXT PRIMARY KEY NOT NULL,
                            review_count INT,
                            average_stars REAL,
                            votes INT,
                            elite TEXT,
                            yelping_since INT,
                            compliments INT,
                            fans INT
                            )''')  # intrinsic commit
                    cur.execute('DROP TABLE IF EXISTS friendship')
                    cur.execute('''CREATE TABLE friendship
                            (
                            user1_id TEXT,
                            user2_id TEXT
                            )''')
                    conn.commit()
                    try:
                        row_num = 0
                        while True:
                            usr = json.loads(f.readline())
                            ysince_lst = usr['yelping_since'].split('-')
                            ysince_months = (int(ysince_lst[0])-2004) * 12 + (int(ysince_lst[1])-10)
                            insTuple = (usr['user_id'],
                                        # usr['name'],
                                        usr['review_count'],
                                        usr['average_stars'],
                                        sum(usr['votes'].values()),
                                        '&'.join([str(y) for y in usr['elite']]),
                                        ysince_months,
                                        sum(usr['compliments'].values()),
                                        usr['fans']
                                        )
                            cur.execute('INSERT INTO user VALUES (?,?,?,?,?,?,?,?)', insTuple)
                            for friend in usr['friends']:
                                cur.execute('INSERT INTO friendship VALUES (?,?)', (usr['user_id'], friend))
                            conn.commit()
                            row_num += 1
                            if row_num % 100 == 0:
                                print("%.2f %%" % (row_num * 100 / TOTAL_NUM['u']['all']))
                    except:
                        pass  # encountered EOF
            except:
                print('Cannot be connected to database QAQ')
    except:
        print('Cannot find data file')


def init_review():
    revwDataPath = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_review.json')
    try:
        with sqlite3.connect(__DB_PATH__) as conn:
            cur = conn.cursor()
            try:
                with open(revwDataPath, mode='r', encoding='utf-8') as f:
                    cur.execute('DROP TABLE IF EXISTS review')
                    cur.execute('''CREATE TABLE review
                            (
                            review_id TEXT PRIMARY KEY NOT NULL,
                            business_id TEXT NOT NULL,
                            user_id TEXT NOT NULL,
                            stars INT,
                            review_date INT,
                            votes INT
                            )''')
                    conn.commit()
                    try:
                        row_num = 0
                        while True:
                            revw = json.loads(f.readline())
                            revw_d = [int(d) for d in revw['date'].split('-')]
                            insTuple = (
                                revw['review_id'],
                                revw['business_id'],
                                revw['user_id'],
                                revw['stars'],
                                (datetime(revw_d[0], revw_d[1], revw_d[2]) - earliest_day).days,
                                sum(revw['votes'].values())
                            )
                            cur.execute('INSERT INTO review VALUES (?,?,?,?,?,?)', insTuple)
                            conn.commit()
                            row_num += 1
                            if row_num % 1000 == 0:
                                print("%.2f %%" % (row_num * 100 / TOTAL_NUM['r']))
                    except:
                        pass  # encountered EOF of review
            except:
                print('Cannot find review data file')
    except:
        print('Cannot be connected to database QAQ')


def init_tip():
    tipDataPath = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_tip.json')
    try:
        with sqlite3.connect(__DB_PATH__) as conn:
            cur = conn.cursor()
            try:
                with open(tipDataPath, mode='r', encoding='utf-8') as f:
                    cur.execute('DROP TABLE IF EXISTS tip')
                    cur.execute('''CREATE TABLE tip
                            (
                            business_id TEXT NOT NULL,
                            user_id TEXT NOT NULL,
                            tip_date TEXT,
                            likes INT
                            )''')
                    conn.commit()
                    try:
                        while True:
                            tip = json.loads(f.readline())
                            insTuple = (
                                tip['business_id'],
                                tip['user_id'],
                                tip['date'],
                                tip['likes']
                            )
                            cur.execute('INSERT INTO tip VALUES (?,?,?,?)', insTuple)
                            conn.commit()
                    except:
                        pass  # encountered EOF of tip
            except:
                print('Cannot find review data file')
    except:
        print('Cannot be connected to database QAQ')


def cleaning():  # still left out those user statistics including closed businesses
    with sqlite3.connect(__DB_PATH__) as conn:
        # cur.execute('DELETE FROM review WHERE business_id IN (SELECT business_id FROM closed_business)')
        #  DELETE FROM review WHERE EXISTS
        #  (SELECT * FROM closed_business WHERE closed_business.business_id=review.business_id)
        cur = conn.execute('SELECT yelping_since, review_date, user_id, review_count '
                           'FROM (review JOIN user USING (user_id))')
        abnormal_usrs = {}
        for row in cur:
            if row[0] * 100 + 1 > row[1]:
                if row[2] in abnormal_usrs:
                    abnormal_usrs[row[2]][0] += 1
                else:
                    abnormal_usrs[row[2]] = [1, row[3]]
        for usr in abnormal_usrs:
            print(abnormal_usrs[usr])


def add_user_state():
    with sqlite3.connect(__DB_PATH__) as conn:
        conn.execute('DROP TABLE IF EXISTS user_reside')
        conn.execute('CREATE TABLE user_reside (user_id TEXT PRIMARY KEY, user_state TEXT)')
        cur = conn.execute('INSERT INTO user_reside (user_id, user_state) SELECT user_id, state AS user_state FROM ('
                           'SELECT user_id, state, MAX(cnt) FROM'
                           '(SELECT user_id, state, COUNT(*) AS cnt FROM '
                           '((review JOIN user USING (user_id)) JOIN business USING (business_id))'
                           'GROUP BY user_id, state) GROUP BY user_id)')
        conn.commit()

        # for row in cur:
        #     uid, state, maxcnt = row
        #     if state not in VALID_STATES:
        #         state = 'OTH'
        #     print(uid, state)
        #     cur.execute('INSERT INTO user_reside VALUES (?,?)', ('eqweqwewq', 'AZ'))
        #     conn.commit()


def add_user_friends_stat():
    with sqlite3.connect(__DB_PATH__) as conn:
        conn.execute('DROP TABLE IF EXISTS friends_stat')
        conn.execute('''CREATE TABLE friends_stat (
                            user_id TEXT PRIMARY KEY,
                            avg_votes INT,
                            avg_review_count INT
                            )''')
        cur = conn.execute('INSERT INTO friends_stat (user_id, avg_votes, avg_review_count) '
                           'SELECT user1_id AS user_id, AVG(votes), AVG(review_count) '
                           'FROM (SELECT user1_id, votes, review_count FROM '
                           '((SELECT user1_id, user2_id AS user_id FROM friendship) NATURAL JOIN user) ) '
                           'GROUP BY user1_id')
        conn.commit()


def add_business_star_stat_by_elite():
    with sqlite3.connect(__DB_PATH__) as conn:
        conn.execute('CREATE TEMP TABLE tmp1 (business_id TEXT, avg_star_elite REAL)')
        conn.execute('CREATE TEMP TABLE tmp2 (business_id TEXT, avg_star_nonelite REAL)')
        conn.execute('INSERT INTO tmp1 (business_id, avg_star_elite) '
                     'SELECT business_id, AVG(average_stars) AS avg_star_elite FROM '
                     '(review JOIN user USING (user_id)) WHERE elite!="" GROUP BY business_id')
        conn.execute('INSERT INTO tmp2 (business_id, avg_star_nonelite) '
                     'SELECT business_id, AVG(average_stars) AS avg_star_nonelite FROM '
                     '(review JOIN user USING (user_id)) WHERE elite="" GROUP BY business_id')
        conn.execute('DROP TABLE IF EXISTS bstat_by_elite')
        conn.execute('CREATE TABLE bstat_by_elite (business_id TEXT, avg_star_elite REAL, avg_star_nonelite REAL)')
        conn.execute('INSERT INTO bstat_by_elite SELECT * FROM (tmp1 LEFT OUTER JOIN tmp2 USING (business_id))')


def add_friends_star_stat():
    with sqlite3.connect(__DB_PATH__) as conn:
        conn.execute('DROP TABLE IF EXISTS friends_star_stat')
        conn.execute('CREATE TABLE friends_star_stat (user_id, business_id, avg_friends_star)')
        conn.execute('''INSERT INTO friends_star_stat SELECT user1_id AS user_id, business_id, AVG(stars) AS avg_friends_star
                        FROM (
                          (friendship
                            JOIN
                            (SELECT user_id AS user1_id, business_id FROM review)
                            USING (user1_id)
                          )
                          JOIN
                          (SELECT user_id AS user2_id, business_id FROM review)
                          USING (user2_id)
                        )
                        GROUP BY user1_id, business_id''')



if __name__ == '__main__':
    funcDict = {'b': init_business, 'u': init_user, 'r': init_review, 't': init_tip,
                'clean': cleaning, 'reside': add_user_state, 'friends_stat': add_user_friends_stat,
                'b_elite': add_business_star_stat_by_elite, 'f_star_stat': add_friends_star_stat}
    for arg in sys.argv[1:]:
        funcDict[arg]()
