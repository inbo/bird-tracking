SELECT
  s.key_name,
  p.station_name,
  i.individual_id,
  i.ring_number,
  i.colour_ring,
  i.species_latin_name,
  i.mass,
  i.sex,
  i.remarks AS remarks_individual,
  sp.english_name,
  s.device_info_serial,
  s.start_date AS start_date_track_session,
  s.end_date AS end_date_track_session,
  s.start_latitude,
  s.start_longitude,
  s.remarks AS remarks_track_session,
  s.track_session_id,
  s.tracker_id
FROM (
  SELECT * FROM gps.ee_individual_limited
  UNION
  SELECT * FROM gps.ee_shared_individual_limited) i
LEFT JOIN (
  SELECT * FROM gps.ee_track_session_limited
  UNION
  SELECT * FROM gps.ee_shared_track_session_limited) s
  ON i.individual_id = s.individual_id
LEFT JOIN gps.ee_species_limited sp
  ON i.species_latin_name = sp.latin_name
LEFT JOIN gps.ee_project_limited p
  on s.key_name = p.key_name
WHERE
  s.key_name IN ({project_keys})
ORDER BY
  key_name,
  device_info_serial
