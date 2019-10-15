/*
Created by Peter Desmet (INBO)

This query retrieves UvA-BiTS acceleration data in the Movebank data format
(https://www.movebank.org/node/2381#data). It queries accelerations in
ee_(shared_)acceleration_limited that fall within a
ee_(shared_)track_session_limited for a specific ring_number.

Upload resulting data to Movebank as:
Accessory data > Other accessory data collected by your tags

The UvA-BiTS fields that could not be mapped to Movebank are:

acc.index                               Not necessary: is converted to milliseconds in timestamp

Note that the table ee_(shared)_acc_start_limited is not used either: it contains timestamps for
acceleration measurements that do not have an associated GPS fix:

acc_start.device_info_serial            Not necessary, same as acc.device_info_serial
acc_start.date_time                     Not necessary, same as acc.date_time
acc_start.line_counter                  Not necessary
acc_start.timesynced                    Not necessary
acc_start.accii                         Not necessary
acc_start.accsn                         Not necessary
acc_start.f                             Not necessary

*/

-- Get track session and tracker information for ring_number
-- Tracker information is needed to get acceleration offset and sensitivity
WITH session AS (
  SELECT
    ses.ring_number,
    ses.device_info_serial,
    ses.key_name,
    ses.start_date,
    ses.end_date,
    tag.x_o,
    tag.x_s,
    tag.y_o,
    tag.y_s,
    tag.z_o,
    tag.z_s
  FROM gps.{`track_session_table`} AS ses
    LEFT JOIN gps.{`tracker_table`} AS tag
    ON ses.device_info_serial = tag.device_info_serial
  WHERE ring_number = {ring_number}
)

SELECT
-- ACCELERATION DATA
-- tag-id:                              Set to device_info_serial, see movebank_ref data
  ses.device_info_serial AS "tag-id",
-- animal-id:                           Set to ring_number, see movebank_ref data
  ses.ring_number AS "animal-id",

-- acceleration-axes:                   Not necessary, would be "XYZ", but it is clear from the data
-- acceleration-raw-x:                  Set to acceleration measured on the x (or surge) axis,
--                                      range between -2666 and 2666
  acc.x_acceleration AS "acceleration-raw-x",
-- acceleration-raw-y:                  Set to acceleration measured on the y (or sway) axis,
--                                      range between -2666 and 2666
  acc.y_acceleration AS "acceleration-raw-y",
-- acceleration-raw-z:                  Set to acceleration measured on the z (or heave) axis,
--                                      range between -2666 and 2666
  acc.z_acceleration AS "acceleration-raw-z",
-- acceleration-sampling-frequency-per-axis: Not necessary, is apparent from timestamp (20Hz)
-- acceleration-x:                      Not necessary, can be derived from tilt-x (g forces) * 9.81
-- acceleration-y:                      Not necessary, can be derived from tilt-y (g forces) * 9.81
-- acceleration-z:                      Not necessary, can be derived from tilt-z (g forces) * 9.81
-- accelerations-raw:                   Not necessary, is reserved to store complete bursts, while
--                                      we have one row per measurement
-- location-lat:                        Not necessary, can be derived by joining with gps data on
--                                      start-timestamp (will not have match for all)
-- location-long:                       Not necessary, can be derived by joining with gps data on
--                                      start-timestamp (will not have match for all)
-- sampling-frequency:                  Not necessary, is apparent from timestamp (20Hz)
-- start-timestamp:                     Set to date_time, which indicates the start of a burst
  to_char(acc.date_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "start-timestamp",
-- tilt-angle:                          Not available in DB
-- tilt-x:                              Set to measured acceleration minus offset (x_o) divided by
--                                      sensitivity (x_s), resulting in value in g forces.
--                                      O and S are recorded for each tag. See
--                                      https://wiki.pubserv.e-ecology.nl/wiki/index.php/DB_Views_2015#Accelerometer_calibration
  (acc.x_acceleration - ses.x_o) / ses.x_s AS "tilt-x",
-- tilt-y:                              Set to measured acceleration minus offset (y_o) divided by
--                                      sensitivity (y_s), resulting in value in g forces.
  (acc.y_acceleration - ses.y_o) / ses.y_s AS "tilt-y",
-- tilt-z:                              Set to measured acceleration minus offset (z_o) divided by
--                                      sensitivity (z_s), resulting in value in g forces.
  (acc.z_acceleration - ses.z_o) / ses.z_s AS "tilt-z",
-- timestamp:                           Set to date_time + number of milliseconds since the start of
--                                      a burst, i.e. date_time + 0.05 (a frequency of 20Hz) *
--                                      index (sorting order) => 2018-07-18T10:45:39.000Z,
--                                      2018-07-18T10:45:39.050Z, etc. Since index starts at 1,
--                                      we have to substract by 1 to start at 000 milliseconds.
--                                      Note that the actual frequency is only recorded in
--                                      ee_(shared_)acc_start_limited, i.e. for acceleration
--                                      measurements without associated gps fixes. It seems to be
--                                      always 20Hz, so we use that as a constant here.
--                                      Format: yyyy-MM-dd'T'HH:mm:ss.sss'Z'
  to_char(acc.date_time + interval '00:00:00.05' * (index - 1), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "timestamp"

FROM
  gps.{`acceleration_table`} AS acc,
  session AS ses
WHERE
  acc.device_info_serial = ses.device_info_serial
  AND acc.date_time BETWEEN ses.start_date AND ses.end_date
  -- Because some tracking sessions have no meaningful track_session_end_date,
  -- we'll use today's date to exclude erroneous records in the future
  AND acc.date_time <= current_date
ORDER BY
  "timestamp"
