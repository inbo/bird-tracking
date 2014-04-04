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
