SELECT
    t.device_info_serial,
    t.date_time,
    t.latitude,
    t.longitude,
    t.altitude,
    t.speed_2d
FROM
    gps.get_uvagps_track_speed(864) calc
    INNER JOIN gps.ee_tracking_speed_limited t
    ON
        calc.device_info_serial = t.device_info_serial
        AND calc.date_time = t.date_time
    INNER JOIN gps.ee_track_session_limited s
    ON
        t.device_info_serial = s.device_info_serial
        AND t.date_time >= s.start_date
        AND t.date_time <= s.end_date
    INNER JOIN gps.ee_individual_limited i
    ON
        s.ring_number = i.ring_number
WHERE
    calc.speed <= 30
