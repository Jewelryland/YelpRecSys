# -*- coding: utf-8 -*-
__author__ = 'Adward'

# Python utils imports
import os
import sys
from time import time
import sqlite3

# Standard scientific Python imports
import numpy as np
import scipy.sparse as sp
from scipy.sparse import csr_matrix, hstack, coo_matrix
from scipy.sparse.linalg import svds

# Import classifiers and performance metrics
from sklearn.preprocessing import *
from sklearn.cross_validation import StratifiedKFold, ShuffleSplit
from sklearn.metrics import *
from sklearn.decomposition import TruncatedSVD
import warnings

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')
# review_n = 2225213
# user_n = 552339
# business_n = 77445


class SVDPlusPlus(object):
    def __init__(self, n_components=2, max_iter=5, random_state=None, tol=0.1):
        self.n_components = n_components
        self.max_iter = max_iter
        self.random_state = random_state
        self.tol = tol
        self.P = None
        self.Q = None
        self.bias_i = None
        self.bias_u = None
        self.item_weights = None
        self.miu = 0

    # def fit(self, X, y=None):
    #     self.fit_transform(X)
    #     return self

    def fit(self, X, R_test=None, lambda_=0.0004, gamma=0.0001, verbose=False, warm_start=True):
        warnings.filterwarnings('error')
        # If sparse and not csr or csc, convert to csr
        if sp.issparse(X) and X.getformat() not in ["csr", "csc"]:
            X = X.tocsr()

        k = self.n_components
        n_user, n_item = X.shape
        if k >= n_item:
            raise ValueError("n_components must be < n_features;"
                             "got %d >= %d" % (k, n_item))

        print("init item & user biases vectors, together with global means...") if verbose else None
        self.miu = X.sum(0).sum() / X.getnnz(0).sum()  # global average of ratings
        for row in range(len(X.data)):
            X.data[row] -= self.miu

        sums = X.sum(0)  # 1 x item_n
        nnzs = X.getnnz(0)
        self.bias_i = np.zeros((n_item, ))
        for j in range(n_item):
            nz = nnzs[j]
            if nz:
                self.bias_i[j] = sums[0, j] / nz

        sums = X.sum(1)  # user_n x 1
        nnzs = X.getnnz(1)
        self.bias_u = np.zeros((n_user, ))
        for i in range(n_user):
            nz = nnzs[i]
            if nz:
                self.bias_u[i] = sums[i, 0] / nz

        print("extract global and local biases from data...") if verbose else None
        X_csc = X.tocsc()
        for row in range(len(X.data)):
            X.data[row] -= \
                self.bias_i[X.indices[row]] + self.bias_u[X_csc.indices[row]] + self.miu

        print("init latent factor dense matrix P, Q...") if verbose else None
        if warm_start:
            svd = TruncatedSVD(n_components=self.n_components)
            svd.fit(X)
            self.P = svd.transform(X)  # numpy.ndarray
            self.Q = svd.components_.T
        else:
            self.P = np.random.randn(n_user, k) / 1e5
            self.Q = np.random.randn(n_item, k) / 1e5

        print("init movie weights dense matrix (n_item x k)...") if verbose else None
        self.item_weights = np.random.randn(n_item, k) / 1e5

        print("start gradient descent of svd++...") if verbose else None
        for step in range(self.max_iter):
            t = time()
            for uid in range(n_user):
                Ru_ids = range(X.indptr[uid], X.indptr[uid+1])
                Ru_cols = np.array([X.indices[row] for row in Ru_ids])
                if len(Ru_cols) == 0:
                    continue
                urcnt = np.sqrt(len(Ru_ids))
                pu_append = self.item_weights[Ru_cols, :].sum(0) / urcnt
                for row in Ru_ids:
                    iid = X.indices[row]
                    pu = self.P[uid, :]
                    qi = self.Q[iid, :]
                    r_pred = self.miu + self.bias_i[iid] + self.bias_u[uid] + qi.dot(pu + pu_append)
                    err = X.data[row] - r_pred
                    if err < self.tol:
                        continue
                    # synchronized update gradient descents
                    bu_new = self.bias_u[uid] + gamma * (err - lambda_ * self.bias_u[uid])
                    bi_new = self.bias_i[iid] + gamma * (err - lambda_ * self.bias_i[iid])
                    pu_new = pu + gamma * (err * qi - lambda_ * pu)
                    try:
                        qi_new = qi + gamma * (err * (pu + pu_append) - lambda_ * qi)
                    except:
                        print(qi, err, pu, pu_append)
                    # y_new = item_weights + gamma * (err / urcnt - lambda_) * qi
                    # real updating
                    self.bias_u[uid] = bu_new
                    self.bias_i[iid] = bi_new
                    self.P[uid, :] = pu_new
                    self.Q[iid, :] = qi_new
                    self.item_weights[iid, :] += gamma * (err / urcnt - lambda_) * qi

                # if uid % 10000 == 0:
                #     print(uid * 100 / 552339, '%')
            gamma *= 0.93
            print('Finishing round', step, 'and', time()-t, 's used.') if verbose else None

            # predicting
            if R_test is None:
                return
            self.predict_and_score(R_test)

    def predict_and_score(self, R):
        if sp.issparse(R) and R.getformat() not in ["csr", "csc"]:
            R = R.tocsr()
        nnz = len(R.data)
        r_pred = np.zeros((nnz, ))
        n_user, n_item = R.shape
        pred_idx = -1
        for uid in range(n_user):
            Ru_ids = range(R.indptr[uid], R.indptr[uid+1])
            Ru_cols = np.array([R.indices[row] for row in Ru_ids])
            if len(Ru_cols) == 0:
                continue
            urcnt = np.sqrt(len(Ru_ids))
            pu_append = self.item_weights[Ru_cols, :].sum(0) / urcnt
            for row in Ru_ids:
                pred_idx += 1
                iid = R.indices[row]
                pu = self.P[uid, :]
                qi = self.Q[iid, :]
                r_pred[pred_idx] = round(self.miu + self.bias_i[iid] + self.bias_u[uid]
                                         + qi.dot(pu + pu_append))
                if r_pred[pred_idx] < 1:
                    r_pred[pred_idx] = 1
                elif r_pred[pred_idx] > 5:
                    r_pred[pred_idx] = 5

        # scoring
        print(r_pred)
        rmse = mean_squared_error(y_true=R.data, y_pred=r_pred) ** 0.5
        mae = mean_absolute_error(y_true=R.data, y_pred=r_pred)
        print('RMSE:', rmse, 'MAE:', mae)
        print(classification_report(R.data, r_pred))

    def gen_latent_feature_space(self):
        if self.P is None:
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
            X_part = [np.append(self.Q[bid_idx[bid]], self.P[uid_idx[uid]])
                      for bid, uid in cur_r]
            return np.array(X_part)


if __name__ == '__main__':
    R_train = np.load('r_matrix_train.npy')[()]
    R_test = np.load('r_matrix_test.npy')[()]
    svdpp = SVDPlusPlus(max_iter=10, tol=0.0001)
    svdpp.fit(R_train, R_test, verbose=True, warm_start=False)