/* Created by Peter Desmet (INBO)
 *
 * This query maps UvA-BiTS DB fields to Movebank attributes for metadata:
 * https://www.movebank.org/node/2381#metadata
 *
 * Order of terms is based on Movebank standard reference data format template:
 * https://www.movebank.org/movebank/Movebank-reference-data-template.xlsx
 */

SELECT
  s.key_name AS project,--                          not a Movebank field, but included for reference
  s.device_info_serial AS "tag-id",--               device_info_serial more widely used than tracker_id,
  i.ring_number AS "animal-id",--                   ring_number more widely used than individual_id
  s.track_session_id AS "deployment-id",
  i.species_latin_name AS "animal-taxon",
  s.start_date AT TIME ZONE 'utc' AS "deploy-on-timestamp",
  s.end_date AT TIME ZONE 'utc' AS "deploy-off-timestamp",-- set in the future for unclosed track sessions
  'GPS' AS "tag-type",
  i.remarks AS "animal-comments",--                 can contain animal name
  -- "animal-death-comments"                        not consistently available and expressible in DB
  -- "animal-exact-date-of-birth"                   not available in DB
  -- "animal-latest-date-born"                      not available in DB
  CASE
    WHEN i.sex = 'X' THEN NULL--                    not possible to express this in Movebank controlled list
    ELSE lower(i.sex)
  END AS "animal-sex",
  -- "animal-taxon-detail"                          not necessary, species_latin_name is expected to be supported in ITIS
  CASE
    WHEN i.colour_ring IN
      ('-', 'NA', 'None', 'none')
    THEN NULL--                                     colour_ring is a required field, so users resort to variations to express no ring
    ELSE i.colour_ring--                            colour_ring included here, as it is not included elsewhere. ring_number = animal-id
  END AS "ring-id",
  CASE
    WHEN {bird_remarks_is_nickname} THEN i.remarks--  if TRUE, get animal nickname from i.remarks
    ELSE NULL
  END AS "animal-nickname",--                       not in Movebank-reference-data-template, but is available in Movebank database
  {animal_life_stage} AS "animal-life-stage",--     not available in DB: likely "adult"
  i.mass AS "animal-mass",
  -- "animal-reproductive-condition"                not available in DB
  {attachment_type} AS "attachment-type",--         not available in DB: likely "harness" or "other" (for leg loops)
  -- "behavior-according-to"                        not available in DB: potentially supported in future
  -- "data-processing-software"                     not applicable: locations are in raw sensor data
  -- "deploy-off-person"                            not available in DB: person who removed tag
  -- "deploy-off-latitude"                          not available in DB
  -- "deploy-off-longitude"                         not available in DB
  -- "deploy-on-person"                             not available in DB: person who attached tag
  -- "deploy-on-latitude"                           is s.start_latitude, but Movebank term is primarily intended when sensor does not record precise positions
  -- "deploy-on-longitude"                          is s.start_longitude, but see s.start_latitude
  s.remarks AS "deployment-comments",
  -- "deployment-end-comments"                      s.remarks can contain this type of information, but unstructured, see "deployment-remarks" instead
  CASE
    WHEN lower(s.remarks) LIKE '%dead%' THEN 'dead'-- track session remarks contains word "dead"
    ELSE NULL--                                     other values from Movebank controlled list cannot be consistently derived
  END AS "deployment-end-type",
  -- "duty-cycle"                                   not available in DB and variable over time
  -- "geolocator-calibration"                       not applicable
  -- "geolocator-light-threshold"                   not applicable
  -- "geolocator-sensor-comments"                   not applicable
  -- "geolocator-sun-elevation-angle"               not applicable
  -- "habitat-according-to"                         habitat information not available/uploaded to Movebank, potentially supported in future
  'provided by the GPS unit' AS "location-accuracy-comments",-- refers to e.g. h_accuracy recorded by tag
  -- "manipulation-comments"                        not available in DB and mostly not applicable
  {manipulation_type} AS "manipulation-type",--     not available in DB: likely "none"
  s.key_name AS "study-site",--                     project.station_name would have been slightly more human readable, but not accessible for shared projects
  'other wireless' AS "tag-readout-method",--       zigbee two-way radio transceiver via antenna
  -- "beacon-frequency"                             not applicable: for radio tags/retrieval beacon
  -- "tag-comments"                                 s.remarks can contain this type of information, but unstructured, see "deployment-comments" instead
  -- "tag-failure-comments"                         s.remarks can contain this type of information, but unstructured, see "deployment-comments" instead
  'University of Amsterdam Bird Tracking System (UvA-BiTS)' AS "tag-manufacturer-name",
  t.mass AS "tag-mass",
  -- "tag-model"                                    not available in DB: firmware version not a good substitute
  -- "tag-processing-type"                          not applicable
  -- "tag-production-date"                          not available in DB: firmware version not a good substitute
  s.device_info_serial AS "tag-serial-no"
FROM
  -- individuals
  (
    SELECT * FROM gps.ee_individual_limited
    UNION
    SELECT * FROM gps.ee_shared_individual_limited
  ) AS i

  -- track sessions
  LEFT JOIN (
    SELECT * FROM gps.ee_track_session_limited
    UNION
    SELECT * FROM gps.ee_shared_track_session_limited
  ) AS s
    ON s.individual_id = i.individual_id

  -- species
  LEFT JOIN gps.ee_species_limited AS sp
    ON sp.latin_name = i.species_latin_name

  -- trackers
  LEFT JOIN (
    SELECT * FROM gps.ee_tracker_limited
    UNION
    SELECT * FROM gps.ee_shared_tracker_limited
  ) AS t
    ON t.device_info_serial = s.device_info_serial
WHERE
  s.key_name = {project}
ORDER BY
  project,
  "deployment-id"
