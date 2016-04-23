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
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
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
    :param attr_list: List[Str], containing the list of features to be selected and encoded
    :param oversampling: Tuple(Int), double review samples with star classes in range
    :return: List[Dict], List[Int]
    """
    t = time()
    with sqlite3.connect(DB_PATH) as conn:
        # execute the script 'update_view' first if necessary
        X = np.column_stack((
            FeatureReformer(conn, 'r_samples', [
                'rstar',
                # 'avg_star_elite',
                # 'avg_star_nonelite',
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
            # FeatureReformer(conn, 'r_samples', ['cas']).transform('vector', n_components=10),
            # FeatureReformer(conn, 'r_samples', ['tastes']).transform('vector', n_components=1, impute=True),
        ))

        # oversampling
        ovsp = []
        for i in range(X.shape[0]):
            if oversampling[0] <= X[i, 0] <= oversampling[1]:
                ovsp.append(i)
        ovsp = np.array(list(range(X.shape[0])) + ovsp)
        X = X[ovsp]

        # extract target(y)
        y = X[:, 0]
        X = X[:, 1:]
        n_samples, n_features = X.shape
        print(X.shape)
        print('Done with collecting & reforming data from database, using ', time()-t, 's')
        return X, y, n_samples, n_features


def train_and_predict(X, y, div, model, n_features):
    print('Starting 5-fold training & cross validating...')
    # input()
    # scores = cross_validation.cross_val_score(clf, data, target, cv=2, scoring='f1_weighted')
    t = time()
    scores = {'mae': [], 'rmse': []}
    feature_weights = np.zeros(n_features)
    for train, test in div:
        X_train = X[np.array(train)]
        X_test = X[np.array(test)]
        y_train = y[np.array(train)]
        y_test = y[np.array(test)]
        model.fit(X_train, y_train)
        feature_weights += model.feature_importances_
        y_pred = model.predict(X_test)

        # Metrics below
        scores['mae'].append(mean_absolute_error(y_true=y_test, y_pred=y_pred))
        scores['rmse'].append(mean_squared_error(y_true=y_test, y_pred=y_pred) ** 0.5)
        print(classification_report(y_true=y_test, y_pred=y_pred), '\n')
        # print(confusion_matrix(y_true=y_test, y_pred=y_pred), '\n', time()-t, 's used >>\n')
        print(time()-t, 's used >>\n')

    # scores = np.array(scores)
    # print("Accuracy: %0.2f (+/- %0.2f)" % (scores.mean(), scores.std() * 2))
    print('Done with 5-fold training & cross validating, using ', time()-t, 's')
    print('MAE: %.3f' % (np.array(scores['mae']).mean()))
    print('RMSE: %.3f' % (np.array(scores['rmse']).mean()))
    feature_weights /= len(div)
    # print(feature_weights)
    for i in range(n_features):
        print('%.1f' % (feature_weights[i] * 100), end=' '),

if __name__ == '__main__':
    n_iter_num = int(sys.argv[1])
    samples, targets, n_samples, n_features = load_samples(oversampling=(1, 4))
    div = ShuffleSplit(n_samples, n_iter=n_iter_num, test_size=0.2, random_state=0)
    # model = RandomForestClassifier(n_estimators=5)  # max_features='auto'; int(math.sqrt(n_features)))
    model = ExtraTreesClassifier(n_estimators=5)
    # model = GradientBoostingClassifier(n_estimators=5, learning_rate=1, max_depth=2, random_state=0)
    train_and_predict(samples, targets, div, model, n_features)
