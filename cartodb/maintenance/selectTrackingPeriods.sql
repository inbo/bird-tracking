-- SQL to show tracking days per device.
-- A relatively low number of tracking days could indicate that the bird is dead.

select
  d.bird_name,
  d.scientific_name,
  d.colour_ring_code,
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
  d.colour_ring_code,
  d.remarks
order by days desc
