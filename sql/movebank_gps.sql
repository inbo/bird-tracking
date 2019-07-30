/* Created by Peter Desmet (INBO)
 *
 * This query maps UvA-BiTS DB fields to Movebank attributes for data:
 * https://www.movebank.org/node/2381#data (in the order listed there)
 *
 * The main DB table used is gps.ee_tracking_speed_limited with additional
 * calculations provided by the function get_uvagps_track_speed_incl_shared().
 *
 * The fields from that table that could not be mapped to Movebank are:
 *
 * t.x_speed                                        x speed measured by tag in m/s
 * t.y_speed                                        y speed measured by tag in m/s
 * t.z_speed                                        z speed measured by tag in m/s
 * t.speed_accuracy                                 accuracy measured by tag on those speeds
 * t.speed_3d                                       speed calculated from x_speed, y_speed and z_speed
 * t.speed_2d                                       speed calculated from x_speed and y_speed, not the same as airspeed
 * t.location                                       not useful: postgreSQL geometry
 * t.altitude_agl                                   cannot be mapped: is recorded altitude minus reference digital elevation model
 *
 * calc.distance                                    not necessary: can be calculated and calc.speed is included
 * calc.interval                                    not necessary: can be calculated and calc.speed is included
 */

SELECT
  s.key_name AS project,--                          not a Movebank field, but included for reference
  s.device_info_serial AS "tag-id",
  s.ring_number AS "animal-id",
  -- "acceleration-axes"                            not applicable: acceleration might have different timestamp than fix
  -- "acceleration-raw-x"                           not applicable: see acceleration-axes
  -- "acceleration-raw-y"                           not applicable: see acceleration-axes
  -- "acceleration-raw-z"                           not applicable: see acceleration-axes
  -- "acceleration-x"                               not applicable: see acceleration-axes
  -- "acceleration-y"                               not applicable: see acceleration-axes
  -- "acceleration-z"                               not applicable: see acceleration-axes
  -- "acceleration-sampling-frequency-per-axis"     not applicable: see acceleration-axes
  -- "accelerations-raw"                            not applicable: see acceleration-axes
  -- "activity-count"                               not applicable
  CASE
    WHEN t.speed_2d > 30 THEN TRUE--                TO VERIFY: should be average of (i-1) (i+1) speed
    ELSE FALSE
  END AS "algorithm-marked-outlier",
  -- "barometric depth"                             not applicable
  -- "barometric-height"                            not available in DB: if pressure is measured (special tags) it is not converted to height
  t.pressure/100 AS "barometric-pressure",--        measured in Pascal, converted to HPa
  -- "battery-charge-percent"                       not available in DB
  -- "battery-charging-current"                     not available in DB
  -- "behavioural-classification"                   not available in DB: potentially supported in future
  -- "compass-heading"                              not available in DB
  -- "conductivity"                                 not available in DB
  -- "end-timestamp"                                not necessary: single timestamp
  -- "event-comments"                               not necessary
  -- "event-id"                                     not available in DB
  -- "geolocator-fix-type"                          not applicable
  -- "gps-fix-type"                                 not available in DB
  t.positiondop AS "gps-dop",
  -- "gps-hdop"                                     not available in DB
  -- "gps-maximum-signal-strength"                  not available in DB
  t.satellites_used AS "gps-satellite-count",
  t.gps_fixtime AS "gps-time-to-fix",--             in seconds
  -- "gps-vdop"                                     not available in DB
  -- "gsm-mcc-mnc"                                  not available in DB
  -- "gsm-signal-strength"                          not available in DB
  -- calc.speed AS "ground-speed",--                TO VERIFY in m/s "between consecutive locations" => calc.speed (but to previous fix)
  -- "habitat"                                      not available in DB: potentially supported in future based on Corine land use
  CASE
    WHEN t.direction < 0 THEN 360 + t.direction--   in degrees from north (0-360), so negative values have to be converted (e.g -178 = 182 = almost south)
    ELSE t.direction
  END AS "heading",--                               opted to provide direction measured by sensor, as that cannot be calculated (as opposed to calc.direction between fixes)
  -- "height-above-ellipsoid"                       not available in DB
  t.altitude AS "height-above-mean-sea-level",--    defined in DB as "Altitude above sea level measured by GPS tag in meters"
  -- "height-raw"                                   not available in DB
  t.latitude AS "latitude",--                       in decimal degrees
  -- "latitude-utm"                                 not applicable
  -- "light-level"                                  not applicable
  -- "local-timestamp"                              not available in DB: won't calculate either
  t.h_accuracy AS "location-error-numerical",--     in meters, is *horizontal* error
  -- "location-error-text"                          not applicable
  -- "location-error-percentile"                    not applicable
  t.longitude AS "longitude",--                     in decimal degrees
  -- "longitude-utm"                                not applicable
  -- "magnetic-field-raw-x"                         not available in DB
  -- "magnetic-field-raw-y"                         not available in DB
  -- "magnetic-field-raw-z"                         not available in DB
  CASE
    WHEN t.userflag <> 0 THEN TRUE--                defined in DB as "Data flagged as unacceptable by user if not equal to 0."
    ELSE NULL--                                     including default values 0
  END AS "manually-marked-outlier",
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
  -- "study-specific-measurement"                   not necessary
  -- "study-time-zone"                              not available in DB and potentially variable
  -- "tag-technical-specification"                  not necessary
  -- "tag-voltage"                                  not available in DB
  t.temperature AS "temperature-external",--        in degrees Celcius, not body temperature
  -- "temperature-max"                              not available in DB
  -- "temperature-min"                              not available in DB
  -- "tilt-angle"                                   not applicable: see acceleration-axes
  -- "tilt-x"                                       not applicable: see acceleration-axes
  -- "tilt-y"                                       not applicable: see acceleration-axes
  -- "tilt-z"                                       not applicable: see acceleration-axes
  t.date_time AT TIME ZONE 'utc' AS "timestamp",
  -- "transmission-timestamp"                       not available in DB
  -- "underwater-count"                             not available in DB
  -- "underwater-time"                              not available in DB
  -- "utm-zone"                                     not applicable
  t.v_accuracy AS "vertical-error-numerical"--      in meters
  -- "visible"                                      not applicable: calculated Movebank value
  -- "waterbird-workshop-behavior"                  not applicable
  -- "waterbird-workshop-deployment-special-event"  not applicable
  -- "waterbird-workshop-migration-state"           not applicable
FROM
  -- track session for ring_number
  (
    SELECT * FROM gps.{`track_session_table`} WHERE ring_number = {ring_number}
  ) AS s

  -- gps
  LEFT JOIN gps.{`tracking_speed_table`} AS t
    ON t.device_info_serial = s.device_info_serial
    AND t.date_time BETWEEN s.start_date AND s.end_date
    -- Because some tracking sessions have no meaningful track_session_end_date,
    -- we'll use today's date to exclude erroneous records in the future
    AND t.date_time <= current_date
ORDER BY
  t.date_time
