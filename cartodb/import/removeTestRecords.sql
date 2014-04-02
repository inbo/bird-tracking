-- SQL to remove test tracking records, when tag was not mounted on bird

delete from bird_tracking
using bird_tracking_devices as d
where
  bird_tracking.device_info_serial = d.device_info_serial
  and bird_tracking.date_time < d.tracking_start_date_time
