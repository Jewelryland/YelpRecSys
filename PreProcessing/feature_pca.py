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
from sklearn.feature_extraction import DictVectorizer
from sklearn.cross_validation import StratifiedKFold, ShuffleSplit
from sklearn.metrics import *
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.decomposition import PCA

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_sample = 2225213  # 1992542

# class Flist(object):
#     """docstring for """
#     def __init__(self, np_array):
#         self.lst = list(np_array)
#     def __repr__(self):
#         return ", ".join([str(n) for n in self.lst])
#
# def adapt_flist(feature_list):
#     return ';'.join(feature_list)
#
# def convert_flist(s):
#     return Flist(s.split(';'))
#
# sqlite3.register_adapter(Flist, adapt_flist)
# sqlite3.register_converter("FLIST", convert_flist)

def b_category_pca(n_components = 10):
    t = time()
    def categories_to_vectors(conn, cmd, vecs, ca_set):
        cur = conn.execute(cmd)
        for row in cur:
            tmp = [0 for i in range(len(ca_set))]
            if row[0] != '':
                cas = row[0].split('&')
                idx = 0
                for ca in ca_set:
                    if ca in cas:
                        tmp[idx] = 1
                    idx += 1
            vecs.append(tmp)

    with sqlite3.connect(DB_PATH) as conn:
        # construct category-set and corresponding indexes
        CMD1 = 'SELECT categories FROM business'
        cur = conn.execute(CMD1)
        ca_set = set()
        for row in cur:
            if row[0] != '':
                cas = row[0].split('&')
                for ca in cas:
                    ca_set.add(ca)

        pca_model = []
        t = time()
        categories_to_vectors(conn, CMD1, pca_model, ca_set)
        cur = conn.execute('SELECT business_id FROM business')
        bid_lst = cur.fetchall()
        pca = PCA(n_components=n_components)
        pca_model = pca.fit_transform(np.array(pca_model))
        pca_model = [(bid_lst[i][0], ';'.join(map(str, pca_model[i])),) for i in range(len(pca_model))]
        print('Finishing fitting the PCA model, using', time()-t, 's')
        # print(pca.explained_variance_ratio_)
        t = time()
        conn.execute('DROP TABLE IF EXISTS b_category_pca')
        conn.execute('CREATE TABLE b_category_pca (business_id TEXT, cas TEXT)')
        conn.executemany('INSERT INTO b_category_pca (business_id, cas) VALUES (?,?)', pca_model)
        conn.commit()
        print(time()-t)
        print('Using', time()-t, 's')


if __name__ == '__main__':
    b_category_pca()
