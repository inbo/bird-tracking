-- SQL to remove test tracking records, when tag was not mounted on bird

delete from bird_tracking_new_data
using bird_tracking_devices as d
where
  bird_tracking_new_data.device_info_serial = d.device_info_serial
  and bird_tracking_new_data.date_time < d.tracking_start_date_time
