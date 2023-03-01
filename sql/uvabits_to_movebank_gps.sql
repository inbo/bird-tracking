/*
Created by Peter Desmet (INBO)

This query retrieves UvA-BiTS gps data in the Movebank data format
(https://www.movebank.org/node/2381#data). It queries detections in
ee_(shared_)tracking_speed_limited that fall within a
ee_(shared_)track_session_limited for a specific ring_number.

Upload resulting data to Movebank as:
Tracking data > GPS data > custom GPS data

The UvA-BiTS fields that could not be mapped to Movebank are:

gps.x_speed                             Opted to use speed_2d (based on x_speed) instead
gps.y_speed                             Opted to use speed_2d (based on y_speed) instead
gps.z_speed                             Cannot be mapped: is z ground speed measured by tag in m/s
gps.speed_accuracy                      Cannot be mapped: is accuracy measured by tag on those speeds
gps.speed_3d                            Cannot be mapped: is ground speed calculated from x_speed,
                                        y_speed and z_speed
gps.location                            Not relevant: postgreSQL geometry
gps.altitude_agl                        Not relevant: is recorded altitude minus reference
                                        digital elevation model
*/

-- Get track session information for ring_number
WITH session AS (
  SELECT
    ring_number,
    device_info_serial,
    key_name,
    start_date,
    end_date
  FROM gps.{`track_session_table`}
  WHERE ring_number = {ring_number}
)

SELECT
-- GPS DATA
-- tag-id:                              Set to device_info_serial, see movebank_ref data
  ses.device_info_serial AS "tag-id",
-- animal-id:                           Set to ring_number, see movebank_ref data
  ses.ring_number AS "animal-id",

-- acceleration terms:                  Not applicable, see movebank_acc data. Acceleration
--                                      measurements are uploaded separately as they 1) are not
--                                      always associated with a gps fix and 2) contain multiple
--                                      rows per date_time
-- activity terms:                      Not available in DB
-- algorithm-marked-outlier:            Not available in DB and reserved for Movebank filters
-- alt-index-id:                        Not available in DB
-- angular terms:                       Not applicable
-- argos terms:                         Not applicable
-- barometric-depth:                    Not applicable, for water pressure
-- barometric-height:                   Not available in DB, if barometric pressure is measured,
--                                      it is not converted to altitude
-- barometric-pressure:                 Set to pressure, which is only populated for pressure tags.
--                                      Unit Pascal is converted to Movebank expected hPa.
  gps.pressure/100 AS "barometric-pressure",
-- bas terms:                           Not applicable
-- battery-charge-percent:              Not available in DB
-- battery-charging-current:            Not available in DB
-- behavioural-classification:          Not available in DB, at least not as raw data. There are
--                                      studies that derive this info from acceleration data.
-- comments:                            Not available in DB
-- compass-heading:                     Not available in DB
-- conductivity:                        Not available in DB
-- cpu-tempurature:                     Not available in DB
-- ctt-solar-current-since-last-fix:    Not applicable
-- data-decoding-software:              Not applicable
-- ecg-raw:                             Not applicable
-- ecg-sampling-frequency:              Not applicable
-- ecgs-raw:                            Not applicable
-- end-timestamp:                       Not applicable, fix has single timestamp
-- eobs terms:                          Not applicable
-- event-group-id                       Not applicable
-- event-id:                            Not available in DB, there are no unique identifiers for fixes
-- external-temperature:                Mapped to "temperature-external"
-- flt-switch:                          Not applicable
-- geolocator terms:                    Not applicable
-- gmatrix terms:                       Not applicable
-- gps-dop:                             Set to positiondop
  gps.positiondop AS "gps-dop",
-- gps-fix-type:                        Not available in DB
-- gps-fix-type-raw:                    Not available in DB
-- gps-gdop:                            Not available in DB
-- gps-hdop:                            Not available in DB
-- gps-maximum-signal-strength:         Not available in DB
-- gps-message-count:                   Not available in DB
-- gps-pdop:                            Not available in DB
-- gps-satellite-count:                 Set to satellites_used
  gps.satellites_used AS "gps-satellite-count",
-- gps-speed-accuracy-estimate:         Not available in DB
-- gps-tdop:                            Not available in DB
-- gps-time-to-fix:                     Set to gps_fixtime, is expressed in seconds
  gps.gps_fixtime AS "gps-time-to-fix",
-- gps-twilight:                        Not available in DB
-- gps-vdop:                            Not available in DB
-- ground-speed:                        Set to ground speed measured by tracker, i.e. speed_2d which
--                                      is based on the directly measured x_speed and y_speed
  speed_2d as "ground-speed",
-- gsm-mcc-mnc:                         Not available in DB
-- gsm-signal-strength:                 Not available in DB
-- gt-sys-week:                         Not available in DB
-- gt-tx-count:                         Not available in DB
-- gyroscope-axes:                      Not available in DB
-- gyroscope-sampling-frequency-per-axis: Not available in DB
-- habitat:                             Not available in DB
-- heading:                             Set to direction measured by sensor, in degrees from north
--                                      (0-360), so negative values have to be converted e.g.
--                                      -178 = 182 = almost south
  CASE
    WHEN gps.direction < 0 THEN 360 + gps.direction
    ELSE gps.direction
  END AS "heading",
