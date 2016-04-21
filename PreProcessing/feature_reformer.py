# -*- coding: utf-8 -*-
__author__ = 'Adward'
import numpy as np
from sklearn.preprocessing import FunctionTransformer, Imputer, Binarizer
from sklearn.feature_extraction import DictVectorizer

valid_states = ['AZ', 'NV', 'ON', 'WI', 'QC', 'SC', 'EDH', 'PA', 'MLN', 'BW', 'NC', "IL"]


class FeatureReformer(object):
    def __init__(self, conn, view_name, attr_list):
        self.cur = conn.execute('SELECT ' + ','.join(attr_list) + ' FROM ' + view_name)
        self.rf_dict = {
            'default': self._no_reformer_,
            'log': self._log_reformer_,
            'state': self._state_reformer_,
            'vector': self._b_cas_reformer_,
            '1d': self._col_vec_to_row_reformer_,
            'y2': self._target_bin_reformer_,
            'y3': self._target_tri_reformer_
        }

    def transform(self, opt='default', *kwargs):
        if opt in ('vector', 'y2'):
            return self.rf_dict[opt](kwargs)  # kwargs is a dict
        else:
            return self.rf_dict[opt]()

    def _no_reformer_(self):
        return np.array([row for row in self.cur])
        # return np.array(np.array([row for row in self.cur]))

    def _col_vec_to_row_reformer_(self):
        return np.array([row[0] for row in self.cur])

    def _state_reformer_(self):
        samples = [
            {0: row[0] if (row[0] in valid_states) else 'OTH'}
            for row in self.cur
        ]
        dv = DictVectorizer()
        return dv.fit_transform(samples).toarray()

    def _log_reformer_(self):
        samples = np.array([row for row in self.cur]) + 1
        return FunctionTransformer(np.log1p).transform(samples)

    def _b_cas_reformer_(self, kwargs):
        n_components, impute = 10, False
        if 'n_components' in kwargs:
            n_components = kwargs['n_components']
        if 'impute' in kwargs:
            impute = kwargs['impute']
        cas = np.array([
            (
                [float(d) for d in row[0].split(';')[0:n_components]]
                if row[0] else [0] * n_components
            )
            for row in self.cur
        ])
        if impute:  # imputation of missing values
            return Imputer(strategy='mean', axis=0).fit_transform(cas)
        else:
            return cas

    def _target_bin_reformer_(self, kwargs):
        threshold = 3.1
        if 'threshold' in kwargs:
            threshold = kwargs['threshold']
        return Binarizer(threshold=threshold).transform(self._no_reformer_())

    def _target_tri_reformer_(self):
        proj = [None, 0, 0, 1, 2, 2]
        return np.array([(proj[row[0]],) for row in self.cur])
