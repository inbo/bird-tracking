/*
Created by Peter Desmet (INBO)

This query retrieves UvA-BiTS individual, session and tracker data in the
Movebank reference data format (https://www.movebank.org/node/2381#metadata).
It joins individuals in ee_(shared_)individual_limited and their associated
ee_(shared_)track_session_limited, with extra information from
ee_(shared_)tracker_limited.

Upload resulting data to Movebank as:
Reference data > Reference data about animals, tracking tags, or deployments >
Use Movebank standard reference data format

The UvA-BiTS fields that could not be mapped to Movebank are:

ind.individual_id                       Internal id, opted to use ring_number instead
ind.start_date                          Not relevant
ind.end_date                            Not relevant
ses.project_id                          Internal id, opted to use key_name instead
ses.tracker_id / tag.tracker.id         Internal id, opted to use device_info_serial instead
tag.firmware_version                    Cannot be mapped
tag.start_date                          Not relevant
tag.end_date                            Not relevant
*/

SELECT
-- ANIMALS
-- animal-comments:                     Set to individual remarks, which generally only contains
--                                      animal name
  ind.remarks AS "animal-comments",
-- animal-death-comments:               Not available in DB, ses.remarks can contain this info, but
--                                      it is too unstructured to extract consistently
-- animal-earliest-date-born:           Not available in DB
-- animal-exact-date-of-birth:          Not available in DB
-- animal-id:                           Set to ring_number, as that is the public identifier used in
--                                      UvA-BiTS for animals (and not animal_id)
  ind.ring_number AS "animal-id",
-- animal-latest-date-born:             Not available in DB
-- animal-nickname:                     Set to individual remarks if bird_remarks_is_nickname is set
--                                      to TRUE
  CASE
    WHEN {bird_remarks_is_nickname} THEN ind.remarks
    ELSE NULL
  END AS "animal-nickname",
-- animal-ring-id:                      Set to colour_ring, as this value is not included elsewhere.
--                                      Since it is a required DB field, users resort to variations
--                                      (None, NA) to express no ring: those are set to NULL.
  CASE
    WHEN ind.colour_ring IN ('-', 'NA', 'None', 'none', '0000') THEN NULL
    ELSE ind.colour_ring
  END AS "animal-ring-id",
-- animal-sex:                          Set to individual sex. Movebank uses "u" for unknown.
  CASE
    WHEN ind.sex = 'X' THEN 'u'
    ELSE lower(ind.sex)
  END AS "animal-sex",
-- animal-taxon                         Set to individual species_latin_name
  ind.species_latin_name AS "animal-taxon",
-- animal-taxon-detail:                 Not necessary, species_latin_name is expected to be
--                                      supported in ITIS.

-- DEPLOYMENTS
-- animal-life-stage:                   Set via variable, likely "adult".
  {animal_life_stage} AS "animal-life-stage",
-- animal-mass                          Set to individual mass
  ind.mass AS "animal-mass",
-- animal-reproductive-condition:       Not available in DB
-- attachment-type:                     Set to "harness"
  'harness' AS "attachment-type",
