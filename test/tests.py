#!/usr/bin/python
# -*- coding: utf-8 -*-

import unittest
import pandas as pd
import json
import sys
import os
from datetime import datetime as dt
from datetime import date
sys.path.append(os.path.dirname(os.path.dirname(__file__)) + '/src')
import DataReducing
import DataVisualizing

class TestDataReducer(unittest.TestCase):
    def setUp(self):
        self.dr = DataReducing.DataReducer()
        self.test_data = pd.DataFrame({
            'cartodb_id': ['1', '1', '1', '1', '1', '1', '1'],
            'date_time': [dt(2013, 1, 1, 0, 5, 0),
                          dt(2013, 1, 1, 0, 15, 0),
                          dt(2013, 1, 1, 0, 20, 0),
                          dt(2013, 1, 1, 0, 25, 0),
                          dt(2013, 1, 1, 0, 30, 0),
                          dt(2013, 1, 5, 0, 35, 0),
                          dt(2013, 1, 1, 4, 0, 0)],
            'day_of_year': ['152', '152', '152', '152', '152', '152', '152'],
            'distance_from_nest_in_meters': [50, 25, 30, 35, 40, 45, 102],
        })

    def test_get_hours_from_data(self):
        expected_result = [0, 4]
        self.assertEqual(self.dr.get_hours_from_data(self.test_data), expected_result)

    def test_aggregate_per_hour(self):
        expected_result_set = [
            {'hour': 0, 'mean_distance': 37.5, 'median_distance': 37.5, 'max_distance': 50},
            {'hour': 4, 'mean_distance': 102, 'median_distance': 102, 'max_distance': 102},
        ]
        result = self.dr.aggregate_per_hour(self.test_data)
        for i in range(len(expected_result_set)):
            expected_result = expected_result_set[i]
            output = result[i]
            self.assertEqual(output['hour'], expected_result['hour'])
            self.assertEqual(output['mean_distance'], expected_result['mean_distance'])
            self.assertEqual(output['median_distance'], expected_result['median_distance'])
            self.assertEqual(output['max_distance'], expected_result['max_distance'])

    def test_get_days_from_data(self):
        expected_result = [dt(2013, 1, 1), dt(2013, 1, 5)]
        self.assertEqual(self.dr.get_days_from_data(self.test_data), expected_result)

    def test_aggregate_per_day(self):
        expected_result_set = [
            {'date': dt(2013, 1, 1), 'mean_distance': 47, 'median_distance': 37.5, 'max_distance': 102},
            {'date': dt(2013, 1, 5), 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45},
        ]
        result = self.dr.aggregate_per_day(self.test_data)
        for i in range(len(expected_result_set)):
            expected_result = expected_result_set[i]
            output = result[i]
            self.assertEqual(output['date'], expected_result['date'])
            self.assertEqual(output['mean_distance'], expected_result['mean_distance'])
            self.assertEqual(output['median_distance'], expected_result['median_distance'])
            self.assertEqual(output['max_distance'], expected_result['max_distance'])

    def test_get_day_hours_from_data(self):
        expected_result = [dt(2013, 1, 1, 0), dt(2013, 1, 1, 4), dt(2013, 1, 5, 0)]
        self.assertEqual(self.dr.get_day_hours_from_data(self.test_data), expected_result)

    def test_aggregate_per_day_hour(self):
        expected_result_set = [
            {'day_hour': dt(2013, 1, 1, 0), 'mean_distance': 36, 'median_distance': 35, 'max_distance': 50},
            {'day_hour': dt(2013, 1, 1, 4), 'mean_distance': 102, 'median_distance': 102, 'max_distance': 102},
            {'day_hour': dt(2013, 1, 5, 0), 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45}
        ]
        result = self.dr.aggregate_per_day_hour(self.test_data)
        for i in range(len(expected_result_set)):
            expected_result = expected_result_set[i]
            output = result[i]
            self.assertEqual(output['day_hour'], expected_result['day_hour'])
            self.assertEqual(output['mean_distance'], expected_result['mean_distance'])
            self.assertEqual(output['median_distance'], expected_result['median_distance'])
            self.assertEqual(output['max_distance'], expected_result['max_distance'])

