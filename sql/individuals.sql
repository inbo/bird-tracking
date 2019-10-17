SELECT
  ses.key_name,
  prj.station_name,
  ind.species_latin_name,
  spe.english_name,
  ind.individual_id,
  ind.ring_number,
  ind.colour_ring,
  ind.remarks AS individual_remarks,
  ind.mass,
  ind.sex,
  ses.track_session_id,
  ses.device_info_serial,
  ses.tracker_id,
  ses.start_date AT TIME ZONE 'utc' AS track_session_start_date,
  ses.end_date AT TIME ZONE 'utc' AS track_session_end_date,
  ses.start_latitude AS track_session_start_latitude,
  ses.start_longitude AS track_session_start_longitude,
  ses.remarks AS track_session_remarks
FROM
  (
    SELECT * FROM gps.ee_individual_limited
    UNION
    SELECT * FROM gps.ee_shared_individual_limited
  ) ind
  LEFT JOIN (
    SELECT * FROM gps.ee_track_session_limited
    UNION
    SELECT * FROM gps.ee_shared_track_session_limited
  ) ses
    ON ind.individual_id = ses.individual_id
  LEFT JOIN gps.ee_species_limited spe
    ON ind.species_latin_name = spe.latin_name
  LEFT JOIN gps.ee_project_limited prj
    ON ses.key_name = prj.key_name
ORDER BY
  ses.key_name,
  ses.device_info_serial
