import pandas as pd
import sys
import datetime
import numpy as np

class DataReducer():
    def get_hours_from_data(self, data):
        hours = [x.hour for x in data['date_time']]
        return list(set(hours))

    def get_days_from_data(self, data):
        days = [datetime.datetime(x.year, x.month, x.day) for x in data['date_time']]
        outlist = list(set(days))
        outlist.sort()
        return outlist

    def get_day_hours_from_data(self, data):
        day_hours = [datetime.datetime(x.year, x.month, x.day, x.hour) for x in data['date_time']]
        outlist = list(set(day_hours))
        outlist.sort()
        return outlist

    def aggregate_data(self, data, unique_values, key):
        aggregated_data = []
        for val in unique_values:
            distances = data.loc[data[key] == val]['distance_from_nest_in_meters']
            mean = distances.mean()
            median = distances.median()
            max_dist = distances.max()
            if np.isnan(mean):
                mean = None
            if np.isnan(median):
                median = None
            if np.isnan(max_dist):
                max_dist = None
            aggregated_data_point = {key: val, 'mean_distance': mean, 'median_distance': median, 'max_distance': max_dist}
            aggregated_data.append(aggregated_data_point)
        return aggregated_data

    def aggregate_per_hour(self, data):
        hours = self.get_hours_from_data(data)
        data['hour'] = [x.hour for x in data['date_time']]
        return self.aggregate_data(data, hours, 'hour')

    def aggregate_per_day(self, data):
        days = self.get_days_from_data(data)
        data['date'] = [datetime.datetime(x.year, x.month, x.day) for x in data['date_time']]
        return self.aggregate_data(data, days, 'date')

    def aggregate_per_day_hour(self, data):
        day_hours = self.get_day_hours_from_data(data)
        data['day_hour'] = [datetime.datetime(x.year, x.month, x.day, x.hour) for x in data['date_time']]
        return self.aggregate_data(data, day_hours, 'day_hour')

class DataReader():
    def __init__(self, infile=None):
        self.infile = infile

    def read_data(self):
        self.data = pd.io.parsers.read_csv(open(self.infile), sep=',')
        self.data['date_time'] = pd.Series([datetime.datetime.strptime(x, '%Y-%m-%d %H:%M:%S') for x in self.data['date_time']])

    def get_data(self):
        return self.data

    def print_data(self):
        self.data.to_csv(sys.stdout, sep=',')
