-- SQL to show tracking days per device.
-- A relatively low number of tracking days could indicate that the bird is dead.

SELECT
  d.bird_name,
  d.scientific_name,
  d.colour_ring_code,
  min(t.date_time) AS start_date,
  max(t.date_time) AS end_date,
  max(t.date_time)::date - min(t.date_time)::date as days,
  d.remarks
FROM lifewatch.bird_tracking_new_data t
  LEFT JOIN lifewatch.bird_tracking_devices d
  ON t.device_info_serial = d.device_info_serial
WHERE t.userflag is false
GROUP BY 
  d.bird_name,
  d.scientific_name,
  d.colour_ring_code,
  d.remarks
ORDER BY days DESC
