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
from feature_reformer import FeatureReformer, over_sampling

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')


class RecScorer(object):
    def __init__(self, n_class=5):
        self.n_class = n_class
        self.round_cnt = n_class
        self.scores = {'f1_by_star': [[] for i in range(n_class)],
                       'f1_weighted': [],
                       'mae': [],
                       'rmse': []}

    def record(self, y_true, y_pred):
        f1_by_star = f1_score(y_true, y_pred, average=None)
        for i in range(self.n_class):
            self.scores['f1_by_star'][i].append(f1_by_star[i])
        # Calculate metrics for each label, and find their average, weighted by support
        # (the number of true instances for each label).
        # This alters ‘macro’ to account for label imbalance;
        # it can result in an F-score that is not between precision and recall.
        self.scores['f1_weighted'].append(f1_score(y_true, y_pred, average='weighted'))
        self.scores['mae'].append(mean_absolute_error(y_true, y_pred))
        self.scores['rmse'].append(mean_squared_error(y_true, y_pred) ** 0.5)
        print(classification_report(y_true, y_pred), '\n')

    def finalScores(self):
        print('F1-Score By Star Classes: %.3f | %.3f | %.3f | %.3f | %.3f'
              % tuple([np.array(star).mean() for star in self.scores['f1_by_star']]))
        print('F1-Score Weighted: %.3f' % (np.array(self.scores['f1_weighted']).mean()))
        print('MAE: %.3f' % (np.array(self.scores['mae']).mean()))
        print('RMSE: %.3f' % (np.array(self.scores['rmse']).mean()))

    def finalScoreObj(self):
        return {
            'f1': np.array(self.scores['f1_weighted']).mean(),
            'mae': np.array(self.scores['mae']).mean(),
            'rmse': np.array(self.scores['rmse']).mean()
        }


def two_stage_rbf(oversampling=(0, 0)):
    """
    :param oversampling: Tuple(Int), double review samples with star classes in range
    :return: None
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
            # FeatureReformer(conn, 'r_samples', ['bstate']).transform('state'),
        ))

    # oversampling
    ovsp = over_sampling(y5, oversampling)
    # ovsp = []
    # for i in range(len(y5)):
    #     if oversampling[0] <= y5[i] <= oversampling[1]:
    #         ovsp.append(i)
    # ovsp = np.array(list(range(len(y5))) + ovsp)
    X = X[ovsp]
    y2 = y2[ovsp]
    y5 = y5[ovsp]

    n_samples, n_features = X.shape
    print(X.shape)
    print('Done with collecting & reforming data from database, using ', time()-t, 's')

    # print('Starting 2-class pre-training...')
    rec_scorer = RecScorer(n_class=5)
    div = ShuffleSplit(n_samples, n_iter=5, test_size=0.2, random_state=0)
    model = ExtraTreesClassifier(n_estimators=5)
    t = time()
    for train, test in div:
        # pre-training (no need to calculate y2_test)
        X_train = X[np.array(train)]
        X_test = X[np.array(test)]
        y2_train = y2[np.array(train)]
        y5_train = y5[np.array(train)]
        y5_test = y5[np.array(test)]

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
        rec_scorer.record(y_true=y5_true, y_pred=y5_pred)
        print(time()-t, 's used >>\n')

    print('Done with 5-fold training & cross validating, using ', time()-t, 's')
    rec_scorer.finalScores()


def binary_cbf(oversampling=(0, 0)):
    """
    :param oversampling: Tuple(Int), double review samples with star classes in range
    :return: None
    """
    t = time()
    with sqlite3.connect(DB_PATH) as conn:
        y = FeatureReformer(conn, 'r_samples', ['rstar']).transform('y2').transpose()[0]
        X = FeatureReformer(conn, 'r_samples', [
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
                ]).transform()

        # oversampling
        ovsp = over_sampling(y, oversampling)
        y = y[ovsp]
        X = X[ovsp]

        n_samples, n_features = X.shape
        print(X.shape)
        print('Done with collecting & reforming data from database, using ', time()-t, 's')
        t = time()
        rec_scorer = RecScorer(n_class=2)
        div = ShuffleSplit(n_samples, n_iter=5, test_size=0.2, random_state=0)
        model = ExtraTreesClassifier(n_estimators=5)
        for train, test in div:
            X_train = X[np.array(train)]
            X_test = X[np.array(test)]
            y_train = y[np.array(train)]
            y_test = y[np.array(test)]
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            # Metrics below
            rec_scorer.record(y_true=y_test, y_pred=y_pred)
            # print(confusion_matrix(y_true=y_test, y_pred=y_pred), '\n', time()-t, 's used >>\n')
            print(time()-t, 's used >>\n')

        print('Done with 5-fold training & cross validating, using ', time()-t, 's')
        rec_scorer.finalScores()

if __name__ == '__main__':
    # n_iter_num = int(sys.argv[1])
    two_stage_rbf(oversampling=(3, 5))
    # binary_cbf(oversampling=(4, 5))
