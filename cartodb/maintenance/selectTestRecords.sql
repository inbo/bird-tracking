-- SQL to show number of records recorded earlier than tracking_start_date_time.
-- Those records should be removed.
-- https://lifewatch-inbo.cartodb.com/viz/5d42a40a-9951-11e3-8315-0ed66c7bc7f3/table

select
  count(*)
from
bird_tracking as t
left join bird_tracking_devices as d
on t.device_info_serial = d.device_info_serial
where
  t.date_time < d.tracking_start_date_time
