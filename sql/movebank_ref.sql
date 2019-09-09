/* Created by Peter Desmet (INBO)
 *
 * This query maps UvA-BiTS DB fields to Movebank attributes for metadata:
 * https://www.movebank.org/node/2381#metadata
 *
 * Order of terms is based on Movebank standard reference data format template:
 * https://www.movebank.org/movebank/Movebank-reference-data-template.xlsx
 *
 * It joins individuals in ee_(shared_)individual_limited and their associated
 * ee_(shared_)track_session_limited, with extra information from
 * ee_(shared_)tracker_limited.
 *
 * The fields from that view that could not be mapped to Movebank are:
 *
 * i.individual_id                                  internal id, opted to use ring_number instead
 * i.start_date                                     not relevant
 * i.end_date                                       not relevant
 * s.project_id                                     internal id, opted to use key_name instead
 * s.tracker_id / t.tracker.id                      internal id, opted to use device_info_serial insteal
 * t.firmware_version                               cannot be mapped
 * t.start_date                                     not relevant
 * t.end_date                                       not relevant
 * t.x_o                                            cannot be mapped: accelerometer calibration
 * t.x_s                                            cannot be mapped: accelerometer calibration
 * t.y_o                                            cannot be mapped: accelerometer calibration
 * t.y_s                                            cannot be mapped: accelerometer calibration
 * t.z_o                                            cannot be mapped: accelerometer calibration
 * t.z_s                                            cannot be mapped: accelerometer calibration
 */

SELECT
  s.key_name AS project,--                          not a Movebank field, but included for reference

  -- animals
  i.remarks AS "animal-comments",--                 can contain animal name
  -- "animal-death-comments"                        not consistently available and expressible in DB
  -- "animal-earliest-date-born"                    not available in DB
  -- "animal-exact-date-of-birth"                   not available in DB
  i.ring_number AS "animal-id",--                   ring_number is more widely used to refer animal than individual_id
  -- "animal-latest-date-born"                      not available in DB
  CASE
    WHEN {bird_remarks_is_nickname} THEN i.remarks--  if TRUE, get animal nickname from i.remarks
    ELSE NULL
  END AS "animal-nickname",
  CASE
    WHEN i.colour_ring IN
      ('-', 'NA', 'None', 'none', '0000')
    THEN NULL--                                     colour_ring is a required field, so users resort to variations to express no ring
    ELSE i.colour_ring
  END AS "animal-ring-id",--                        opted to include colour_ring here, as it is not included elsewhere. ring_number = animal-id
  CASE
    WHEN i.sex = 'X' THEN NULL--                    not possible to express this in Movebank controlled list
    ELSE lower(i.sex)
  END AS "animal-sex",
  i.species_latin_name AS "animal-taxon",
  -- "animal-taxon-detail"                          not necessary, species_latin_name is expected to be supported in ITIS

  -- deployments
  {animal_life_stage} AS "animal-life-stage",--     not available in DB: likely "adult"
  i.mass AS "animal-mass",
  -- "animal-reproductive-condition"                not available in DB
  {attachment_type} AS "attachment-type",--         not available in DB: likely "harness" or "other" (for leg loops)
  -- "behavior-according-to"                        not available in DB
  -- "data-processing-software"                     not applicable: locations are in raw sensor data
  -- "deploy-off-latitude"                          not available in DB
  -- "deploy-off-longitude"                         not available in DB
  -- "deploy-off-person"                            not available in DB: person who removed tag
  CASE
    WHEN s.end_date = '9999-12-31' THEN NULL--     year 9999 not accepted by Movebank, better to set to undefined
    ELSE s.end_date AT TIME ZONE 'utc'--            some end_dates will still be set in (near) future
  END AS "deploy-off-timestamp",
  s.start_latitude AS "deploy-on-latitude",
  s.start_longitude AS "deploy-on-longitude",
  -- "deploy-on-person"                             not available in DB: person who attached tag
  s.start_date AT TIME ZONE 'utc' AS "deploy-on-timestamp",
  s.remarks AS "deployment-comments",
  -- "deployment-end-comments"                      s.remarks can contain this type of information, but unstructured, see "deployment-remarks" instead
  CASE
    WHEN lower(s.remarks) LIKE '%dead%' THEN 'dead'-- track session remarks contains word "dead"
    ELSE NULL--                                     other values from Movebank controlled list cannot be consistently derived
  END AS "deployment-end-type",
  s.track_session_id AS "deployment-id",
  -- "duty-cycle"                                   not available in DB and variable over time
  -- "geolocator-calibration"                       not applicable
  -- "geolocator-light-threshold"                   not applicable
  -- "geolocator-sensor-comments"                   not applicable
  -- "geolocator-sun-elevation-angle"               not applicable
  -- "habitat-according-to"                         not available in DB
  'provided by the GPS unit' AS "location-accuracy-comments",-- refers to e.g. h_accuracy recorded by tag
  -- "manipulation-comments"                        not available in DB and mostly not applicable
  {manipulation_type} AS "manipulation-type",--     not available in DB: likely "none"
  s.key_name AS "study-site",--                     project.station_name would have been slightly more human readable, but not accessible for shared projects
  'other wireless' AS "tag-readout-method",--       zigbee two-way radio transceiver via antenna

  -- tags
  -- "beacon-frequency"                             not applicable: for radio tags/retrieval beacon
  'GPS' AS "sensor-type",
  -- "tag-comments"                                 s.remarks can contain this type of information, but unstructured, see "deployment-comments" instead
  -- "tag-failure-comments"                         s.remarks can contain this type of information, but unstructured, see "deployment-comments" instead
  s.device_info_serial AS "tag-id",--               device_info_serial more widely used than tracker_id,
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
