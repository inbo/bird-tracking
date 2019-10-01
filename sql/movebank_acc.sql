/* Created by Peter Desmet (INBO)
 *
 * This query retrieves UvA-BiTS acceleration data in the Movebank data format
 * (https://www.movebank.org/node/2381#data). It queries accelerations in
 * ee_(shared_)acceleration_limited that fall within a
 * ee_(shared_)track_session_limited for a specific ring_number.
 *
 * Upload to Movebank as:
 * Accessory data > Other accessory data collected by your tags
 *
 * The UvA-BiTS fields that could not be mapped to Movebank are:
 *
 * acc.test                                        ...
 */

SELECT
  ses.key_name AS project,--                        not a Movebank field, but included for reference
  ses.device_info_serial AS "tag-id",
  ses.ring_number AS "animal-id",
  acc.date_time AT TIME ZONE 'utc' AS "timestamp",--date format is yyyy-MM-dd'T'HH:mm:ss'Z'
  acc.x_acceleration AS "acceleration-raw-x",
  acc.y_acceleration AS "acceleration-raw-y",
  acc.z_acceleration AS "acceleration-raw-z"

FROM
  -- track session for ring_number
  (
    SELECT * FROM gps.{`track_session_table`} WHERE ring_number = {ring_number}
  ) AS ses

  -- acceleration data
  LEFT JOIN gps.{`acceleration_table`} AS acc
    ON acc.device_info_serial = ses.device_info_serial
    AND acc.date_time BETWEEN ses.start_date AND ses.end_date
    -- Because some tracking sessions have no meaningful track_session_end_date,
    -- we'll use today's date to exclude erroneous records in the future
    AND acc.date_time <= current_date
ORDER BY
  acc.date_time,
  acc.index
