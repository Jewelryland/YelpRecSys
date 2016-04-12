# -*- coding: utf-8 -*-
import os
import sys
# import pymysql
import sqlite3
import json
import time

__DATA_PATH__ = '/Users/Adward/OneDrive/YelpData/'
__DB_PATH__ = os.path.join(__DATA_PATH__, 'yelp.sqlite')
VALID_STATES = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


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
                            user_name TEXT,
                            review_count TEXT,
                            average_stars REAL,
                            votes INT,
                            elite TEXT,
                            yelping_since TEXT,
                            compliments INT,
                            fans INT
                            )''') # intrinsic commit
                    cur.execute('DROP TABLE IF EXISTS friendship')
                    cur.execute('''CREATE TABLE friendship
                            (
                            user1_id TEXT,
                            user2_id TEXT
                            )''')
                    conn.commit()
                    try:
                        while True:
                            usr = json.loads(f.readline())
                            insTuple = (usr['user_id'],
                                        usr['name'],
                                        usr['review_count'],
                                        usr['average_stars'],
                                        sum(usr['votes'].values()),
                                        '&'.join([str(y) for y in usr['elite']]),
                                        usr['yelping_since'],
                                        sum(usr['compliments'].values()),
                                        usr['fans']
                                        )
                            cur.execute('INSERT INTO user VALUES (?,?,?,?,?,?,?,?,?)', insTuple)
                            for friend in usr['friends']:
                                cur.execute('INSERT INTO friendship VALUES (?,?)', (usr['user_id'], friend))
                            conn.commit()
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
                            review_date TEXT,
                            votes INT
                            )''')
                    conn.commit()
                    try:
                        while True:
                            revw = json.loads(f.readline())
                            insTuple = (
                                revw['review_id'],
                                revw['business_id'],
                                revw['user_id'],
                                revw['stars'],
                                revw['date'],
                                sum(revw['votes'].values())
                            )
                            cur.execute('INSERT INTO review VALUES (?,?,?,?,?,?)', insTuple)
                            conn.commit()
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


def business_stat():
    states = {}
    attrs = set()
    mostNbrhs = 1
    mostCategories = 1
    path = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_business.json')
    openBusiNum = 0
    categories = {}
    with open(path, mode='r', encoding='utf-8') as f:
        try:
            while True:
                busi = json.loads(f.readline())
                if busi['open']:
                    openBusiNum += 1
                    if busi['state'] not in states:
                        states[busi['state']] = 1
                    else:
                        states[busi['state']] += 1
                    ##
                    for attr in busi['attributes']:
                        attrs.add(attr)
                    mostNbrhs = max(len(busi['neighborhoods']), mostNbrhs)
                    mostCategories = max(len(busi['categories']), mostCategories)
                    for ca in busi['categories']:
                        if ca in categories:
                            categories[ca] += 1
                        else:
                            categories[ca] = 1
        except:
            pass
    lessThanHundred = 0
    for st in states:
        if states[st] >= 18:
            print(st, states[st])
        else:
            lessThanHundred += 1
    print("<100", lessThanHundred)
    print(mostNbrhs)
    print(attrs)
    print("Opening Businesses:", openBusiNum)
    print("Most Categories:", mostCategories)
    print("Categories Num. :", len(list(categories.keys())))
    catlist = [(key, categories[key]) for key in categories]
    catlist.sort(key=lambda x: x[1], reverse=True)
    print(catlist[100])


def user_stat():
    t = time.time()
    path = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_user.json')
    yelpingSince = {}
    eliteYears = {}
    eliteUsersNum, eliteUsersTotalYears, complimentNum, eliteCompNum = [0] * 4
    complimentTypes = set()
    votesNum = {'funny': 0, 'cool': 0, 'useful': 0}

    with open(path, mode='r', encoding='utf-8') as f:
        lineN = 0
        try:
            while True:
                usr = json.loads(f.readline())
                for key in usr['votes']:
                    votesNum[key] += usr['votes'][key]
                ##
                tmpCompNum = 0
                for comp in usr['compliments']:
                    complimentTypes.add(comp)
                    tmpCompNum += usr['compliments'][comp]
                complimentNum += tmpCompNum
                ##
                if len(usr['elite']):
                    for y in usr['elite']:
                        if y in eliteYears:
                            eliteYears[y] += 1
                        else:
                            eliteYears[y] = 1
                    eliteUsersNum += 1
                    eliteUsersTotalYears += len(usr['elite'])
                    eliteCompNum += tmpCompNum
                ##
                sincey = int(usr['yelping_since'].split('-')[0])
                if sincey in yelpingSince:
                    yelpingSince[sincey] += 1
                else:
                    yelpingSince[sincey] = 1
                ##
                lineN += 1
        except:
            pass
        print("User num:", lineN)
        print("Each year's registration:", yelpingSince)
        print("Each year's elite user num:", eliteYears)
        print("Total elite users num:", eliteUsersNum)
        print("Avg elite user's year num of being elite:", eliteUsersTotalYears/eliteUsersNum)
        print("Avg compliment num a user receives:", complimentNum/lineN)
        print("Avg compliment num an elite user receives:", eliteCompNum/eliteUsersNum)
        print("Compliment Types:", complimentTypes)
        print("Votes Num Count:", votesNum)
        print('\n')

    print("Took", time.time()-t, "s to execute", "user_stat()")


def review_stat():
    t = time.time()
    path = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_review.json')
    with open(path, mode='r', encoding='utf-8') as f:
        lineN = 0
        try:
            while True:
                #revw = json.loads(f.readline())
                print(f.readline()[-5])
                lineN += 1
        except:
            pass
        print(lineN)
    print("Took", time.time()-t, "s to execute", "review_stat()")


def tip_stat():
    path = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_tip.json')
    with open(path, mode='r', encoding='utf-8') as f:
        tipN, tipLengSum, maxLeng, likesSum, likesCnt, maxLikes = [0] * 6
        minLeng, minLikes = [1000] * 2
        try:
            while True:
                tip = json.loads(f.readline())
                tipLeng = len(tip['text'])
                maxLeng = max(maxLeng, tipLeng)
                minLeng = min(minLeng, tipLeng)
                tipLengSum += tipLeng
                if tip['likes']:
                    likesSum += tip['likes']
                    likesCnt += 1
                    maxLikes = max(maxLikes, tip['likes'])
                    minLikes = min(minLikes, tip['likes'])
                tipN += 1
        except:
            pass
        print("Total tips:", tipN)
        print("Max tip length:", maxLeng)
        print("Min tip length:", minLeng)
        print("Avg tip length:", tipLengSum / tipN)
        print("Total liked tips:", likesCnt)
        print("Total liked times:", likesSum)
        print(100*likesCnt/tipN, "% of tips liked")
        print("Avg tip liked times:", likesSum/tipN)


def cleaning():  # still left out those user statistics including closed businesses
    try:
        with sqlite3.connect(__DB_PATH__) as conn:
            cur = conn.cursor()
            cur.execute('DELETE FROM review WHERE business_id IN (SELECT business_id FROM closed_business)')
            #  DELETE FROM review WHERE EXISTS
            #  (SELECT * FROM closed_business WHERE closed_business.business_id=review.business_id)
    except:
        print('Cannot be connected to database QAQ')

if __name__ == '__main__':
    funcDict = {'b': init_business, 'u': init_user, 'r': init_review, 't': init_tip,
                'bstat': business_stat, 'ustat': user_stat, 'rstat': review_stat, 'tstat': tip_stat,
                'clean': cleaning}
    for arg in sys.argv[1:]:
        funcDict[arg]()