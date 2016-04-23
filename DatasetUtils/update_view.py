# -*- coding: utf-8 -*-
__author__ = 'Adward'
import sqlite3
import os

# Constant values
DATA_PATH = '/Users/Adward/OneDrive/YelpData/'
DB_PATH = os.path.join(DATA_PATH, 'yelp.sqlite')

with sqlite3.connect(DB_PATH) as conn:
    conn.execute('DROP VIEW IF EXISTS b_view')
    conn.execute('CREATE VIEW b_view AS '
                 'SELECT * FROM '
                 '(business JOIN b_category_pca USING (business_id))')
    conn.execute('DROP VIEW IF EXISTS u_view')
    conn.execute('CREATE VIEW u_view AS '
                 'SELECT * FROM '
                 '(user LEFT OUTER JOIN friends_taste USING (user_id))')
    conn.execute('DROP VIEW IF EXISTS r_samples')
    cur = conn.execute('CREATE VIEW r_samples AS '
                       'SELECT review.stars AS rstar, average_stars AS ustar, b_view.stars AS bstar, '
                       'b_view.review_count AS brcnt, b_view.state AS bstate, checkins, compliments, '
                       'fans, review_date AS rdate, u_view.review_count AS urcnt, '
                       'u_view.votes AS uvotes, yelping_since AS ysince, cas, tastes '
                       'FROM '
                       '(review JOIN b_view'
                       '   USING (business_id)) '
                       'JOIN u_view USING (user_id)')