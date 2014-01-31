#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(__file__)) + '/src')
import DataVisualizing

if len(sys.argv) != 2:
    print 'usage: create_heatmap.py <data file>'
    print '  expected infile is a datafile containing tracking data'
    print '  this is a csv file with the following columns:'
    print '      cartodb_id, date_time, day_of_year, distance_from_nest_in_meters'
    sys.exit(-1)

def main():
    dvis = DataVisualizing.TrackingVisualizer(infile=sys.argv[1])
    print ('var day_month_heatdata = {0};'.format(dvis.as_heatmap_json(domain='month', agg_function='max')))
    print ('var hour_month_heatdata = {0};'.format(dvis.as_heatmap_json(domain='month', subdomain='hour', agg_function='max')))
    print ('var hour_month_linedata = [ {{ \'key\': \'Maximum distance\', \'color\': \'green\', \'values\': {0} }} ];'.format(dvis.as_raw_line_json(agg_function='max')))
    print ('var day_month_bardata = [ {{ \'key\': \'Maximum distance\', \'color\': \'green\', \'values\': {0} }} ];'.format(dvis.as_bar_chart_json(agg_function='max')))
    stacked_area_data = dvis.as_nvd3_stacked_area_data(agg_function='mean')
    stacked_area_data_out = []
    days = stacked_area_data.keys()
    days.sort()
    first_day = days[0]
    first_day_timestamp = int(time.mktime(time.strptime(first_day, '%Y-%m-%d'))) * 1000
    last_day = days[-1]
    last_day_timestamp = (int(time.mktime(time.strptime(last_day, '%Y-%m-%d'))) * 1000) + (24 * 60 * 60 * 1000)
    weeks_array = [days[x:x+7] for x in xrange(0, len(days), 7)]
    for day in days:
        stacked_area_data_out.append({'key': day, 'values': stacked_area_data[day]})
    print ('var hour_stacked_area_data = {0};'.format(str(stacked_area_data_out)))
    print ('var weeks = {0};'.format(weeks_array))
    print ('var firstWeekLabels = weeks[0];')
    print ('var min_timestamp = {0};'.format(first_day_timestamp))
    print ('var max_timestamp = {0};'.format(last_day_timestamp))

main()
