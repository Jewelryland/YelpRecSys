# -*- coding: utf-8 -*-
__author__ = 'Adward'

# Python utils imports
import os
import sys
from time import time
import sqlite3

# Standard scientific Python imports
import numpy as np
from scipy.sparse import csr_matrix, hstack, coo_matrix
import scipy.sparse as sp

# Import classifiers and performance metrics
from sklearn.preprocessing import *
from sklearn.cross_validation import StratifiedKFold, ShuffleSplit
from sklearn.metrics import *
from sklearn.decomposition import TruncatedSVD
from scipy.io import mmread

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
review_n = 2225213
user_n = 552339
business_n = 77445


def save_sparse_csr(filename, array):
    np.savez(filename, data=array.data, indices=array.indices,
             indptr=array.indptr, shape=array.shape)


def load_sparse_csr(filename):
    loader = np.load(filename)
    return csr_matrix((loader['data'], loader['indices'],
                       loader['indptr']), shape=loader['shape'])


def gen_sparse_rate_matrix(train, *test):
    train_idxs = None
    test_idxs = None
    if test:
        train_idxs = train[0]
        test_idxs = test[0]

    with sqlite3.connect(DB_PATH) as conn:
        cur_r = conn.execute('SELECT business_id, user_id, stars FROM review')
        reviews = cur_r.fetchall()
        if test:
            train_reviews = np.array(reviews)[np.array(train_idxs)]
            test_reviews = np.array(reviews)[np.array(test_idxs)]
        else:
            train_reviews = np.array(reviews)
            test_reviews = None

        cur = conn.execute('SELECT user_id FROM user')
        uid_idx = {}
        line_n = 0
        for row in cur:
            uid_idx[row[0]] = line_n
            line_n += 1

        train_sparse_matrixs = []
        test_sparse_matrixs = []
        cur = conn.execute('SELECT business_id FROM business')
        while True:
            bs = cur.fetchmany(5000)
            if len(bs) == 0:
                break
            line_n = 0
            bid_idx = {}
            for b in bs:
                bid_idx[b[0]] = line_n
                line_n += 1

            R_train = np.zeros((user_n, line_n))
            for r in train_reviews:
                if r[0] in bid_idx:
                    R_train[uid_idx[r[1]], bid_idx[r[0]]] = r[2]
            if test:
                R_test = np.zeros((user_n, line_n))
                for r in test_reviews:
                    if r[0] in bid_idx:
                        R_test[uid_idx[r[1]], bid_idx[r[0]]] = r[2]
            else:
                R_test = None

            t = time()
            train_sparse_matrixs.append(csr_matrix(R_train))
            if test:
                test_sparse_matrixs.append(csr_matrix(R_test))
            print(time()-t)

    print('Start stacking matrixs...')
    sp_r_matrix_train = hstack(train_sparse_matrixs)
    np.save(train[1], sp_r_matrix_train)
    if test:
        sp_r_matrix_test = hstack(test_sparse_matrixs)
        np.save(test[1], sp_r_matrix_test)


class NaiveSVD(object):
    def __init__(self, n_components=2, random_state=None):
        self.svd = TruncatedSVD(n_components=n_components, random_state=random_state)
        self.U = None
        self.B = None
        self.nonzero_n_train = 0
        self.nonzero_n_test = 0
        self.miu_global = 0
        self.miu_u = None
        self.miu_b = None

    def predict(self, R_test):
        r_pred = np.zeros((self.nonzero_n_test, ))
        for k in range(self.nonzero_n_test):
            i = R_test.row[k]
            j = R_test.col[k]
            ui = self.U[i, :]
            vi = self.B[:, j]
            r_pred[k] = round(ui.dot(vi) + self.miu_b[j] + self.miu_u[i] - self.miu_global)
            if r_pred[k] < 1:
                r_pred[k] = 1
            elif r_pred[k] > 5:
                r_pred[k] = 5
        return r_pred

    def fit(self, R_train, R_test=None):
        if sp.issparse(R_train) and R_train.getformat() not in ["csr"]:
            R_train = R_train.tocsr()
        self.nonzero_n_train = R_train.data.shape[0]

        # mean normalization
        sums = R_train.sum(0)  # 1 * business_n
        nnzs = R_train.getnnz(0)
        self.miu_b = np.zeros((business_n, ))
        for j in range(business_n):
            nz = nnzs[j]
            if nz:
                self.miu_b[j] = sums[0, j] / nz
        sums = R_train.sum(1)  # user_n * 1
        nnzs = R_train.getnnz(1)
        self.miu_u = np.zeros((user_n, ))
        for i in range(user_n):
            nz = nnzs[i]
            if nz:
                self.miu_u[i] = sums[i, 0] / nz
        self.miu_global = int(sum(sums) / sum(nnzs))
        # print('miu', miu_global)
        R_train_csc = R_train.tocsc()
        for k in range(self.nonzero_n_train):
            R_train.data[k] -= self.miu_b[R_train.indices[k]] + \
                               self.miu_u[R_train_csc.indices[k]] - self.miu_global

        # training
        self.svd.fit(R_train)
        self.B = self.svd.components_
        self.U = self.svd.transform(R_train)  # numpy.ndarray

        # predicting
        if R_test is None:
            return
        self.predict_and_score(R_test)

    def predict_and_score(self, R_test):
        if sp.issparse(R_test) and R_test.getformat() not in ["coo"]:
            R_test = R_test.tocoo()
        self.nonzero_n_test = R_test.data.shape[0]
        r_pred = self.predict(R_test)

        # scoring
        rmse = mean_squared_error(y_true=R_test.data, y_pred=r_pred) ** 0.5
        mae = mean_absolute_error(y_true=R_test.data, y_pred=r_pred)
        print(rmse, mae)
        print(classification_report(R_test.data, r_pred))

    def gen_latent_feature_space(self, n_components=1):
        if self.B is None:
            raise ValueError("Must be executed after SVD model is fitted. ")

        with sqlite3.connect(DB_PATH) as conn:
            cur = conn.execute('SELECT user_id FROM user')
            uid_idx = {}
            line_n = 0
            for row in cur:
                uid_idx[row[0]] = line_n
                line_n += 1

            cur = conn.execute('SELECT business_id FROM business')
            bid_idx = {}
            line_n = 0
            for row in cur:
                bid_idx[row[0]] = line_n
                line_n += 1

            cur_r = conn.execute('SELECT business_id, user_id FROM review')
            X_part = np.array([np.append(self.B[:, bid], self.U[uid, :])
                               for bid, uid in cur_r])
            return X_part


if __name__ == '__main__':
    # div = ShuffleSplit(review_n, n_iter=1, test_size=0.2, random_state=0)
    # for train, test in div:
    #     gen_sparse_rate_matrix((train, 'r_matrix_train'), (test, 'r_matrix_test'))

    gen_sparse_rate_matrix((None, 'r_matrix'))

    # R_train = np.load('r_matrix_train.npy')[()].tocsr()
    # R_test = np.load('r_matrix_test.npy')[()]  # coo_matrix
    #
    # for n_comp in range(1, 2):
    #     t = time()
    #     svd = NaiveSVD(n_components=1)
    #     svd.fit(R_train, R_test)
    #     print('End training using SVD after', time()-t, 's')