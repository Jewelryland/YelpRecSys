# -*- coding: utf-8 -*-
__author__ = 'Adward'
import os
import sys
import sqlite3
import time

DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')


# Check whether a certain user's 'yelping_since' is no later than his actual earliest 'review_date'
def check_1():
    # result: 3295 'yelping_since' later than 'review_date' with 639 users
    with sqlite3.connect(DB_PATH) as conn:
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


# Check if a certain user's 'review_count' is faulty
def check_2():
    # result: 411576 / 552339 users' 'review_count' mismatches their review num in db !
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT user_id, review_count, review_sum '
                           'FROM (user JOIN (SELECT user_id, COUNT(*) AS review_sum '
                           'FROM review GROUP BY user_id) USING (user_id))'
                           'WHERE review_count != review_sum')
        ab_cnt = 0
        for row in cur:
            print(row)
            ab_cnt += 1
        print(ab_cnt)


# Check how many users' 'average_stars' is undefined
def check_3():
    # result: 11 of them having 'average_stars' = [5.0, 5.0, 1.0, 1.0, 5.0, 5.0, 2.0, 5.0, 5.0, 1.0, 2.0]
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT average_stars FROM user WHERE review_count = 0')
        ab = []
        for row in cur:
            ab.append(row[0])
        print(ab, len(ab))

# Check how many businesses' stars is undefined
def check_4():
    # result: 0 of them
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT stars FROM business WHERE review_count = 0')
        ab_cnt = 0
        for row in cur:
            print(row[0])
            ab_cnt += 1
        print(ab_cnt)

if __name__ == '__main__':
    check_3()