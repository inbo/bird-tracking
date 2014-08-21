# Procedure to import new tracking data

1. Upload data to CartoDB
2. Rename table to `bird_tracking_new_data`
3. Set 2 field types

    ```SQL
    -- SQL to set field types of device_info_serial and date_time after CSV import
    -- This statement will fail if fields have empty values, which is why we are not setting this for all fields yet.
    
    ALTER TABLE bird_tracking_new_data
    ALTER COLUMN device_info_serial SET data type integer USING device_info_serial::integer,
    ALTER COLUMN date_time SET data type timestamp with time zone USING date_time::timestamp with time zone
    ```
4. Check for new devices

    ```SQL
    -- SQL to find device_info_serial that are not found in bird_tracking_devices
    
    SELECT t.device_info_serial
    FROM bird_tracking_new_data t
        LEFT JOIN bird_tracking_devices d
        ON t.device_info_serial = d.device_info_serial
    WHERE d.device_info_serial IS NULL
    GROUP BY t.device_info_serial
    ORDER BY t.device_info_serial
    ```

5. Manually add any new devices and their metadata to the table `bird_tracking_devices`

6. Remove test records

    ```SQL
    -- SQL to remove test tracking records, when tracker was not mounted on bird
    
    DELETE FROM bird_tracking_new_data
    USING bird_tracking_devices AS d
    WHERE
        bird_tracking_new_data.device_info_serial = d.device_info_serial
        AND bird_tracking_new_data.date_time < d.tracking_start_date_time
    ```

7. Set other field types

    ```SQL
    ALTER TABLE bird_tracking_new_data
    ALTER COLUMN altitude SET data type integer USING altitude::integer,
    ALTER COLUMN latitude SET data type numeric USING latitude::numeric,
    ALTER COLUMN longitude SET data type numeric USING longitude::numeric,
    ALTER COLUMN h_accuracy SET data type numeric USING h_accuracy::numeric,
    ALTER COLUMN userflag SET data type boolean USING userflag::boolean
    ```
    
8. Flag outliers

    ```SQL
    -- SQL to flag outliers in the tracking data
    -- * Records in the future
    -- * Records with an altitude above 10km
    -- * Records with a speed above 120km/h
    -- * Records with a horizontal accuracy above 1000m
    
    WITH select_fields AS (
        SELECT
            t.cartodb_id,
            d.device_info_serial,
            d.bird_name,
            d.tracking_start_date_time,
            t.date_time,
            t.altitude,
            t.the_geom,
            t.the_geom_webmercator,
            (st_distance_sphere(t.the_geom,lag(t.the_geom,1) over(ORDER BY t.device_info_serial, t.date_time))/1000)/(extract(epoch FROM (t.date_time - lag(t.date_time,1) over(ORDER BY t.device_info_serial, t.date_time)))/3600) AS km_per_hour
        FROM bird_tracking_new_data AS t
            LEFT JOIN bird_tracking_devices AS d
            ON t.device_info_serial = d.device_info_serial
    )
    
    UPDATE bird_tracking_new_data AS to_flag
    SET userflag = TRUE
    FROM (
        SELECT *
        FROM select_fields
        WHERE
            date_time > current_date
            -- OR date_time < tracking_start_date_time
            OR altitude > 10000
            OR km_per_hour > 120
            OR h_accuracy > 1000
          ) AS outliers
    WHERE outliers.cartodb_id = to_flag.cartodb_id
    ```
    
9. Show outliers

    ```SQL
    SELECT * 
    FROM bird_tracking_new_data
    WHERE userflag IS TRUE
    ```
    
10. Import data into `bird_tracking`

    ```SQL
    -- SQL to insert new data into master bird_tracking table
    -- cartodb_id, the_geom_webmercator, created_at, updated_at are all calculated by CartoDB
    
    INSERT INTO bird_tracking (
        the_geom,
        altitude,
        date_time,
        device_info_serial,
        gps_fixtime,
        h_accuracy,
        latitude,
        location,
        longitude,
        positiondop,
        pressure,
        satellites_used,
        speed_accuracy,
        temperature,
        userflag,
        v_accuracy,
        x_speed,
        y_speed,
        z_speed
    )
    SELECT
        the_geom,
        altitude,
        date_time,
        device_info_serial,
        gps_fixtime,
        h_accuracy,
        latitude,
        location,
        longitude,
        positiondop,
        pressure,
        satellites_used,
        speed_accuracy,
        temperature,
        userflag,
        v_accuracy,
        x_speed,
        y_speed,
        z_speed
    FROM bird_tracking_new_data
    ```
