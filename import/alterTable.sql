-- SQL to set field types of columns after CSV import
-- This statement will fail if fields have empty values: need to fix that

alter table bird_tracking_wmh_copy
alter column device_info_serial set data type integer using device_info_serial::integer,
alter column date_time set data type timestamp with time zone using date_time::timestamp with time zone
