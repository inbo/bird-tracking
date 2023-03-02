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
tag.start_date                          Not relevant
tag.end_date                            Not relevant
*/

SELECT
-- ANIMALS
-- animal-birth-hatch-latitude:         Not available in DB
-- animal-birth-hatch-longitude:        Not available in DB
-- animal-comments:                     Set to individual remarks, which generally only contains
--                                      animal name
  ind.remarks AS "animal-comments",
-- animal-death-comments:               Not available in DB, ses.remarks can contain this info, but
--                                      it is too unstructured to extract consistently
-- animal-earliest-date-born:           Not available in DB
-- animal-exact-date-of-birth:          Not available in DB
-- animal-group-id:                     Not applicable, animals are single individuals
-- animal-id:                           Set to ring_number, as that is the public identifier used in
--                                      UvA-BiTS for animals (and not animal_id)
  ind.ring_number AS "animal-id",
-- animal-latest-date-born:             Not available in DB
-- animal-marker-id:                    Not available in DB
-- animal-mates                         Not available in DB
-- animal-mortality-latitude            Not available in DB
-- animal-mortality-longitude           Not available in DB
-- animal-mortality-type                Not available in DB, but deployment-end-type is set
-- animal-nickname:                     Set to individual remarks if bird_remarks_is_nickname is set
--                                      to TRUE
  CASE
    WHEN {bird_remarks_is_nickname} THEN ind.remarks
    ELSE NULL
  END AS "animal-nickname",
-- animal-offspring:                    Not available in DB
-- animal-parents:                      Not available in DB
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
-- animal-siblings:                     Not available in DB
-- animal-taxon                         Set to individual species_latin_name
  ind.species_latin_name AS "animal-taxon",
-- animal-taxon-detail:                 Not necessary, species_latin_name is expected to be
--                                      supported in ITIS.

-- DEPLOYMENTS
-- alt-project-id:
  ses.key_name AS "alt-project-id",
-- animal-life-stage:                   Set via variable or get via lifestage: value in ses.remarks.
  CASE
    WHEN ses.remarks LIKE '%life_stage%' THEN
      split_part(substring(ses.remarks, 'life_stage: [a-z]+'), ': ', 2)
    ELSE {animal_life_stage}
  END AS "animal-life-stage",
-- animal-mass                          Set to individual mass
  ind.mass::text AS "animal-mass",
-- animal-reproductive-condition:       Not available in DB
-- attachment-type:                     Set to "harness"
  'harness' AS "attachment-type",
-- behavior-according-to:               Not available in DB
-- capture-handling-time:               Not available in DB
-- capture-latitude:                    Not always same as ses.start_latitude
-- capture-longitude:                   Not always same as ses.start_longitude
-- capture-timestamp:                   Not available in DB
-- data-processing-software:            Not applicable, locations are in raw sensor data
-- dba-comments:                        Not applicable
-- deploy-off-latitude:                 Not available in DB, no info on recatch
-- deploy-off-longitude:                Not available in DB, no info on recatch
-- deploy-off-measurements:             Not available in DB
-- deploy-off-person:                   Not available in DB, no info on recatch
-- deploy-off-sampling:                 Not available in DB
-- deploy-off-timestamp:                Set to session end_date (UTC), often open. Year 9999 is not
--                                      accepted by Movebank and is set to undefined.
--                                      Format: yyyy-MM-dd'T'HH:mm:ss'Z'
  CASE
    WHEN ses.end_date > current_date THEN NULL
    ELSE to_char(ses.end_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  END AS "deploy-off-timestamp",
-- deploy-on-latitude:                  Set to catch/session start_latitude
  ses.start_latitude::text AS "deploy-on-latitude",
-- deploy-on-longitude:                 Set to catch/session start_longitude
  ses.start_longitude::text AS "deploy-on-longitude",
-- deploy-on-measurements:              ???
-- deploy-on-person:                    Not available in DB
-- deploy-on-sampling:                  Not available in DB
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
    WHEN lower(ses.remarks) LIKE '%malfunction%' THEN 'equipment failure'
    ELSE NULL
  END AS "deployment-end-type",
-- deployment-id:                       Set to internal session track_session_id
  ses.track_session_id AS "deployment-id",
-- duty-cycle:                          Not available in DB and variable over time
-- geolocator-calibration:              Not applicable
-- geolocator-light-threshold:          Not applicable
-- geolocator-sensor-comments:          Not applicable
-- geolocator-sun-elevation-angle:      Not applicable
-- georeference-protocol                Not applicable
-- habitat-according-to:                Not available in DB
-- location-accuracy-comments:          Set to "provided by GPS", refers to e.g. h_accuracy
--                                      recorded by tag
  'provided by the GPS unit' AS "location-accuracy-comments",
-- manipulation-comments:               Not available in DB and likely not applicable
-- manipulation_type:                   Not available in DB, but set via variable. Likely "none"
  {manipulation_type} AS "manipulation-type",
-- outlier-comments:                    "import-marked-outliers" can be set with outliers.Rmd,
--                                      but opted not to include here as it might not be applied.
-- study-site:                          Set to start of ses.remarks (starting with capital letter)
--                                      until a space is encountered. This is expected to be the
--                                      release location.
  substring(ses.remarks from '^[A-Z][^ ]+') AS "study-site",
-- tag-firmware:
  tag.firmware_version AS "tag-firmware",
-- tag-readout-method:                  Set to "other wireless" as it is zigbee two-way radio
--                                      transceiver via antenna
  'other wireless' AS "tag-readout-method",

-- TAGS
-- sensor-type:                         Set to "GPS"
  'GPS' AS "sensor-type",
-- tag-beacon-frequency:                Not applicable, is for radio tags/retrieval beacon
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
  tag.mass::text AS "tag-mass",
-- tag-model:                           Not available in DB
-- tag-processing-type:                 Not applicable
-- tag-production-date:                 Not available in DB
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
