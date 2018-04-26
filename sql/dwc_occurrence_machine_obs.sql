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
  'MachineObservation' AS basisOfRecord,
  {informationWithheld} AS informationWithheld,
  -- dynamicProperties

  CASE
    WHEN sex = 'M' THEN 'male'
    WHEN sex = 'F' THEN 'female'
    ELSE 'unknown'
  END AS sex,
  'adult' AS lifeStage,
  CASE
    WHEN calc.speed < 0 THEN 'doubtful'
    WHEN calc.speed > 33.33333 THEN 'doubtful'
    WHEN t.altitude > 10000 THEN 'doubtful'
    WHEN t.h_accuracy > 1000 THEN 'doubtful'
    WHEN t.date_time > current_date THEN 'doubtful'
    ELSE 'present'
  END AS occurrenceStatus,

  ring_number AS organismID,
  remarks_individual AS organismName,

  'https://doi.org/10.1007/s10336-012-0908-1' AS samplingProtocol,
-- samplingEffort
  to_char(date_time at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS eventDate,
  0::numeric AS minimumElevationInMeters,
  0::numeric AS maximumElevationInMeters,
  altitude::numeric AS minimumDistanceAboveSurfaceInMeters,
  altitude::numeric AS maximumDistanceAboveSurfaceInMeters,

  -- minimumDistanceAboveSurfaceInMeters
  to_char(round(latitude, 7), '999.0000000') AS decimalLatitude,
  to_char(round(longitude, 7), '999.0000000') AS decimalLongitude,
  'EPSG:4326' AS geodeticDatum,
  CASE
    WHEN h_accuracy IS NOT NULL THEN round(t.h_accuracy)::numeric
    ELSE 30::numeric
  AS coordinateUncertaintyInMeters, --
  'GPS' AS georeferenceSources,

  'urn:lsid:marinespecies.org:taxname:558541' AS taxonID,
  species_latin_name AS scientificName,
  'Animalia' AS kingdom,
  'species' AS taxonRank,
  english_name AS vernacularName

FROM ({individual_detections_sql}) AS its
