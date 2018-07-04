SELECT
  s.key_name,
--  p.station_name (table not joined),
  i.species_latin_name,
  sp.english_name,
  i.individual_id,
  i.ring_number,
--  i.colour_ring,
  i.remarks AS remarks_individual,
--  i.mass,
--  i.sex,
--  s.track_session_id,
  s.device_info_serial,
--  s.tracker_id,
--  s.start_date AS track_session_start_date,
--  s.end_date AS track_session_end_date,
--  s.start_latitude AS track_session_start_latitude,
--  s.start_longitude AS track_session_start_longitude,
--  s.remarks AS track_session_remarks,
  t.date_time,
  t.latitude,
  t.longitude,
  t.altitude,
-- t.pressure,
-- t.temperature,
-- t.satellites_used,
-- t.gps_fixtime,
-- t.positiondop,
  t.h_accuracy,
-- t.v_accuracy,
-- t.x_speed,
-- t.y_speed,
-- t.z_speed,
-- t.speed_accuracy,
-- t.location,
-- t.userflag,
-- t.speed_3d,
  t.speed_2d,
  t.direction,
-- t.altitude_agl,
  calc.distance AS calc_distance,
  calc.interval AS calc_interval,
  calc.speed AS calc_speed_for_interval,
  calc.direction AS calc_direction
FROM
  gps.get_uvagps_track_speed({device_info_serial}, true) calc
  INNER JOIN gps.ee_tracking_speed_limited t
    ON
      calc.device_info_serial = t.device_info_serial
      AND calc.date_time = t.date_time
  INNER JOIN gps.ee_track_session_limited s
    ON
      t.device_info_serial = s.device_info_serial
      AND t.date_time >= s.start_date
      AND t.date_time <= s.end_date
  LEFT JOIN gps.ee_individual_limited i
    ON s.ring_number = i.ring_number
  LEFT JOIN gps.ee_species_limited sp
    ON i.species_latin_name = sp.latin_name
