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
    r_matrix_train = np.load('r_matrix_train.npy')[()]  # coo_matrix
    r_matrix_test = np.load('r_matrix_test.npy')[()]

    # print(sp_col.sum() / sp_col.getnnz())
    # R = r_matrix_train.tocsc()  # .toarray()  # u_n * b_n
    # print(R.shape)
    # t = time()
    # for j in range(R.shape[1]):
    #     R[:, j] -= R[:, j].mean()
    # print(R)
    # print(time()-t)


    # scaler = StandardScaler(with_mean=True, with_std=False)
    # scaler.fit(R)
    # print(scaler.mean_, len(scaler.mean_))
    # r_matrix_train = scaler.transform(r_matrix_train)

    t = time()
    svd.fit(r_matrix_train)
    B = svd.components_
    U = svd.transform(r_matrix_train)  # numpy.ndarray
    # save_sparse_csr('user_latent_space', csr_matrix(user_lfs))
    # save_sparse_csr('business_latent_space', csr_matrix(business_lfs))
    print(time()-t)

    # print(user_lfs.shape, business_lfs.shape)
    # print(type(user_lfs), type(business_lfs))

    # U = load_sparse_csr('user_latent_space.npz')
    # B = load_sparse_csr('business_latent_space.npz')
    # sp_r_matrix_test = np.load('r_matrix_test.npy')[()]
    non_zero_n = r_matrix_test.data.shape[0]
    r_pred = np.zeros((non_zero_n, ))

    for k in range(non_zero_n):
        i = r_matrix_test.row[k]
        j = r_matrix_test.col[k]
        ui = U[i, :]
        vi = B[:, j]
        r_pred[k] = ui.dot(vi)  # + scaler.mean_[j]

    print(r_pred)
    rmse = mean_squared_error(y_true=r_matrix_test.data, y_pred=r_pred) ** 0.5
    mae = mean_absolute_error(y_true=r_matrix_test.data, y_pred=r_pred)
    print(rmse, mae)

