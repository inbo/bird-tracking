-- SQL to flag outliers in the tracking data
-- * Records in the future
-- * Records with an altitude above 10km
-- * Records with a speed above 120km/h

with select_fields as (
  select
    t.cartodb_id,
    d.device_info_serial,
    d.bird_name,
    d.tracking_start_date_time,
    t.date_time,
    t.altitude,
    t.the_geom,
    t.the_geom_webmercator,
    (st_distance_sphere(t.the_geom,lag(t.the_geom,1) over(order by t.device_info_serial, t.date_time))/1000)/(extract(epoch from (t.date_time - lag(t.date_time,1) over(order by t.device_info_serial, t.date_time)))/3600) as km_per_hour
  from
    bird_tracking as t
    left join bird_tracking_devices as d
    on t.device_info_serial = d.device_info_serial
)

update bird_tracking as to_flag
set userflag = true
from (
  select *
  from select_fields
  where
    date_time > current_date
    -- or date_time < tracking_start_date_time
    or altitude > 10000
    or km_per_hour > 120
  ) as outliers
where outliers.cartodb_id = to_flag.cartodb_id
