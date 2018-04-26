SELECT
  s.key_name,
--  p.station_name (table not joined),
--  i.individual_id,
  i.ring_number,
--  i.colour_ring,
  i.species_latin_name,
--  i.mass,
--  i.sex,
--  i.remarks AS remarks_individual,
--  sp.english_name (table not joined),
  s.device_info_serial,
--  s.start_date AS start_date_track_session,
--  s.end_date AS end_date_track_session,
--  s.start_latitude,
--  s.start_longitude,
--  s.remarks AS remarks_track_session,
--  s.track_session_id,
--  s.tracker_id,
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
  gps.get_uvagps_track_speed_incl_shared(6240) calc
  INNER JOIN gps.ee_tracking_speed_limited t
  ON
    calc.device_info_serial = t.device_info_serial
    AND calc.date_time = t.date_time
  INNER JOIN gps.ee_track_session_limited s
  ON
    t.device_info_serial = s.device_info_serial
    AND t.date_time >= s.start_date
    AND t.date_time <= s.end_date
  INNER JOIN gps.ee_individual_limited i
  ON
    s.ring_number = i.ring_number
