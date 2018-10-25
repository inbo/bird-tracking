SELECT
  s.key_name,
  -- "acceleration-axes"
  -- "acceleration-raw-x"
  -- "acceleration-raw-y"
  -- "acceleration-raw-z"
  -- "acceleration-x"
  -- "acceleration-y"
  -- "acceleration-z"
  -- "acceleration-sampling-frequency-per-axis"
  -- "accelerations-raw"
  -- "activity-count"
  -- "algorithm-marked-outlier"
  -- "barometric-height"
  -- "barometric-pressure"
  -- "battery-charge-percent"
  -- "battery-charging-current"
  -- "behavioural-classification"
  -- "compass-heading"
  -- "conductivity"
  -- "end-timestamp"
  -- "event-comments"
  -- "event-id"
  -- "geolocator-fix-type"
  -- "gps-fix-type"
  -- "gps-dop"
  -- "gps-hdop"
  -- "gps-maximum-signal-strength"
  -- "gps-satellite-count"
  -- "gps-time-to-fix"
  -- "gps-vdop"
  -- "gsm-mcc-mnc"
  -- "gsm-signal-strength"
  -- "ground-speed"
  -- "habitat"
  -- "heading"
  -- "height-above-ellipsoid"
  -- "height-above-mean-sea-level"
  -- "height-raw"
  -- "latitude"
  -- "latitude-utm"
  -- "light-level"
  -- "local-timestamp"
  -- "location-error-numerical"
  -- "location-error-text"
  -- "location-error-percentile"
  -- "longitude"
  -- "longitude-utm"
  -- "magnetic-field-raw-x"
  -- "magnetic-field-raw-y"
  -- "magnetic-field-raw-z"
  -- "manually-marked-outlier"
  -- "manually-marked-valid"
  -- "migration-stage-custom"
  -- "migration-stage-standard"
  -- "modelled"
  -- "proofed"
  -- "raptor-workshop-behavior"
  -- "raptor-workshop-deployment-special-event"
  -- "raptor-workshop-migration-state"
  -- "sampling-frequency"
  -- "start-timestamp"
  -- "study-specific-measurement"
  -- "study-time-zone"
  -- "tag-technical-specification"
  -- "tag-voltage"
  -- "temperature-external"
  -- "temperature-max"
  -- "temperature-min"
  -- "tilt-angle"
  -- "tilt-x"
  -- "tilt-y"
  -- "tilt-z"
  t.date_time AS "timestamp"
  -- "transmission-timestamp"
  -- "underwater-count"
  -- "underwater-time"
  -- "utm-zone"
  -- "vertical-error-numerical"
  -- "visible"
  -- "waterbird-workshop-behavior"
  -- "waterbird-workshop-deployment-special-event"
  -- "waterbird-workshop-migration-state"
FROM
  gps.get_uvagps_track_speed_incl_shared({device_info_serial}, false) calc
  -- false = exclude records with userflag = 1
  INNER JOIN
    (
      SELECT * FROM gps.ee_tracking_speed_limited WHERE device_info_serial = {device_info_serial}
      UNION
      SELECT * FROM gps.ee_shared_tracking_speed_limited WHERE device_info_serial = {device_info_serial}
    ) t
    ON
      calc.device_info_serial = t.device_info_serial
      AND calc.date_time = t.date_time
  INNER JOIN
    (
      SELECT * FROM gps.ee_track_session_limited WHERE device_info_serial = {device_info_serial}
      UNION
      SELECT * FROM gps.ee_shared_track_session_limited WHERE device_info_serial = {device_info_serial}
    ) s
    ON
      t.device_info_serial = s.device_info_serial
      AND t.date_time >= s.start_date
      AND t.date_time <= s.end_date
  LEFT JOIN gps.ee_individual_limited i
    ON s.ring_number = i.ring_number
  LEFT JOIN gps.ee_species_limited sp
    ON i.species_latin_name = sp.latin_name
WHERE
  -- Because some tracking sessions have no meaningfull track_session_end_date,
  -- we'll use today's date to exclude erronous records in the future
  t.date_time <= current_date
ORDER BY
  t.date_time
