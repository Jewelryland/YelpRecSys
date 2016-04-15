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

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
n_sample = 2225213  # 1992542
review_class = [260492, 190048, 282115, 591618, 900940]  # 2.6:1.9:2.8:5.9:9.0
earliest = {'day': 20041018, 'month': 200410, 'year': 2004}
latest = {'day': 20151224, 'month': 201512, 'year': 2015}
valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


# Loading samples from the database & pre-scale
def load_samples(attr_list, prescale=False, oversampling=(0, 0), elite_expand=False, state_all=False):
    '''

    :param attr_list: List[Str], containing the list of features to be selected and encoded
    :param prescale: Bool, (when True) pre-scale features with too large range of values to expedite converging
    :param oversampling: Tuple(Int), double review samples with star classes in range
    :param elite_expand: Bool, (when True) encode 12 features related to user.elite as [elite20**] & elite-year-sum;
        (when False) only 1 feature stands for elite-year-sum
    :param state_all: Bool, (when True) occupies 39 features; (when False) using only 12 prime states PLUS OTHERS
    :return: List[Dict], List[Int]
    '''
    t = time()
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT ' + ",".join(attr_list) + ' FROM ((review JOIN business USING (business_id)) '
                                                             'JOIN (user NATURAL JOIN user_reside) USING (user_id))')
        sample_matrix = []  # feature matrix to return
        targets = []  # class vector
        row_num = 0

        for row in cur:
            targets.append(row[0])  # review.stars
            # construct temp feature dict
            sample = {}
            for j in range(1, len(attr_list)):
                sample[attr_list[j]] = row[j]

            # pre-scale features with too wide range of values
            if prescale:
                sample['yelping_since'] /= earliest['year']
                sample['review_date'] /= earliest['month']

            # encode features for business.state
            if ('business.state' in attr_list) and (not state_all) and (sample['business.state'] not in valid_states):
                sample['business.state'] = 'OTH'  # other 17 states with few business recorded
            if ('user_state' in attr_list) and (not state_all) and (sample['user_state'] not in valid_states):
                sample['user_state'] = 'OTH'

            # Create elite-related features || encode elite-year-number
            if elite_expand:
                for year in range(earliest['year']+1, latest['year']+1):
                    sample['elite'+str(year)] = 0
                if len(sample['elite']):
                    elite_years = [int(y) for y in sample['elite'].split('&')]
                    sample['elite'] = len(elite_years)
                    for year in elite_years:
                        sample['elite'+str(year)] = 1
                else:
                    sample['elite'] = 0
            else:
                if len(sample['elite']):
                    sample['elite'] = len(sample['elite'].split('&'))
                else:
                    sample['elite'] = 0

            # encode business.categories features
            # sample['categories'] =
            # process control & display
            row_num += 1
            # print(sample)
            if row_num % 100000 == 0:
                print("%.1f %%" % (row_num * 100 / n_sample))

            sample_matrix.append(sample)
            # oversampling some review star classes
            if oversampling[0] <= targets[-1] <= oversampling[1]:
                sample_matrix.append(sample)
                targets.append(targets[-1])
            # if row_num == 10000:
            #    break

    print('Done with joining & collecting data from database, using ', time()-t, 's')
    return sample_matrix, targets


def reform_features(sample_matrix, scaling=False):
    t = time()
    print('Starting reforming categorical features using OneHotDecoding...')
    dictVectorizer = DictVectorizer()
    X = dictVectorizer.fit_transform(sample_matrix).toarray()
    n_features = len(X[0])
    if scaling:
        # scaler = StandardScaler()
        # X = scaler.fit_transform(X)
        X = scale(X)
    print('Feature Num.:', n_features)
    # target = np.array(targets)
    print('Done with reforming categorical features, using ', time()-t, 's')
    return X, n_features


def train_and_predict(X, y, div, model, n_features):
    print('Starting 5-fold training & cross validating...')
    # input()
    # scores = cross_validation.cross_val_score(clf, data, target, cv=2, scoring='f1_weighted')
    t = time()
    scores = {'f1_by_star': [[] for i in range(5)], 'f1_weighted': [], 'mae': [], 'rmse': []}
    feature_weights = np.zeros(n_features)
    for train, test in div:
        X_train = np.array([X[i] for i in train])
        X_test = np.array([X[i] for i in test])
        y_train = np.array([y[i] for i in train])
        y_test = np.array([y[i] for i in test])
        model.fit(X_train, y_train)
        feature_weights += model.feature_importances_
        y_pred = model.predict(X_test)

        # Metrics below
        f1_by_star = f1_score(y_true=y_test, y_pred=y_pred, average=None)
        for i in range(5):
            scores['f1_by_star'][i].append(f1_by_star[i])
        # Calculate metrics for each label, and find their average, weighted by support
        # (the number of true instances for each label).
        # This alters ‘macro’ to account for label imbalance;
        # it can result in an F-score that is not between precision and recall.
        scores['f1_weighted'].append(f1_score(y_true=y_test, y_pred=y_pred, average='weighted'))
        scores['mae'].append(mean_absolute_error(y_true=y_test, y_pred=y_pred))
        scores['rmse'].append(mean_squared_error(y_true=y_test, y_pred=y_pred) ** 0.5)
        print(classification_report(y_true=y_test, y_pred=y_pred), '\n')
        print(confusion_matrix(y_true=y_test, y_pred=y_pred), '\n', time()-t, 's used >>\n')
    # scores = np.array(scores)
    # print("Accuracy: %0.2f (+/- %0.2f)" % (scores.mean(), scores.std() * 2))
    print('Done with 5-fold training & cross validating, using ', time()-t, 's')
    print('F1-Score By Star Classes: %.3f | %.3f | %.3f | %.3f | %.3f'
          % tuple([np.array(star).mean() for star in scores['f1_by_star']]))
    print('F1-Score Weighted: %.3f' % (np.array(scores['f1_weighted']).mean()))
    print('MAE: %.3f' % (np.array(scores['mae']).mean()))
    print('RMSE: %.3f' % (np.array(scores['rmse']).mean()))
    feature_weights /= 5
    # print(feature_weights)
    for i in range(n_features):
        print('%.1f' % feature_weights[i]*100),

if __name__ == '__main__':
    attr_list = [
        'review.stars',  # target value, must be placed at this first place
        'average_stars',
        # 'business.city', # occupies 380 features
        'business.stars',
        'business.state',  # occupies 29 -> 13 features
        'business.review_count',
        # 'categories',  # occupies 890 features
        'checkins',
        'compliments',
        'elite',  # occupies 12 -> 1 feature(s)
        'fans',
        'review.votes',
        'review_date',
        'user.review_count',
        'user.votes',
        # 'user_state',
        'weekends_open',  # binary
        'yelping_since',
        ]
    samples, targets = load_samples(attr_list, prescale=False, oversampling=(1, 4), state_all=True)
    samples, n_features = reform_features(samples, scaling=False)
    n_samples = len(samples)  # may be different from original n_sample in db !
    print('n_samples:', n_samples)
    # div = StratifiedKFold(targets, n_folds=5)  # 5-Fold Cross Validation
    div = ShuffleSplit(n_samples, n_iter=5, test_size=0.2, random_state=0)
    model = RandomForestClassifier(n_estimators=5, max_features='auto')  # int(math.sqrt(n_features)))
    # model = GradientBoostingClassifier(n_estimators=5, learning_rate=1, max_depth=2, random_state=0)
    train_and_predict(samples, targets, div, model, n_features)