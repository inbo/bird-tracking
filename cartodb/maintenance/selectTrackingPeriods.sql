-- SQL to show tracking days per device.
-- A relatively low number of tracking days could indicate that the bird is dead.
-- https://lifewatch-inbo.cartodb.com/viz/13fd195c-b45d-11e3-b989-0e230854a1cb/table

select
  d.bird_name,
  d.scientific_name,
  d.ring_code_color,
  min(t.date_time) as start,
  max(t.date_time) as end,
  max(t.date_time)::date - min(t.date_time)::date as days,
  d.remarks
from bird_tracking t
  left join bird_tracking_devices d
  on t.device_info_serial = d.device_info_serial
where t.userflag is false
group by 
  d.bird_name,
  d.scientific_name,
  d.ring_code_color,
  d.remarks
order by days desc
