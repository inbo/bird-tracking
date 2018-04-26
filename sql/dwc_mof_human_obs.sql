(
SELECT
  device_info_serial || ':' || to_char(track_session_start_date at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'weight' AS measurementType,
  'http://vocab.nerc.ac.uk/collection/P01/current/SPWGXX01/' AS measurementTypeID,
  mass::text AS measurementValue,
  'g' AS measurementUnit,
  '' AS measurementMethod,
  to_char(track_session_start_date at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measurementDeterminedDate
FROM ({individuals_and_track_sessions_sql}) AS its
)
UNION
(
SELECT
  device_info_serial || ':' || to_char(track_session_start_date at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'lifeStage' AS measurementType,
  'http://vocab.nerc.ac.uk/collection/P01/current/LSTAGE01/' AS measurementTypeID,
  'adult' AS measurementValue,
  '' AS measurementUnit,
  '' AS measurementMethod,
  to_char(track_session_start_date at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measurementDeterminedDate
FROM ({individuals_and_track_sessions_sql}) AS its
)
UNION
(
SELECT
  device_info_serial || ':' || to_char(track_session_start_date at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'sex' AS measurementType,
  'http://vocab.nerc.ac.uk/collection/P01/current/ENTSEX01/' AS measurementTypeID,
  CASE
    WHEN sex = 'M' THEN 'male'
    WHEN sex = 'F' THEN 'female'
    ELSE 'unknown'
  END AS measurementValue,
  '' AS measurementUnit,
  '' AS measurementMethod,
  to_char(track_session_start_date at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measurementDeterminedDate
FROM ({individuals_and_track_sessions_sql}) AS its
)
UNION
(
SELECT
  device_info_serial || ':' || to_char(track_session_start_date at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'colour ring' AS measurementType,
  '' AS measurementTypeID,
  colour_ring::text AS measurementValue,
  '' AS measurementUnit,
  '' AS measurementMethod,
  '' AS measurementDeterminedDate
FROM ({individuals_and_track_sessions_sql}) AS its
WHERE
  colour_ring IS NOT NULL
  AND colour_ring != 'none'
)
ORDER BY
  occurrenceID,
  measurementType
