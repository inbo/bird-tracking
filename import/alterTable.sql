-- SQL to set field types of columns after CSV import
-- This statement will fail if fields have empty values: need to fix that

alter table bird_tracking_wmh
alter column device_info_serial set data type integer using device_info_serial::integer,
alter column date_time set data type timestamp with time zone using date_time::timestamp with time zone,
alter column altitude set data type integer using altitude::integer,
alter column latitude set data type numeric using latitude::numeric,
alter column longitude set data type numeric using longitude::numeric,
alter column userflag set data type boolean using userflag::boolean
