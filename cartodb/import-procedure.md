# Procedure to import new tracking data

1. Upload data to CartoDB
2. Rename table to `bird_tracking_new_data`
3. Set 2 field types

    ```SQL
    -- SQL to set field types of device_info_serial and date_time after CSV import
    -- This statement will fail if fields have empty values, which is why we are not setting this for all fields yet.
    
    alter table bird_tracking_new_data
    alter column device_info_serial set data type integer using device_info_serial::integer,
    alter column date_time set data type timestamp with time zone using date_time::timestamp with time zone
    ```

4. Remove test records

    ```SQL
    -- SQL to remove test tracking records, when tracker was not mounted on bird
    
    delete from bird_tracking_new_data
    using bird_tracking_devices as d
    where
        bird_tracking_new_data.device_info_serial = d.device_info_serial
        and bird_tracking_new_data.date_time < d.tracking_start_date_time
    ```

5. Set other field types

    ```SQL
    alter table bird_tracking_new_data
    alter column altitude set data type integer using altitude::integer,
    alter column latitude set data type numeric using latitude::numeric,
    alter column longitude set data type numeric using longitude::numeric,
    alter column h_accuracy set data type numeric using h_accuracy::numeric,
    alter column userflag set data type boolean using userflag::boolean
    ```
    
6. Flag outliers

    ```SQL
    -- SQL to flag outliers in the tracking data
    -- * Records in the future
    -- * Records with an altitude above 10km
    -- * Records with a speed above 120km/h
    -- * Records with a horizontal accuracy above 1000m
    
    with select_fields as (
      select
        t.cartodb_id,
        d.device_info_serial,
        d.bird_name,
        d.tracking_start_date_time,
        t.date_time,
        t.altitude,
        t.the_geom,
        t.the_geom_webmercator,
        (st_distance_sphere(t.the_geom,lag(t.the_geom,1) over(order by t.device_info_serial, t.date_time))/1000)/(extract(epoch from (t.date_time - lag(t.date_time,1) over(order by t.device_info_serial, t.date_time)))/3600) as km_per_hour
      from
        bird_tracking_new_data as t
        left join bird_tracking_devices as d
        on t.device_info_serial = d.device_info_serial
    )
    
    update bird_tracking_new_data as to_flag
    set userflag = true
    from (
      select *
      from select_fields
      where
        date_time > current_date
        -- or date_time < tracking_start_date_time
        or altitude > 10000
        or km_per_hour > 120
        or h_accuracy > 1000
      ) as outliers
    where outliers.cartodb_id = to_flag.cartodb_id
    ```
    
7. Show outliers

    ```SQL
    select * 
    from bird_tracking_new_data
    where userflag is true
    ```
    
8. Import data into `bird_tracking`

    ```SQL
    -- SQL to insert new data into master bird_tracking table
    -- cartodb_id, the_geom_webmercator, created_at, updated_at are all calculated by CartoDB
    
    insert into bird_tracking (
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
    select
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
    from bird_tracking_new_data
    ```
