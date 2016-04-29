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


def gen_sparse_rate_matrix(train_idxs, test_idxs):
    with sqlite3.connect(DB_PATH) as conn:
        cur_r = conn.execute('SELECT business_id, user_id, stars FROM review')
        reviews = cur_r.fetchall()
        train_reviews = np.array(reviews)[np.array(train)]
        test_reviews = np.array(reviews)[np.array(test)]

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

            r_matrix_train = np.zeros((user_n, line_n))
            r_matrix_test = np.zeros((user_n, line_n))
            for r in train_reviews:
                if r[0] in bid_idx:
                    r_matrix_train[uid_idx[r[1]], bid_idx[r[0]]] = r[2]
            for r in test_reviews:
                if r[0] in bid_idx:
                    r_matrix_test[uid_idx[r[1]], bid_idx[r[0]]] = r[2]
            t = time()
            train_sparse_matrixs.append(csr_matrix(r_matrix_train))
            test_sparse_matrixs.append(csr_matrix(r_matrix_test))
            print(time()-t)

    print('Start stacking matrixs...')
    sp_r_matrix_train = hstack(train_sparse_matrixs)
    np.save('r_matrix_train', sp_r_matrix_train)
    sp_r_matrix_test = hstack(test_sparse_matrixs)
    np.save('r_matrix_test', sp_r_matrix_test)


if __name__ == '__main__':
    # div = ShuffleSplit(review_n, n_iter=1, test_size=0.2, random_state=0)
    # for train, test in div:
    #     gen_sparse_rate_matrix(train, test)

    svd = TruncatedSVD(n_components=5, random_state=42)
    r_matrix_train = np.load('r_matrix_train.npy')[()].tocsr()
    r_matrix_test = np.load('r_matrix_test.npy')[()]  # coo_matrix

    # mean normalization
    sums = r_matrix_train.sum(0)
    nnzs = r_matrix_train.getnnz(0)
    means = np.zeros((business_n, ))
    for j in range(business_n):
        nz = nnzs[j]
        if nz:
            means[j] = sums[0, j] / nz
    for j in range(business_n):
        r_matrix_train.data[j] -= means[r_matrix_train.indices[j]]

    # training
    t = time()
    svd.fit(r_matrix_train)
    B = svd.components_
    U = svd.transform(r_matrix_train)  # numpy.ndarray
    print('End training using SVD after', time()-t, 's')

    # predicting
    non_zero_n = r_matrix_test.data.shape[0]
    r_pred = np.zeros((non_zero_n, ))

    for k in range(non_zero_n):
        i = r_matrix_test.row[k]
        j = r_matrix_test.col[k]
        ui = U[i, :]
        vi = B[:, j]
        r_pred[k] = round(ui.dot(vi) + means[j])

    # scoring
    print(r_pred)
    rmse = mean_squared_error(y_true=r_matrix_test.data, y_pred=r_pred) ** 0.5
    mae = mean_absolute_error(y_true=r_matrix_test.data, y_pred=r_pred)
    print(rmse, mae)
