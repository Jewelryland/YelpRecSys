# -*- coding: utf-8 -*-
__author__ = 'Adward'

# Python utils imports
import math
import os
import sys
from time import time
import sqlite3

# Standard scientific Python imports
import matplotlib.pyplot as plt
import numpy as np

# Import classifiers and performance metrics
from sklearn.preprocessing import *
from sklearn.metrics import *
from sklearn.decomposition import PCA

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_review = 2225213  # 1992542
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


# create table which rows are vectors representing users' taste
def init_user_taste(dim):
    """
    :param dim: selected major dimensions' num of business.categories after PCA, <= max_dims
    :return:
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT user_id FROM user')
        usr_taste_vecs = {}  # np.zeros(n_review, dim)
        for uid in cur:
            usr_taste_vecs[uid[0]] = [0, np.zeros(dim)]
        cur = conn.execute('SELECT user_id, stars, cas FROM review JOIN b_category_pca USING (business_id)')

        row_num = 0
        for r in cur:
            usr_taste_vecs[r[0]][0] += 1
            usr_taste_vecs[r[0]][1] += r[1] * np.array([float(d) for d in r[2].split(';')[0:dim]])
            row_num += 1
            if row_num % 10000 == 0:
                print("%.2f %%" % (row_num * 100 / n_review))
        usr_taste_mat = [(uid,) + tuple(usr_taste_vecs[uid][1] / usr_taste_vecs[uid][0])
                         for uid in usr_taste_vecs]

        conn.execute('DROP TABLE IF EXISTS user_taste')
        attrs_type = ','.join([('ca_'+str(i)+' REAL') for i in range(dim)])
        attrs = ','.join([('ca_'+str(i)) for i in range(dim)])
        conn.execute('CREATE TABLE user_taste (user_id TEXT,' + attrs_type + ')')
        conn.executemany('INSERT INTO user_taste (user_id,' + attrs +
                         ') VALUES (?,' + ",".join(['?']*dim) + ')', usr_taste_mat)
        conn.commit()


# acquire friends tastes' main dimensions by joining 'friendship' & 'user_taste' just generated
def acq_friends_taste(dim):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('DROP TABLE IF EXISTS friends_taste')
        conn.execute('CREATE TABLE friends_taste (user_id TEXT, tastes TEXT)')
        grouped_attrs = ",".join(["AVG(ca_"+str(i)+")" for i in range(dim)])
        cur = conn.execute('SELECT user1_id, ' + grouped_attrs +
                           ' FROM (SELECT user1_id, user2_id AS user_id '
                           '        FROM friendship) NATURAL JOIN user_taste GROUP BY user1_id')
        tastes_vecs = [(u[0], ';'.join(map(str, u[1:]))) for u in cur]
        conn.executemany('INSERT INTO friends_taste (user_id, tastes) VALUES (?,?)', tastes_vecs)
        conn.commit()


if __name__ == '__main__':
    try:
        dim = int(sys.argv[1])
        # b_category_pca(int(sys.argv[1]))
    except:
        print("First argument: positive int for n_component, 0 for 'mle'")
    else:
        init_user_taste(dim)
        acq_friends_taste(dim)