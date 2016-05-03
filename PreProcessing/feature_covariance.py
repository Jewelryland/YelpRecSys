# -*- coding: utf-8 -*-
__author__ = 'Adward'

# Python utils imports
import os
import sys
from time import time
import sqlite3

# Standard scientific Python imports
import matplotlib.pyplot as plt
import numpy as np

# Import classifiers and performance metrics
from sklearn.preprocessing import *
from sklearn.metrics.pairwise import pairwise_distances
from minepy import MINE
from sklearn.cross_validation import ShuffleSplit
from sklearn.metrics import *
from sklearn.ensemble import ExtraTreesRegressor
from ..RecSys.feature_reformer import FeatureReformer

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
CODE_PATH = '/Users/Adward/Github/YelpRecSys/PreProcessing/'


# Loading samples from the database & pre-scale
flist1 = [
    'rstar',
    'brcnt',
    'bstar',
    'checkins',
    'compliments',
    'fans',
    'rdate',
    'urcnt',
    'ustar',
    'uvotes',
    'ysince',
    ]
# flist2 = ['avg_star_elite', 'avg_star_nonelite']
# flist3 = ['bstate']
flist4 = ['cas']
flist5 = ['tastes']

# fl = [(i, i+1) for i in range(len(flist1)+len(flist2))]
# fl += [(len(fl), len(fl)+13), (len(fl)+13, len(fl)+18), (len(fl)+18, len(fl)+23)]


def load_samples(n_comp=1):
    t = time()
    with sqlite3.connect(DB_PATH) as conn:
        # execute the script 'update_view' first if necessary
        X = np.column_stack((
            FeatureReformer(conn, 'r_samples', flist1).transform(),
            # Imputer(strategy='mean', axis=0).fit_transform(
            #     FeatureReformer(conn, 'r_samples', flist2).transform()
            # ),
            # FeatureReformer(conn, 'r_samples', flist3).transform('state'),
            FeatureReformer(conn, 'r_samples', flist4).transform('vector', n_components=n_comp),
            FeatureReformer(conn, 'r_samples', flist5).transform('vector', n_components=n_comp, impute=True),
        ))
    # n_samples, n_features = X.shape
    print(X.shape)
    print('Done with collecting & reforming data from database, using ', time()-t, 's')
    return X


def get_corrcoef(X):
    div = ShuffleSplit(X.shape[0], n_iter=1, test_size=0.05, random_state=0)
    for train, test in div:
        X = X[np.array(test)]
        break

    X = X.transpose()
    pcc = np.ones((X.shape[0], X.shape[0]))
    m = MINE()
    # feat_groups = [[0], [1, 2, 3], [4, 5, 7, 8, 9, 10], [6],
    #                list(range(11, 24)), list(range(24, 29)), list(range(29, 34))]
    t = time()
    for i in range(0, 1):
        for j in range(1, 20):
            m.compute_score(X[i], X[j])
            pcc[i, j] = pcc[j, i] = m.mic()  # np.corrcoef(X[i], X[j])[0, 1]
            print(i, j, pcc[i, j], time()-t)
    np.savetxt(os.path.join(CODE_PATH, 'feat_sim_pcc_2.csv'), pcc, fmt='%.3f', delimiter=',')
    print('Done with computing PCC,', 'using', time()-t, 's')

# for met in ['euclidean', 'l1', 'l2', 'correlation']:
#     t = time()
#     try:
#         pairwise_mat = pairwise_distances(X.transpose(), metric=met)
#         np.savetxt(os.path.join(CODE_PATH, 'feat_sim_'+met+'.csv'), pairwise_mat, fmt='%.3f', delimiter=',')
#     except:
#         pass
#     print('Done with computing pairwise distances of', met, ', using ', time()-t, 's')

# pm = np.loadtxt(os.path.join(CODE_PATH, 'feat_sim.csv'), delimiter=',')
# np.savetxt(os.path.join(CODE_PATH, 'feat_sim_1.csv'), pm, fmt='%.3f', delimiter=',')


def predict_with_one(X, out_file_name):
    n_samples, n_features = X.shape
    iter_num = 3
    div = ShuffleSplit(n_samples, n_iter=iter_num, test_size=0.2, random_state=0)
    model = ExtraTreesRegressor(n_estimators=5)
    score_matrix = np.zeros((n_features, n_features))

    t = time()
    round_num = 0
    for train, test in div:
        round_num += 1
        train_samples = X[np.array(train)]
        test_samples = X[np.array(test)]
        for i in range(n_features):
            for j in range(n_features):
                X_train = train_samples[:, i:i+1]
                X_test = test_samples[:, i:i+1]
                y_train = train_samples[:, j]
                y_test = test_samples[:, j]
        # for i in range(len(fl)):
        #     for j in range(len(fl)):
        #         if fl[j][1]-fl[j][0] != 1:
        #             continue
        #         X_train = train_samples[:, fl[i][0]:fl[i][1]]
        #         X_test = test_samples[:, fl[i][0]:fl[i][1]]
        #         y_train = train_samples[:, fl[j][0]]
        #         y_test = test_samples[:, fl[j][0]]
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                mae = mean_absolute_error(y_test, y_pred)
                score_matrix[i, j] += mae
                print('Round', round_num, '|', i, j, mae, time()-t)
    np.savetxt(os.path.join(CODE_PATH, out_file_name),
               score_matrix/iter_num, fmt='%.3f', delimiter=',')


if __name__ == '__main__':
    fname = sys.argv[1]
    try:
        if fname.split('.')[-1] != 'csv':
            raise ValueError()
    except:
        print('Need to be .csv file for output!')

    X = load_samples(1)
    # get_corrcoef(X)
    predict_with_one(X, fname)