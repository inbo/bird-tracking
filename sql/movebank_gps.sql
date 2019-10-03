/* Created by Peter Desmet (INBO)
 *
 * This query retrieves UvA-BiTS gps data in the Movebank data format
 * (https://www.movebank.org/node/2381#data). It queries detections in
 * ee_(shared_)tracking_speed_limited that fall within a
 * ee_(shared_)track_session_limited for a specific ring_number.
 *
 * Upload to Movebank as:
 * Tracking data > GPS data > custom GPS data
 *
 * The UvA-BiTS fields that could not be mapped to Movebank are:
 *
 * gps.x_speed                                      x ground speed measured by tag in m/s
 * gps.y_speed                                      y ground speed measured by tag in m/s
 * gps.z_speed                                      z ground speed measured by tag in m/s
 * gps.speed_accuracy                               accuracy measured by tag on those speeds
 * gps.speed_3d                                     ground speed calculated from x_speed, y_speed and z_speed
 * gps.location                                     not useful: postgreSQL geometry
 * gps.altitude_agl                                 cannot be mapped: is recorded altitude minus reference digital elevation model
 */

SELECT
  ses.key_name AS project,--                        not a Movebank field, but included for reference
  ses.device_info_serial AS "tag-id",
  ses.ring_number AS "animal-id",
  -- "acceleration-axes"                            not applicable: acceleration might have different timestamp than fix
  -- "acceleration-raw-x"                           not applicable: see acceleration-axes
  -- "acceleration-raw-y"                           not applicable: see acceleration-axes
  -- "acceleration-raw-z"                           not applicable: see acceleration-axes
  -- "acceleration-sampling-frequency-per-axis"     not applicable: see acceleration-axes
  -- "acceleration-x"                               not applicable: see acceleration-axes
  -- "acceleration-y"                               not applicable: see acceleration-axes
  -- "acceleration-z"                               not applicable: see acceleration-axes
  -- "accelerations-raw"                            not applicable: see acceleration-axes
  -- "activity-count"                               not applicable
  -- "algorithm-marked-outlier"                     not applicable: reserved for Movebank filters
  -- "barometric depth"                             not applicable
  -- "barometric-height"                            not available in DB: if pressure is measured (special tags) it is not converted to height
  gps.pressure/100 AS "barometric-pressure",--      measured in Pascal, converted to HPa
  -- "battery-charge-percent"                       not available in DB
  -- "battery-charging-current"                     not available in DB
  -- "behavioural-classification"                   not available in DB: potentially supported in future
  -- "comments"                                     not available in DB
  -- "compass-heading"                              not available in DB
  -- "conductivity"                                 not available in DB
  -- "end-timestamp"                                not necessary: single timestamp
  -- "event-id"                                     not available in DB: no unique detection identifiers in DB
  -- "geolocator-fix-type"                          not applicable
  -- "geolocator-rise"                              not applicable
  -- "geolocator-twilight3"                         not applicable
  gps.positiondop AS "gps-dop",
  -- "gps-fix-type"                                 not available in DB
  -- "gps-fix-type-raw"                             not available in DB
  -- "gps-hdop"                                     not available in DB
  -- "gps-maximum-signal-strength"                  not available in DB
  gps.satellites_used AS "gps-satellite-count",
  gps.gps_fixtime AS "gps-time-to-fix",--           in seconds
  -- "gps-vdop"                                     not available in DB
  speed_2d as "ground-speed",--                     ground speed calculated from x_speed and y_speed (both measured by tag), in m/s
  -- "gsm-mcc-mnc"                                  not available in DB
  -- "gsm-signal-strength"                          not available in DB
  -- "habitat"                                      not available in DB
  CASE
    WHEN gps.direction < 0 THEN 360 + gps.direction--direction measured by sensor, in degrees from north (0-360), so negative values have to be converted (e.g -178 = 182 = almost south)
    ELSE gps.direction
  END AS "heading",--
  -- "height-above-ellipsoid"                       not available in DB
  gps.altitude AS "height-above-mean-sea-level",--  defined in DB as "Altitude above sea level measured by GPS tag in meters"
  -- "height-raw"                                   not available in DB
  -- "import-marked-outlier"                        not available in DB: for flagging with *automated* methods outside of Movebank, opted not to calculate as it is always opinionated
  -- "lat-lower"                                    not applicable
  -- "lat-upper"                                    not applicable
  -- "light-level"                                  not applicable
  -- "local-timestamp"                              not available in DB: won't calculate either
  gps.latitude AS "location-lat",--                 in decimal degrees
  gps.longitude AS "location-long",--               in decimal degrees
  gps.h_accuracy AS "location-error-numerical",--   in meters, is *horizontal* error
  -- "location-error-percentile"                    not applicable
  -- "location-error-text"                          not applicable
  -- "long-lower"                                   not applicable
  -- "long-upper"                                   not applicable
  -- "magnetic-field-raw-x"                         not available in DB
  -- "magnetic-field-raw-y"                         not available in DB
  -- "magnetic-field-raw-z"                         not available in DB
  CASE
    WHEN gps.userflag <> 0 THEN TRUE--              defined in DB as "Data flagged as unacceptable by user if not equal to 0."
    ELSE FALSE--                                    including default values 0
  END AS "manually-marked-outlier",--               "may also include outliers identified using other methods": since method for setting userflag is unknown in DB, this fits definition
  -- "manually-marked-valid"                        not available in DB: userflag does not allow to explicitly set record as valid
  -- "migration-stage-custom"                       not available in DB
  -- "migration-stage-standard"                     not available in DB
  -- "modelled"                                     FALSE for all
  -- "proofed"                                      FALSE for all, but not guaranteed
  -- "raptor-workshop-behavior"                     not applicable
  -- "raptor-workshop-deployment-special-event"     not applicable
  -- "raptor-workshop-migration-state"              not applicable
  -- "sampling-frequency"                           not available in DB
  -- "start-timestamp"                              not necessary: single timestamp
  -- "study-specific-measurement"                   not available in DB
  -- "study-time-zone"                              not available in DB
  -- "tag-technical-specification"                  not necessary
  -- "tag-voltage"                                  not available in DB
  gps.temperature AS "temperature-external",--      in degrees Celcius and is not body temperature
  -- "temperature-max"                              not available in DB
  -- "temperature-min"                              not available in DB
  -- "tilt-angle"                                   not applicable: see acceleration-axes
  -- "tilt-x"                                       not applicable: see acceleration-axes
  -- "tilt-y"                                       not applicable: see acceleration-axes
  -- "tilt-z"                                       not applicable: see acceleration-axes
  -- "transmission-timestamp"                       not available in DB
  -- "twilight"                                     not applicable
  -- "twilight-excluded"                            not applicable
  -- "twilight-inserted"                            not applicable
  -- "underwater-count"                             not available in DB
  -- "underwater-time"                              not available in DB
  -- "utm-easting"                                  not applicable
  -- "utm-northing"                                 not applicable
  -- "utm-zone"                                     not applicable
  gps.v_accuracy AS "vertical-error-numerical"--    in meters
  -- "visible"                                      not applicable: calculated Movebank value
  -- "waterbird-workshop-behavior"                  not applicable
  -- "waterbird-workshop-deployment-special-event"  not applicable
  -- "waterbird-workshop-migration-state"           not applicable
  -- "wet-count"                                    not applicable
  to_char(gps.date_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "timestamp",
FROM
  -- track session for ring_number
  (
    SELECT * FROM gps.{`track_session_table`} WHERE ring_number = {ring_number}
  ) AS ses

  -- gps
  LEFT JOIN gps.{`tracking_speed_table`} AS gps
    ON gps.device_info_serial = ses.device_info_serial
    AND gps.date_time BETWEEN ses.start_date AND ses.end_date
    -- Because some tracking sessions have no meaningful track_session_end_date,
    -- we'll use today's date to exclude erroneous records in the future
    AND gps.date_time <= current_date
ORDER BY
  gps.date_time
