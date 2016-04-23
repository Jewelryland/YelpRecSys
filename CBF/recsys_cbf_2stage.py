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
from sklearn.cross_validation import StratifiedKFold, ShuffleSplit
from sklearn.metrics import *
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.decomposition import PCA
from feature_reformer import FeatureReformer

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_sample = 2225213  # 1992542
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


# Loading samples from the database & pre-scale
def load_samples(oversampling=(0, 0)):
    """
    :param oversampling: Tuple(Int), double review samples with star classes in range
    :return: List[Dict], List[Int]
    """
    t = time()
    with sqlite3.connect(DB_PATH) as conn:
        y5 = FeatureReformer(conn, 'r_samples', ['rstar']).transform().transpose()[0]
        y2 = FeatureReformer(conn, 'r_samples', ['rstar']).transform('y2').transpose()[0]
        # X.append(FeatureReformer(conn, 'r_samples', ['cas']).b_cas_reformer(10))
        # X.append(FeatureReformer(conn, 'r_samples', ['tastes']).b_cas_reformer(1, True))
        X = np.column_stack((
            FeatureReformer(conn, 'r_samples', [
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
                ]).transform(),
            FeatureReformer(conn, 'r_samples', ['bstate']).transform('state'),
        ))

        # oversampling
        ovsp = []
        for i in range(len(y5)):
            if oversampling[0] <= y5[i] <= oversampling[1]:
                ovsp.append(i)
        ovsp = np.array(list(range(len(y5))) + ovsp)
        X = X[ovsp]
        y2 = y2[ovsp]
        y5 = y5[ovsp]
        #         X_os.append(X[i])
        # X_os, y5_os, y2_os = [], [], []
        # for i in range(len(y5)):
        #     if oversampling[0] <= y5[i] <= oversampling[1]:
        #         X_os.append(X[i])
        #         y2_os.append(y2[i])
        #         y5_os.append(y5[i])
        # X = np.row_stack((X, np.array(X_os)))
        # y2 = np.array(list(y2) + y2_os)
        # y5 = np.array(list(y5) + y5_os)

        n_samples, n_features = X.shape
        print(X.shape)
        print('Done with collecting & reforming data from database, using ', time()-t, 's')

        # print('Starting 2-class pre-training...')
        n_class = 5
        scores = {'f1_by_star': [[] for i in range(n_class)], 'f1_weighted': [], 'mae': [], 'rmse': []}
        # feature_weights = np.zeros(n_features)
        t = time()
        div = ShuffleSplit(n_samples, n_iter=5, test_size=0.2, random_state=0)
        for train, test in div:
            # pre-training
            X_train = X[np.array(train)]
            X_test = X[np.array(test)]
            y2_train = y2[np.array(train)]
            # y2_test = np.array([y2[i] for i in test])
            y5_train = y5[np.array(train)]
            y5_test = y5[np.array(test)]

            model = ExtraTreesClassifier(n_estimators=5)
            model.fit(X_train, y2_train)
            y2_pred = model.predict(X_test)

            print('Pre-training part:', time()-t)

            train_bad, train_good, test_bad, test_good = [], [], [], []
            for idx in range(len(y5_train)):
                if y5_train[idx] >= 4:
                    train_good.append(idx)
                else:
                    train_bad.append(idx)
            for idx in range(len(y2_pred)):
                if y2_pred[idx]:
                    test_good.append(idx)
                else:
                    test_bad.append(idx)
            train_bad = np.array(train_bad)
            train_good = np.array(train_good)
            test_bad = np.array(test_bad)
            test_good = np.array(test_good)

            model.fit(X_train[train_bad], y5_train[train_bad])
            # feature_weights += model.feature_importances_
            y5_pred_0 = model.predict(X_test[test_bad])
            model.fit(X_train[train_good], y5_train[train_good])
            y5_pred_1 = model.predict(X_test[test_good])
            y5_pred = np.append(y5_pred_0, y5_pred_1)
            y5_true = np.append(y5_test[test_bad], y5_test[test_good])

            # Metrics below
            f1_by_star = f1_score(y_true=y5_true, y_pred=y5_pred, average=None)
            for i in range(n_class):
                scores['f1_by_star'][i].append(f1_by_star[i])
            scores['f1_weighted'].append(f1_score(y_true=y5_true, y_pred=y5_pred, average='weighted'))
            scores['mae'].append(mean_absolute_error(y_true=y5_true, y_pred=y5_pred))
            scores['rmse'].append(mean_squared_error(y_true=y5_true, y_pred=y5_pred) ** 0.5)
            print(classification_report(y_true=y5_true, y_pred=y5_pred), '\n')
            print(time()-t, 's used >>\n')

        print('Done with 5-fold training & cross validating, using ', time()-t, 's')
        print('F1-Score By Star Classes: %.3f | %.3f | %.3f | %.3f | %.3f'
          % tuple([np.array(star).mean() for star in scores['f1_by_star']]))
        print('F1-Score Weighted: %.3f' % (np.array(scores['f1_weighted']).mean()))
        print('MAE: %.3f' % (np.array(scores['mae']).mean()))
        print('RMSE: %.3f' % (np.array(scores['rmse']).mean()))


if __name__ == '__main__':
    # n_iter_num = int(sys.argv[1])
    load_samples(oversampling=(3, 5))
