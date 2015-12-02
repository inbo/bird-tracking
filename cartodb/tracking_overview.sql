WITH individuals AS (
	SELECT
  		d.device_info_serial,
  		d.species_code,
		CASE
        	WHEN catch_location LIKE '%Zeebrugge%' THEN 'Zeebrugge'
        	WHEN catch_location LIKE '%Oostende%' THEN 'Oostende'
        	WHEN catch_location LIKE '%Vlissingen%' THEN 'Vlissingen'
        	ELSE 'Other location'
    	END AS location,
  		date_part('year', d.tracking_started_at) AS start_year,
		COALESCE(date_part('day', max(t.date_time) - min(t.date_time)),0) AS days
	FROM
		lifewatch.bird_tracking_devices d
		LEFT OUTER JOIN lifewatch.bird_tracking t
		ON d.device_info_serial = t.device_info_serial AND t.userflag IS FALSE
  	WHERE
  		d.species_code IN ('hg','lbbg')
	GROUP BY
		d.device_info_serial,
  		d.species_code,
  		location,
  		start_year
	ORDER BY
  		start_year,
  		d.device_info_serial
)

SELECT
	*
FROM
	individuals
ORDER BY
	location,
	start_year
