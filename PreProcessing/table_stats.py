# -*- coding: utf-8 -*-
import os
import sys
import sqlite3
import json
import time

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_sample = 2225213  # 1992542
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]
TOTAL_NUM = {'b': {'open': 66878, 'all': 77445},
             'u': {'elite': 31461, 'all': 552339},
             'r': 2225213}


def business_stat():
    states = {}
    attrs = set()
    mostNbrhs = 1
    mostCategories = 1
    path = os.path.join(DATA_PATH, 'yelp_academic_dataset_business.json')
    openBusiNum = 0
    totalBusiNum = 0
    categories = {}
    with open(path, mode='r', encoding='utf-8') as f:
        try:
            while True:
                busi = json.loads(f.readline())
                totalBusiNum += 1
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
    print("Total Businesses:", totalBusiNum)
    print("Opening Businesses:", openBusiNum)
    print("Most Categories:", mostCategories)
    print("Categories Num. :", len(list(categories.keys())))
    catlist = [(key, categories[key]) for key in categories]
    catlist.sort(key=lambda x: x[1], reverse=False)
    print(set([i[0] for i in catlist[:50]]))


def user_stat():
    t = time.time()
    path = os.path.join(DATA_PATH, 'yelp_academic_dataset_user.json')
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
    path = os.path.join(DATA_PATH, 'yelp_academic_dataset_review.json')
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
    path = os.path.join(DATA_PATH, 'yelp_academic_dataset_tip.json')
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
        print(100 * likesCnt / tipN, "% of tips liked")
        print("Avg tip liked times:", likesSum / tipN)


if __name__ == '__main__':
    funcDict = {'b': business_stat, 'u': user_stat, 'r': review_stat, 't': tip_stat}
    for arg in sys.argv[1:]:
        funcDict[arg]()
