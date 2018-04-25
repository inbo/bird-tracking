(
SELECT
  device_info_serial || ':' || to_char(start_date_track_session at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'weight' AS measurementType,
  mass::text AS measurementValue,
  'g' AS measurementUnit,
  to_char(start_date_track_session at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS measurementDeterminedDate
FROM ({individual_track_session_sql}) AS its
)
UNION
(
SELECT
  device_info_serial || ':' || to_char(start_date_track_session at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'colour ring' AS measurementType,
  colour_ring::text AS measurementValue,
  '' AS measurementUnit,
  '' AS measurementDeterminedDate
FROM ({individual_track_session_sql}) AS its
WHERE
  colour_ring IS NOT NULL
  AND colour_ring != 'none'
)
