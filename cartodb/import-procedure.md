# Procedure to import new tracking data

1. Upload data to CartoDB (`lifewatch` account)
2. Rename table to `bird_tracking_new_data`.
3. Drop unused columns:

    ```SQL
    ALTER TABLE lifewatch.bird_tracking_new_data
    DROP COLUMN altitude_agl,
    DROP COLUMN location,
    DROP COLUMN positiondop,
    DROP COLUMN pressure,
    DROP COLUMN speed_2d,
    DROP COLUMN speed_3d
    ```

4. Set `\N` to `NULL` for string fields. Fields that were interpreted automatically by CartoDB to number, date, etc. (i.e. there were no `\N` values blocking the interpretation to another data type) should be removed from this query:

    ```SQL
    UPDATE lifewatch.bird_tracking_new_data SET latitude = NULL WHERE latitude = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET longitude = NULL WHERE longitude = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET altitude = NULL WHERE altitude = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET temperature = NULL WHERE temperature = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET h_accuracy = NULL WHERE h_accuracy = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET v_accuracy = NULL WHERE v_accuracy = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET x_speed = NULL WHERE x_speed = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET y_speed = NULL WHERE y_speed = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET z_speed = NULL WHERE z_speed = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET gps_fixtime = NULL WHERE gps_fixtime = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET userflag = NULL WHERE userflag = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET satellites_used = NULL WHERE satellites_used = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET speed_accuracy = NULL WHERE speed_accuracy = '\N';
    UPDATE lifewatch.bird_tracking_new_data SET direction = NULL WHERE direction = '\N';
    ```

5. Set data types (this should drastically reduce the storage space of the table):

    ```SQL
    ALTER TABLE lifewatch.bird_tracking_new_data
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

6. Check for new devices:

    ```SQL
    -- SQL to find device_info_serial that are not found in bird_tracking_devices
    
    SELECT t.device_info_serial
    FROM lifewatch.bird_tracking_new_data t
        LEFT JOIN lifewatch.bird_tracking_devices d
        ON t.device_info_serial = d.device_info_serial
    WHERE d.device_info_serial IS NULL
    GROUP BY t.device_info_serial
    ORDER BY t.device_info_serial
    ```

7. Manually add any new devices and their metadata to the table `bird_tracking_devices` and check above query again.

8. Check for records that were not georeferenced by CartoDB and add coordinates manually:

    ```SQL
    SELECT *
    FROM lifewatch.bird_tracking_new_data
    WHERE the_geom IS NULL
    ```

9. Optionally, check tracking days to discover birds with relatively low number of tracking days (could indicate bird is dead):

    ```SQL
    SELECT
      d.bird_name,
      d.scientific_name,
      d.colour_ring_code,
      min(t.date_time) AS start_date,
      max(t.date_time) AS end_date,
      max(t.date_time)::date - min(t.date_time)::date as days,
      d.remarks
    FROM lifewatch.bird_tracking_new_data t
      LEFT JOIN lifewatch.bird_tracking_devices d
      ON t.device_info_serial = d.device_info_serial
    WHERE t.userflag is false
    GROUP BY 
      d.bird_name,
      d.scientific_name,
      d.colour_ring_code,
      d.remarks
    ORDER BY days DESC
    ```

10. Optionally, check number of test records, i.e. records recorded when tracker was not mounted on bird or very shortly after release of bird. Those records have a `date_time` earlier than the `tracking_started_at`:

    ```SQL
    SELECT
      count(*)
    FROM
      lifewatch.bird_tracking_new_data as t
      LEFT JOIN lifewatch.bird_tracking_devices as d
      ON t.device_info_serial = d.device_info_serial
    WHERE
      t.date_time < d.tracking_started_at
      ```

11. Remove test records:

    ```SQL
    DELETE FROM lifewatch.bird_tracking_new_data
    USING lifewatch.bird_tracking_devices AS d
    WHERE
        lifewatch.bird_tracking_new_data.device_info_serial = d.device_info_serial
        AND lifewatch.bird_tracking_new_data.date_time < d.tracking_started_at
    ```
    
12. Flag outliers:

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
        FROM lifewatch.bird_tracking_new_data AS t
            LEFT JOIN lifewatch.bird_tracking_devices AS d
            ON t.device_info_serial = d.device_info_serial
    )
    
    UPDATE lifewatch.bird_tracking_new_data
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
    WHERE outliers.cartodb_id = lifewatch.bird_tracking_new_data.cartodb_id
    ```
    
13. Show outliers:

    ```SQL
    SELECT * 
    FROM lifewatch.bird_tracking_new_data
    WHERE userflag IS TRUE
    ```
    
14. Compare new data with current data, to discover potentially missing records in the new data:

    ```SQL
    WITH per_device AS (
        SELECT
            join_with_current.device_info_serial AS device_info_serial,
            join_with_current.species_code,
            join_with_current.current_records,
            count(new.*) AS new_records
        FROM
            (
                SELECT
                    metadata.device_info_serial,
                    metadata.species_code,
                    count(current.*) AS current_records
                FROM
                    lifewatch.bird_tracking_devices AS metadata
                    LEFT JOIN lifewatch.bird_tracking AS current
                    ON metadata.device_info_serial = current.device_info_serial
                GROUP BY
                    metadata.device_info_serial,
                    metadata.species_code
            ) AS join_with_current
            LEFT JOIN lifewatch.bird_tracking_new_data AS new
            ON join_with_current.device_info_serial = new.device_info_serial
        GROUP BY
            join_with_current.device_info_serial,
            join_with_current.species_code,
            join_with_current.current_records
    )

    SELECT
        device_info_serial,
        species_code,
        current_records,
        new_records,
        new_records - current_records AS difference,
        CASE
            WHEN new_records - current_records < 0 THEN 'missing records'
            ELSE ''
        END AS warning
    FROM
        per_device
    ORDER BY
        species_code DESC,
        device_info_serial
    ```

15. If no unexpected records are missing, drop all records from `bird_tracking` for a certain `species_code` (update the query below for the relevant `species_code`). **Make sure there is sufficient space for step 17**. Since we do not have stable identifiers for records, we cannot compare between the old and new records and do an incremental update. 

    ```SQL
    DELETE FROM lifewatch.bird_tracking
    USING lifewatch.bird_tracking_devices AS d
    WHERE
        lifewatch.bird_tracking.device_info_serial = d.device_info_serial
        AND (d.species_code = 'hg' OR d.species_code = 'lbbg')
    ```

16. Verify if `bird_tracking` is missing fields, add those, and update the query in the step below.

17. Import new data into `bird_tracking`:

    ```SQL
    -- SQL to insert new data into master bird_tracking table
    -- cartodb_id, the_geom_webmercator, created_at, updated_at are all calculated by CartoDB
    
    INSERT INTO lifewatch.bird_tracking (
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
    FROM lifewatch.bird_tracking_new_data
    ```
18. Remove `bird_tracking_new_data`.
