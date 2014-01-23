import pandas as pd
import json
import numpy as np
import calendar
import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)) + '/src')
import DataReducing

class TrackingVisualizer():
    def __init__(self, infile=None):
        self.infile = infile

    def read_data(self):
        dr = DataReducing.DataReader(infile=self.infile)
        dr.read_data()
        data = dr.get_data()
        return data

    def get_days(self, data):
        dr = DataReducing.DataReducer()
        return dr.get_days_from_data(data)

    def reduce_data_by_day(self, data):
        dr = DataReducing.DataReducer()
        return dr.aggregate_per_day(data)

    def reduce_data_by_day_hour(self, data):
        dr = DataReducing.DataReducer()
        return dr.aggregate_per_day_hour(data)

    def data_to_json(self, indata=None, key=None, value_key=None):
        data = {}
        for data_point in indata:
            data[int(data_point[key])] = data_point[value_key] / 1000 ;# meters to kilometers
        return json.dumps(data)

    def data_to_json_array(self, indata=None, key=None, value_key=None):
        data = []
        for data_point in indata:
            data.append({'x': int(data_point[key]), 'y': data_point[value_key] / 1000}) ;# meters to kilometers
        return json.dumps(data)

    def convert_dates_to_timestamps(self, indata=None, key=None, multiply=1):
        data = []
        for data_point in indata:
            datetime_ = data_point[key]
            timestamp = int(calendar.timegm(datetime_.utctimetuple())) * multiply
            data_point[key] = timestamp
            data.append(data_point)
        return data

    def convert_dates_to_unix_timestamps(self, indata=None, key=None):
        return self.convert_dates_to_timestamps(indata=indata, key=key, multiply=1)

    def convert_dates_to_nvd3_timestamps(self, indata=None, key=None):
        return self.convert_dates_to_timestamps(indata=indata, key=key, multiply=1000)

    def convert_numpydtypes_to_floats(self, indata, key=None):
        data = []
        for data_point in indata:
            value = data_point[key]
            data_point[key] = np.asscalar(value)
            data.append(data_point)
        return data

    def as_heatmap_json(self, domain='month', subdomain='day', agg_function='max'):
        in_data = self.read_data()
        json_data = {}
        if agg_function == 'max':
            value_key = 'max_distance'
        if subdomain == 'day':
            reduced_data = self.reduce_data_by_day(in_data)
            reduced_data_timestamps = self.convert_dates_to_unix_timestamps(reduced_data, key='date')
            data_with_regular_floats = self.convert_numpydtypes_to_floats(reduced_data_timestamps, key=value_key)
            data = self.data_to_json(indata=data_with_regular_floats, key='date', value_key=value_key)
        elif subdomain == 'hour':
            reduced_data = self.reduce_data_by_day_hour(in_data)
            reduced_data_timestamps = self.convert_dates_to_unix_timestamps(reduced_data, key='day_hour')
            data_with_regular_floats = self.convert_numpydtypes_to_floats(reduced_data_timestamps, key=value_key)
            data = self.data_to_json(indata=data_with_regular_floats, key='day_hour', value_key=value_key)
        return data

    def as_raw_line_json(self, agg_function='max'):
        in_data = self.read_data()
        json_data = {}
        if agg_function == 'max':
            value_key = 'max_distance'
        reduced_data = self.reduce_data_by_day_hour(in_data)
        reduced_data_timestamps = self.convert_dates_to_nvd3_timestamps(reduced_data, key='day_hour')
        data_with_regular_floats = self.convert_numpydtypes_to_floats(reduced_data_timestamps, key=value_key)
        data = self.data_to_json_array(indata=data_with_regular_floats, key='day_hour', value_key=value_key)
        return data

    def create_empty_hour_dict(self):
        hours = range(24)
        initial_list = []
        for hour in hours:
            initial_list.append({'x': hour, 'y': 0})
        return initial_list

    def as_nvd3_stacked_area_data(self, agg_function='mean'):
        in_data = self.read_data()
        days = self.get_days(in_data)
        days.sort()
        json_data = {}
        for day in days:
            json_data[day.date().isoformat()] = self.create_empty_hour_dict()
        if agg_function == 'mean':
            value_key = 'mean_distance'
        data = self.reduce_data_by_day_hour(in_data)
        for point in data:
            date_time = point['day_hour']
            date = date_time.date().isoformat()
            hour = date_time.hour
            dist = point[value_key]
            values = json_data[date]
            new_values = []
            for value in values:
                if value['x'] == hour:
                    new_values.append({'x': hour, 'y': dist})
                else:
                    new_values.append(value)
            json_data[date] = new_values
        return json_data
