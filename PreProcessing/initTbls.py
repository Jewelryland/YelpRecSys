# -*- coding: utf-8 -*-
import os
import sys
#import pymysql
import sqlite3
import json
import time

__DATA_PATH__ = '/Users/Adward/OneDrive/YelpData/'

def init_business():
    dbPath = os.path.join(__DATA_PATH__, 'sqlite3.db')
    try:
        with sqlite3.connect(dbPath).cursor() as c:
            pass
    except:
        print('cannot connect to DB!')
    print("in init_user")


def business_stat():
    states = {}
    attrs = set()
    mostNbrhs = 1
    path = os.path.join(__DATA_PATH__, 'yelp_academic_dataset_business.json')
    with open(path, mode='r', encoding='utf-8') as f:
        try:
            while True:
                busi = json.loads(f.readline())
                if busi['open']:
                    if busi['state'] not in states:
                        states[busi['state']] = 1
                    else:
                        states[busi['state']] += 1
                    ##
                    for attr in busi['attributes']:
                        attrs.add(attr)
                    mostNbrhs = max(len(busi['neighborhoods']), mostNbrhs)

        except:
            pass
    lessThanHundred = 0
    for st in states:
        if states[st] >= 100:
            print(st, states[st])
        else:
            lessThanHundred += 1
    print("<100", lessThanHundred)
    print(mostNbrhs)
    print(attrs)

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

if __name__ == '__main__':
    #init_user()
    #print(sys.argv)
    #business_stat()
    review_stat()