-- height-above-ellipsoid:              Not available in DB
-- height-above-ground-level:           Not available in DB
-- height-above-mean-sea-level:         Set to altitude, which is defined in DB as "Altitude above
--                                      sea level measured by GPS tag in meters"
  gps.altitude AS "height-above-mean-sea-level",
-- height-raw:                          Not available in DB
-- icarus-solar-cell-current:           Not applicable
-- import-marked-outlier:               Not available in DB, is reserved for automated flagging by
--                                      provider outside Movebank, but UvA-BiTS does not use
--                                      automated flagging. Set later with outliers.Rmd
-- individual-count:                    Not applicable, animals are single individuals
-- internal-temperature:                Not available in DB
-- lat terms:                           Not applicable, fix has single position
-- light-level:                         Not applicable
-- locality:                            Not available in DB
-- location-error-numerical:            Not applicable
-- location-lat:                        Set to latitude as stored in DB, in decimal degrees WGS84
  gps.latitude AS "location-lat",
-- location-long:                       Set to longitude as stored in DB, in decimal degrees WGS84
  gps.longitude AS "location-long",
-- gps.h_accuracy                       Set to horizontal error, in meters
  gps.h_accuracy AS "location-error-numerical",
-- location-error-percentile:           Not applicable
-- location-error-text:                 Not applicable
-- long terms:                          Not applicable, fix has single position
-- lotek terms:                         Not applicable
-- magnetic terms:                      Not available in DB
-- manipulation-status:                 Not available in DB
-- manually-marked-outlier:             Set to userflag, which is defined in DB as "Data flagged as
--                                      unacceptable by user if not equal to 0.". This fits the
--                                      definition "may also include outliers identified using other
--                                      methods".
  CASE
    WHEN gps.userflag <> 0 THEN TRUE
    ELSE FALSE
  END AS "manually-marked-outlier",
-- manually-marked-valid:               Not available in DB, userflag does not allow to explicitly
--                                      set record as valid
-- migration-stage:                     Not available in DB
-- migration-stage-standard:            Not available in DB
-- modelled:                            Not set, because FALSE for all
-- mortality-status:                    Not available in DB
-- mw terms:                            Not applicable
-- odba:                                Not available in DB
-- orientation terms:                   Not applicable
-- ornitela transmission protocol:      Not applicable
-- pitch:                               Not available in DB
-- proofed:                             Not set, likely FALSE for all, but not guaranteed
-- provider-update-timestamp:           Opted not to include
-- receiver terms:                      Not applicable
-- relative-humidity:                   Not available in DB
-- roll:                                Not available in DB
-- rr-interval:                         Not available in DB
-- sampling-frequency:                  Not available in DB
-- savannah terms:                      Not applicable
-- sensor-type:                         'GPS', but set automatically when uploading data
-- sequence-number:                     Not applicable
-- sigfox terms:                        Not applicable
-- solar terms:                         Not applicable
-- speed-accuracy:                      Not available in DB
-- start-timestamp:                     Not applicable, fix has single timestamp
-- study-local-timestamp:               Not available in DB and opted not to calculate either
-- study-specific-measurement:          Not available in DB
-- study-time-zone                      Not available in DB
-- tag-backup-voltage:                  Not available in DB
-- tag-tech-spec:                       Not necessary, see movebank_ref data
-- tag-voltage:                         Not available in DB
-- technosmart-signal-quality:          Not applicable
-- telemetry terms:                     Not applicable
-- temperature-external:                Set to (external) "Temperature measured by GPS tag sensor in
--                                      Celsius"
  gps.temperature AS "temperature-external",
-- temperature-max:                     Not available in DB
-- temperature-min:                     Not available in DB
-- tilt terms:                          Not applicable, see movebank_acc data
-- timestamp:                           Set to date_time, is in UTC. Converted to text to avoid
--                                      automatic conversions. Format: yyyy-MM-dd'T'HH:mm:ss'Z'
  to_char(gps.date_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "timestamp",
-- tinyfox terms:                       Not applicable
-- track-segment-id:                    Not available in DB
-- transmission-protocol:               Not available in DB, see tag-readout-method in movebank_ref
-- transmission-timestamp:              Not available in DB
-- twilight terms:                      Not applicable
-- underwater terms:                    Not applicable
-- utm terms:                           Not applicable
-- vedba:                               Not available in DB
-- vertical-error-numerical:            Set to v_accuracy, is in meters
  gps.v_accuracy AS "vertical-error-numerical"
-- vertical-speed:                      Not available in DB
-- visible:                             Not applicable, is a calculated Movebank value
-- wc-residual:                         Not applicable
-- wet terms:                           Not applicable
-- Zero crossing terms:                 Not applicable
FROM
  gps.{`tracking_speed_table`} AS gps,
  session AS ses
WHERE
  gps.device_info_serial = ses.device_info_serial
  AND gps.date_time BETWEEN ses.start_date AND ses.end_date
  -- Because some tracking sessions have no meaningful track_session_end_date,
  -- we'll use today's date to exclude erroneous records in the future
  AND gps.date_time <= current_date
  AND gps.date_time >= {start_date}
  AND gps.date_time < {end_date}
  AND gps.latitude IS NOT NULL
  AND gps.longitude IS NOT NULL
ORDER BY
  gps.date_time