-- behavior-according-to:               Not available in DB
-- data-processing-software:            Not applicable, locations are in raw sensor data
-- deploy-off-latitude:                 Not available in DB, no info on recatch
-- deploy-off-longitude:                Not available in DB, no info on recatch
-- deploy-off-person:                   Not available in DB, no info on recatch
-- deploy-off-timestamp:                Set to session end_date (UTC), often open. Year 9999 is not
--                                      accepted by Movebank and is set to undefined.
--                                      Format: yyyy-MM-dd'T'HH:mm:ss'Z'
  CASE
    WHEN ses.end_date = '9999-12-31' THEN NULL
    ELSE to_char(ses.end_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  END AS "deploy-off-timestamp",
-- deploy-on-latitude:                  Set to catch/session start_latitude
  ses.start_latitude AS "deploy-on-latitude",
-- deploy-on-longitude:                 Set to catch/session start_longitude
  ses.start_longitude AS "deploy-on-longitude",
-- deploy-on-person:                    Not available in DB
-- deploy-on-timestamp:                 Set to catch/session start_date
--                                      Format: yyyy-MM-dd'T'HH:mm:ss'Z'
  to_char(ses.start_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "deploy-on-timestamp",
-- deployment-comments:                 Set to session remarks, which contains unstructured info
--                                      such as "Waterland-Oudeman | Found dead on 2016-03-31 in
--                                      Alps, last active day is 2016-03-25. Tracker reused for
--                                      H185298."
  ses.remarks AS "deployment-comments",
-- deployment-end-comments:             Not available in DB: ses.remarks can contain this info, but
--                                      it is too unstructured to extract consistently
-- deployment-end-type:                 Set to "dead" (only) when session remarks contains the word
--                                      "dead". Other values from Movebank vocabulary cannot be
--                                      consistently derived.
  CASE
    WHEN lower(ses.remarks) LIKE '%dead%' THEN 'dead'
    WHEN lower(ses.remarks) LIKE '%defect%' THEN 'equipment failure'
    ELSE NULL
  END AS "deployment-end-type",
-- deployment-id:                       Set to internal session track_session_id
  ses.track_session_id AS "deployment-id",
-- duty-cycle:                          Not available in DB and variable over time
-- geolocator-calibration:              Not applicable
-- geolocator-light-threshold:          Not applicable
-- geolocator-sensor-comments:          Not applicable
-- geolocator-sun-elevation-angle:      Not applicable
-- habitat-according-to:                Not available in DB
-- location-accuracy-comments:          Set to "provided by GPS", refers to e.g. h_accuracy
--                                      recorded by tag
  'provided by the GPS unit' AS "location-accuracy-comments",
-- manipulation-comments:               Not available in DB and likely not applicable
-- manipulation_type:                   Not available in DB, but set via variable. Likely "none"
  {manipulation_type} AS "manipulation-type",
-- study-site:                          Set to project_key, e.g. MH_WATERLAND. project.station_name
--                                      or information in ses.remarks are potentially more precise
--                                      or human readable, but are not consistently populated and,
--                                      for project.station_name, not accessible for shared projects.
  ses.key_name AS "study-site",
-- tag-readout-method:                  Set to "other wireless" as it is zigbee two-way radio
--                                      transceiver via antenna
  'other wireless' AS "tag-readout-method",

-- TAGS
-- beacon-frequency:                    Not applicable, is for radio tags/retrieval beacon
-- sensor-type:                         Set to "GPS"
  'GPS' AS "sensor-type",
-- tag-comments:                        Not available in DB, ses.remarks can contain this info, but
--                                      it is too unstructured to extract consistently
-- tag-failure-comments:                Not available in DB, ses.remarks can contain this info, but
--                                      it is too unstructured to extract consistently
-- tag-id:                              Set to device_info_serial, as that is the public identifier
--                                      used in UvA-BiTS for tags (and not tracker_id)
  ses.device_info_serial AS "tag-id",
-- tag-manufacturer-name:               Set to "UvA-BiTS"
  'UvA-BiTS' AS "tag-manufacturer-name",
-- tag.mass
  tag.mass AS "tag-mass",
-- tag-model:                           Not available in DB and firmware version is not a good
--                                      substitute
-- tag-processing-type:                 Not applicable
-- tag-production-date:                 Not available in DB and firmware version is not a good
--                                      substitute
-- tag-serial-no:                       Set to device_info_serial
  ses.device_info_serial AS "tag-serial-no"
FROM
-- INDIVIDUALS
  (
    SELECT * FROM gps.ee_individual_limited
    UNION
    SELECT * FROM gps.ee_shared_individual_limited
  ) AS ind

-- TRACK SESSIONS
  LEFT JOIN (
    SELECT * FROM gps.ee_track_session_limited
    UNION
    SELECT * FROM gps.ee_shared_track_session_limited
  ) AS ses
    ON ses.individual_id = ind.individual_id

-- TRACKERS
  LEFT JOIN (
    SELECT * FROM gps.ee_tracker_limited
    UNION
    SELECT * FROM gps.ee_shared_tracker_limited
  ) AS tag
    ON tag.device_info_serial = ses.device_info_serial
WHERE
  ses.key_name = {project_id}
ORDER BY
  "deployment-id"
