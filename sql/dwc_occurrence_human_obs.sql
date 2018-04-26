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
  'present' AS occurrenceStatus,

  ring_number AS organismID,
  individual_remarks AS organismName,

  'capture and tag with GPS tracker' AS samplingProtocol,
  -- samplingEffort
  to_char(track_session_start_date at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS eventDate,
  -- minimumElevationInMeters
  -- minimumDistanceAboveSurfaceInMeters
  to_char(round(start_latitude, 7), '999.0000000') AS decimalLatitude,
  to_char(round(start_longitude, 7), '999.0000000') AS decimalLongitude,
  'EPSG:4326' AS geodeticDatum,
  30 AS coordinateUncertaintyInMeters,
  'GPS' AS georeferenceSources,

  'urn:lsid:marinespecies.org:taxname:558541' AS taxonID,
  species_latin_name AS scientificName,
  'Animalia' AS kingdom,
  'species' AS taxonRank,
  english_name AS vernacularName

FROM ({individuals_and_track_sessions_sql}) AS its
