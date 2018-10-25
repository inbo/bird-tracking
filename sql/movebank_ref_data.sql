-- Query created by Peter Desmet (INBO)

SELECT
  s.key_name AS project, -- Not a Movebank field, but included for reference
  s.device_info_serial AS "tag-id", -- device_info_serial more widely used than tracker_id,
  i.ring_number AS "animal-id", -- ring_number more widely used than individual_id
  i.species_latin_name AS "animal-taxon",
  s.track_session_id AS "deployment-id",
  s.start_date AS "deploy-on-timestamp",
  s.end_date AS "deploy-off-timestamp", -- often set in the future
  i.remarks AS "animal-comments",  -- often contains animal name
  -- "animal-death-comments": not consistently available and expressible in DB
  -- "animal-exact-date-of-birth": not available in DB
  -- "animal-latest-date-born": not available in DB
  CASE
    WHEN i.sex = 'X' THEN NULL -- not possible to express this in Movebank controlled list
    ELSE lower(i.sex)
  END AS "animal-sex",
  -- "animal-taxon-detail": not necessary, species_latin_name is expected to be supported in ITIS
  CASE
    WHEN i.colour_ring IN ('-', 'NA') THEN NULL -- colour_ring is a required field, so users resort to variations to express no ring
    ELSE i.colour_ring -- colour_ring included here, as it is not included elsewhere. ring_number = animal-id
  END AS "ring-id",
  {animal_life_stage} AS "animal-life-stage", -- not available in DB, likely "adult"
  i.mass AS "animal-mass",
  -- "animal-reproductive-condition": not available in DB
  {attachment_type} AS "attachment-type", -- not available in DB, likely "harness" or "other" (for leg loops)
  -- "behavior-according-to": behavioral categories not available/uploaded to Movebank, could be supported in future
  -- "data-processing-software": not applicable, locations are in raw sensor data
  -- "deploy-off-person": person who removed tag, not available in DB
  -- "deploy-off-latitude": not available in DB
  -- "deploy-off-longitude": not available in DB
  -- "deploy-on-person": person who attached tag, not available in DB
  -- "deploy-on-latitude": is s.start_latitude, but Movebank term is primarily intended when sensor does not record precise positions
  -- "deploy-on-longitude": is s.start_longitude, but see s.start_latitude
  s.remarks AS "deployment-comments",
  -- "deployment-end-comments": s.remarks can contain this type of information, but unstructured, see "deployment-remarks" instead
  CASE
    WHEN lower(s.remarks) LIKE '%dead%' THEN 'dead' -- track session remarks contains word "dead"
    ELSE NULL -- other values from Movebank controlled list cannot be consistently derived
  END AS "deployment-end-type",
  -- "duty-cycle": tags do have recording settings, but can change over time and not available in DB
  -- "geolocator-calibration": not applicable
  -- "geolocator-light-threshold": not applicable
  -- "geolocator-sun-elevation-angle": not applicable
  -- "habitat-according-to": habitat information not available/uploaded to Movebank, could be supported in future
  'provided by the GPS unit' AS "location-accuracy-comments", -- Refers to e.g. h_accuracy recorded by tag
  -- "manipulation-comments": not available in DB and mostly not applicable
  {manipulation_type} AS "manipulation-type", -- Not available in DB, likely "none"
  p.station_name AS "study-site", -- Can be quite broad, but consistently populated in DB
  'other wireless' AS "tag-readout-method", -- Zigbee two-way radio transceiver via antenna
  -- "beacon-frequency": not applicable, for radio tags/retrieval beacon
  -- "tag-comments": s.remarks can contain this type of information, but unstructured, see "deployment-remarks" instead
  -- "tag-failure-comments": s.remarks can contain this type of information, but unstructured, see "deployment-remarks" instead
  'University of Amsterdam Bird Tracking System (UvA-BiTS)' AS "tag-manufacturer-name",
  t.mass AS "tag-mass",
  -- "tag-model": not available in DB, firmware version not a good substitute
  -- "tag-production-date": not available in DB, firmware version not a good substitute
  s.device_info_serial AS "tag-serial-no",
  'GPS' AS "sensor-type"
FROM
  (
    SELECT * FROM gps.ee_individual_limited
    UNION
    SELECT * FROM gps.ee_shared_individual_limited
  ) i -- individuals
  LEFT JOIN (
    SELECT * FROM gps.ee_track_session_limited
    UNION
    SELECT * FROM gps.ee_shared_track_session_limited
  ) s -- track sessions
    ON i.individual_id = s.individual_id
  LEFT JOIN gps.ee_species_limited sp -- species
    ON i.species_latin_name = sp.latin_name
  LEFT JOIN gps.ee_tracker_limited t -- trackers
    ON s.device_info_serial = t.device_info_serial
  LEFT JOIN gps.ee_project_limited p -- projects
    ON s.key_name = p.key_name
WHERE
  p.key_name IN ({projects*})
ORDER BY
  project,
  "deployment-id"
