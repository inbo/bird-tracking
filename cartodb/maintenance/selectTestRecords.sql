-- SQL to show number of records recorded earlier than tracking_started_at timestamp.
-- Those records should be removed.

SELECT
  count(*)
FROM
  lifewatch.bird_tracking_new_data as t
  LEFT JOIN lifewatch.bird_tracking_devices as d
  ON t.device_info_serial = d.device_info_serial
WHERE
  t.date_time < d.tracking_started_at