class TestDataReader(unittest.TestCase):
    def setUp(self):
        self.dr = DataReducing.DataReader(infile='./test/test_tracking_data.csv')

    def test_read_data(self):
        self.assertEqual(self.dr.read_data(), None)

    def test_get_data(self):
        self.dr.read_data()
        data = self.dr.get_data()
        self.assertEqual(len(data), 9)

    def test_parse_datetime(self):
        self.dr.read_data()
        data = self.dr.get_data()
        self.assertEqual(data['date_time'][0].isoformat(), '2013-06-01T00:01:09')

class TestTrackingVisualizer(unittest.TestCase):
    def setUp(self):
        self.vis = DataVisualizing.TrackingVisualizer(infile='./test/test_tracking_data.csv')

    def test_read_data(self):
        expected_result = pd.DataFrame({
            'cartodb_id': [1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525],
            'date_time': [dt(2013, 6, 1, 0, 1, 9),
                         dt(2013, 6, 1, 0, 6, 4),
                         dt(2013, 6, 1, 0, 10, 52),
                         dt(2013, 6, 1, 0, 15, 40),
                         dt(2013, 6, 2, 0, 1, 9),
                         dt(2013, 6, 2, 0, 6, 4),
                         dt(2013, 6, 2, 0, 10, 52),
                         dt(2013, 6, 2, 0, 15, 40),
                         dt(2013, 6, 2, 1, 2, 40)],
            'day_of_year': [152, 152, 152, 152, 153, 153, 153, 153, 153],
            'distance_from_nest_in_meters': [1, 2, 50, 4, 10, 2, 300, 44, 140]})
        result = self.vis.read_data()
        self.assertEqual(result, expected_result)

    def test_data_to_json(self):
        test_data = [
            {'hour': 0, 'mean_distance': 37500, 'median_distance': 37500, 'max_distance': 50000},
            {'hour': 4, 'mean_distance': 102000, 'median_distance': 102000, 'max_distance': 102000},
        ]
        expected_result = json.dumps({0: 50.0, 4: 102.0})
        result = self.vis.data_to_json(indata=test_data, key='hour', value_key='max_distance')
        self.assertEqual(expected_result, result)

    def test_convert_dates_to_unix_timestamps(self):
        test_data = [
            {'date': dt(2013, 1, 1), 'mean_distance': 47, 'median_distance': 37.5, 'max_distance': 102},
            {'date': dt(2013, 1, 5), 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45},
        ]
        expected_result = [
            {'date': 1356998400, 'mean_distance': 47, 'median_distance': 37.5, 'max_distance': 102},
            {'date': 1357344000, 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45},
        ]
        result = self.vis.convert_dates_to_unix_timestamps(indata=test_data, key='date')
        self.assertEqual(expected_result, result)

    def test_convert_dates_to_nvd3_timestamps(self):
        test_data = [
            {'date': dt(2013, 1, 1), 'mean_distance': 47, 'median_distance': 37.5, 'max_distance': 102},
            {'date': dt(2013, 1, 5), 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45},
        ]
        expected_result = [
            {'date': 1356998400000, 'mean_distance': 47, 'median_distance': 37.5, 'max_distance': 102},
            {'date': 1357344000000, 'mean_distance': 45, 'median_distance': 45, 'max_distance': 45},
        ]
        result = self.vis.convert_dates_to_nvd3_timestamps(indata=test_data, key='date')
        self.assertEqual(expected_result, result)

    def test_as_heatmap_json_subd_day(self):
        data_obj = {
            1370044800: 0.05,
            1370131200: 0.300
        }
        expected_result = json.dumps(data_obj)
        result = self.vis.as_heatmap_json(domain='month', subdomain='day', agg_function='max')
        self.assertEqual(result, expected_result)

    def test_as_heatmap_json_subd_hour(self):
        data_obj = {
            1370044800: 0.05,
            1370131200: 0.3,
            1370134800: 0.14,
        }
        expected_result = json.dumps(data_obj)
        result = self.vis.as_heatmap_json(domain='month', subdomain='hour', agg_function='max')
        self.assertEqual(result, expected_result)
