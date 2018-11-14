SELECT
  s.key_name,
  p.station_name,
  i.species_latin_name,
  sp.english_name,
  i.individual_id,
  i.ring_number,
  i.colour_ring,
  i.remarks AS individual_remarks,
  i.mass,
  i.sex,
  s.track_session_id,
  s.device_info_serial,
  s.tracker_id,
  s.start_date AT TIME ZONE 'utc' AS track_session_start_date,
  s.end_date AT TIME ZONE 'utc' AS track_session_end_date,
  s.start_latitude AS track_session_start_latitude,
  s.start_longitude AS track_session_start_longitude,
  s.remarks AS track_session_remarks
FROM
  (
    SELECT * FROM gps.ee_individual_limited
    UNION
    SELECT * FROM gps.ee_shared_individual_limited
  ) i
  LEFT JOIN (
    SELECT * FROM gps.ee_track_session_limited
    UNION
    SELECT * FROM gps.ee_shared_track_session_limited
  ) s
    ON i.individual_id = s.individual_id
  LEFT JOIN gps.ee_species_limited sp
    ON i.species_latin_name = sp.latin_name
  LEFT JOIN gps.ee_project_limited p
    ON s.key_name = p.key_name
ORDER BY
  key_name,
  device_info_serial
