SELECT
  device_info_serial || ':' || to_char(start_date_track_session at time zone 'UTC', 'YYYYMMDDHH24MISS') || ':tagging' AS occurrenceID,
  'Event' AS "type",
  'en' AS language,
  {license} AS license,
  {rightsHolder} AS rightsHolder,
  {accessRights} AS accessRights,
  {datasetID} AS datasetID,
  {institutionCode} AS institutionCode,
  {datasetName} AS datasetName,
  'HumanObservation' AS basisOfRecord,
  {informationWithheld} AS informationWithheld,
  -- dynamicProperties

  CASE
    WHEN sex = 'M' THEN 'male'
    WHEN sex = 'F' THEN 'female'
    ELSE 'unknown'
  END AS sex,
  'adult' AS lifeStage,

  ring_number AS organismID,
  remarks_individual AS organismName,

  'capture and tag with GPS tracker' AS samplingProtocol,
  -- samplingEffort
  to_char(start_date_track_session at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS eventDate,
  -- minimumElevationInMeters
  -- minimumDistanceAboveSurfaceInMeters
  start_latitude AS decimalLatitude,
  start_longitude AS decimalLongitude,
  'WGS84' AS geodeticDatum,
  30 AS coordinateUncertaintyInMeters,
  'GPS' AS georeferenceSources,

  species_latin_name AS scientificName,
  'Animalia' AS kingdom,
  'species' AS taxonRank,
  english_name AS vernacularName

FROM ({individual_track_session_sql}) AS t
