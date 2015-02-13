# Procedure to import new tracking data

1. Upload data to CartoDB.
2. Rename table to `bird_tracking_new_data`.
3. Drop unused columns:

    ```SQL
    ALTER TABLE bird_tracking_new_data
    DROP COLUMN pressure,
    DROP COLUMN positiondop,
    DROP COLUMN location,
    DROP COLUMN vnorth,
    DROP COLUMN veast,
    DROP COLUMN vdown,
    DROP COLUMN speed,
    DROP COLUMN speed_3d,
    DROP COLUMN speed3d
    ```

3. Set `\N` to `NULL` for nullable fields:

    ```SQL
    UPDATE bird_tracking_new_data SET latitude = NULL WHERE latitude = '\N';
    UPDATE bird_tracking_new_data SET longitude = NULL WHERE longitude = '\N';
    UPDATE bird_tracking_new_data SET altitude = NULL WHERE altitude = '\N';
    UPDATE bird_tracking_new_data SET temperature = NULL WHERE temperature = '\N';
    UPDATE bird_tracking_new_data SET h_accuracy = NULL WHERE h_accuracy = '\N';
    UPDATE bird_tracking_new_data SET v_accuracy = NULL WHERE v_accuracy = '\N';
    UPDATE bird_tracking_new_data SET x_speed = NULL WHERE x_speed = '\N';
    UPDATE bird_tracking_new_data SET y_speed = NULL WHERE y_speed = '\N';
    UPDATE bird_tracking_new_data SET z_speed = NULL WHERE z_speed = '\N';
    UPDATE bird_tracking_new_data SET gps_fixtime = NULL WHERE gps_fixtime = '\N';
    UPDATE bird_tracking_new_data SET userflag = NULL WHERE userflag = '\N';
    UPDATE bird_tracking_new_data SET satellites_used = NULL WHERE satellites_used = '\N';
    UPDATE bird_tracking_new_data SET speed_accuracy = NULL WHERE speed_accuracy = '\N';
    UPDATE bird_tracking_new_data SET direction = NULL WHERE direction = '\N';
    ```

4. Set data types (this should drastically reduce the storage space of the table):

    ```SQL
    ALTER TABLE bird_tracking_new_data
    ALTER COLUMN device_info_serial SET data type integer USING device_info_serial::integer,
    ALTER COLUMN date_time SET data type timestamp with time zone USING date_time::timestamp with time zone,
    ALTER COLUMN latitude SET data type double precision USING latitude::double precision,
    ALTER COLUMN longitude SET data type double precision USING longitude::double precision,
    ALTER COLUMN altitude SET data type integer USING altitude::integer,
    ALTER COLUMN temperature SET data type double precision USING temperature::double precision,
    ALTER COLUMN h_accuracy SET data type double precision USING h_accuracy::double precision,
    ALTER COLUMN v_accuracy SET data type double precision USING v_accuracy::double precision,
    ALTER COLUMN x_speed SET data type double precision USING x_speed::double precision,
    ALTER COLUMN y_speed SET data type double precision USING y_speed::double precision,
    ALTER COLUMN z_speed SET data type double precision USING z_speed::double precision,
    ALTER COLUMN gps_fixtime SET data type double precision USING gps_fixtime::double precision,
    ALTER COLUMN userflag SET data type boolean USING userflag::boolean,
    ALTER COLUMN satellites_used SET data type integer USING satellites_used::integer,
    ALTER COLUMN speed_accuracy SET data type double precision USING speed_accuracy::double precision,
    ALTER COLUMN direction SET data type double precision USING direction::double precision
    ```

5. Check for new devices

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

6. Manually add any new devices and their metadata to the table `bird_tracking_devices`

7. Optionally, check tracking days (using [this query](maintenance/selectTrackingPeriods.sql)).

8. Optionally, check number of test records (using [this query](maintenance/selectTestRecords.sql)).

9. Remove test records

    ```SQL
    -- SQL to remove test tracking records, when tracker was not mounted on bird
    
    DELETE FROM bird_tracking_new_data
    USING bird_tracking_devices AS d
    WHERE
        bird_tracking_new_data.device_info_serial = d.device_info_serial
        AND bird_tracking_new_data.date_time < d.tracking_started_at
    ```
    
10. Flag outliers

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
            d.tracking_started_at,
            t.date_time,
            t.altitude,
            t.h_accuracy as height_accuracy,
            t.the_geom,
            t.the_geom_webmercator,
            (st_distance_sphere(t.the_geom,lag(t.the_geom,1) over(ORDER BY t.device_info_serial, t.date_time))/1000)/(extract(epoch FROM (t.date_time - lag(t.date_time,1) over(ORDER BY t.device_info_serial, t.date_time)))/3600) AS km_per_hour
        FROM bird_tracking_new_data AS t
            LEFT JOIN bird_tracking_devices AS d
            ON t.device_info_serial = d.device_info_serial
    )
    
    UPDATE bird_tracking_new_data
    SET userflag = TRUE
    FROM (
        SELECT cartodb_id
        FROM select_fields
        WHERE
            date_time > current_date
            OR altitude > 10000
            OR km_per_hour > 120
            OR height_accuracy > 1000
          ) AS outliers
    WHERE outliers.cartodb_id = bird_tracking_new_data.cartodb_id
    ```
    
11. Show outliers

    ```SQL
    SELECT * 
    FROM bird_tracking_new_data
    WHERE userflag IS TRUE
    ```
    
12. Verify if `bird_tracking` is missing fields, add those, and update the query in the step below.

13. Import data into `bird_tracking`

    ```SQL
    -- SQL to insert new data into master bird_tracking table
    -- cartodb_id, the_geom_webmercator, created_at, updated_at are all calculated by CartoDB
    
    INSERT INTO bird_tracking (
        the_geom,
        altitude,
        date_time,
        device_info_serial,
        direction,
        gps_fixtime,
        h_accuracy,
        latitude,
        longitude,
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
        direction,
        gps_fixtime,
        h_accuracy,
        latitude,
        longitude,
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
