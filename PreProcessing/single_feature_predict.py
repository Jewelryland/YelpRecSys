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
from sklearn.cross_validation import ShuffleSplit
from sklearn.metrics import *
# from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor
from feature_reformer import FeatureReformer

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_review = 2225213  # 1992542
n_review_o = 3549486
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


# Loading samples from the database & pre-scale
def load_samples_and_predict(attr_list, y, div, opt='default'):
    with sqlite3.connect(DB_PATH) as conn:
        X = FeatureReformer(conn, 'r_samples', attr_list).transform(opt)
        # n_samples, n_features = X.shape
    # oversampling
    X_os = []
    y_os = []
    for i in range(X.shape[0]):
        if y[i] != 5:
            X_os.append(X[i])
            y_os.append(y[i])
    X = np.row_stack((X, np.array(X_os)))
    y = np.array(list(y) + y_os)

    model = ExtraTreesRegressor(n_estimators=5)
    if len(attr_list) > 1:
        for i in range(len(attr_list)):
            t = time()
            train_and_predict(X[:, i:i+1], y, div, model)
            print('End evaluating {', attr_list[i], '}, using', time()-t, 's')
    else:
        t = time()
        train_and_predict(X, y, div, model)
        print('End evaluating {', attr_list[0], '}, using', time()-t, 's')

def load_targets():
    with sqlite3.connect(DB_PATH) as conn:
        y = FeatureReformer(conn, 'review', ['stars']).transform('1d')
        return y


def train_and_predict(X, y, div, model):
    scores = {'f1_by_star': [[] for i in range(5)], 'f1_weighted': [], 'mae': [], 'rmse': []}
    # feature_weights = np.zeros(n_features)
    for train, test in div:
        X_train = np.array([X[i] for i in train])
        X_test = np.array([X[i] for i in test])
        y_train = np.array([y[i] for i in train])
        y_test = np.array([y[i] for i in test])
        model.fit(X_train, y_train)
        # feature_weights += model.feature_importances_
        y_pred = model.predict(X_test)

        # Metrics below
        # f1_by_star = f1_score(y_true=y_test, y_pred=y_pred, average=None)
        # for i in range(5):
        #     scores['f1_by_star'][i].append(f1_by_star[i])
        # # Calculate metrics for each label, and find their average, weighted by support
        # # (the number of true instances for each label).
        # scores['f1_weighted'].append(f1_score(y_true=y_test, y_pred=y_pred, average='weighted'))
        scores['mae'].append(mean_absolute_error(y_true=y_test, y_pred=y_pred))
        scores['rmse'].append(mean_squared_error(y_true=y_test, y_pred=y_pred) ** 0.5)
        # print(classification_report(y_true=y_test, y_pred=y_pred), '\n')
        # print(confusion_matrix(y_true=y_test, y_pred=y_pred), '\n', time()-t, 's used >>\n')

    # scores = np.array(scores)
    # print("Accuracy: %0.2f (+/- %0.2f)" % (scores.mean(), scores.std() * 2))
    # print('F1-Score By Star Classes: %.3f | %.3f | %.3f | %.3f | %.3f'
    #       % tuple([np.array(star).mean() for star in scores['f1_by_star']]))
    # print('F1-Score Weighted: %.3f' % (np.array(scores['f1_weighted']).mean()))
    print('MAE: %.3f' % (np.array(scores['mae']).mean()))
    print('RMSE: %.3f' % (np.array(scores['rmse']).mean()))
    # feature_weights /= len(div)
    # print(feature_weights)
    # for i in range(n_features):
    #    print('%.1f' % (feature_weights[i] * 100), end=' '),

if __name__ == '__main__':
    # with sqlite3.connect(DB_PATH) as conn:
    #     conn.execute('DROP VIEW IF EXISTS r_samples')
    #     cur = conn.execute('CREATE VIEW r_samples AS '
    #                        'SELECT review.stars AS rstar, average_stars AS ustar, b_view.stars AS bstar, '
    #                        'b_view.review_count AS brcnt, b_view.state AS bstate, checkins, compliments, fans, '
    #                        'review_date AS rdate, u_view.review_count AS urcnt, '
    #                        'u_view.votes AS uvotes, yelping_since AS ysince, cas, tastes '
    #                        'FROM '
    #                        '(review JOIN b_view'
    #                        '   USING (business_id)) '
    #                        'JOIN u_view USING (user_id)')

    div = ShuffleSplit(n_review, n_iter=5, test_size=0.2, random_state=0)
    y = load_targets()
    # n_iter_num = int(sys.argv[1])
    load_samples_and_predict([
        'brcnt',
        'bstar',
        'checkins',
        'compliments',
        'fans',
        # 'rvotes',
        'rdate',
        'urcnt',
        'ustar',
        'uvotes',
        'ysince',
        ], y, div)
    load_samples_and_predict(['bstate'], y, div, opt='state')
    # features that occupy more than a column cannot be concatenate selected
    load_samples_and_predict(['cas'], y, div, opt='vector')
    load_samples_and_predict(['tastes'], y, div, opt='vector')
