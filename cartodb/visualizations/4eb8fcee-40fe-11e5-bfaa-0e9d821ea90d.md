## Migration in time

<https://inbo.cartodb.com/u/lifewatch/viz/4eb8fcee-40fe-11e5-bfaa-0e9d821ea90d/public_map>

## SQL

```SQL
SELECT
    t.*,
  d.bird_name
FROM lifewatch.bird_tracking t
  LEFT JOIN lifewatch.bird_tracking_devices d
  ON t.device_info_serial = d.device_info_serial
WHERE
    t.userflag IS FALSE AND
    d.species_code = 'lbbg' AND
    d.bird_name IN (
        'Eric',
        'Nico',
        'Sanne'
    ) AND
    t.date_time > '2013-08-15' AND
    t.date_time < '2014-01-01'
```

## CartoCSS

```CSS
/** torque_cat visualization */

Map {
-torque-frame-count:256;
-torque-animation-duration:30;
-torque-time-attribute:"date_time";
-torque-aggregation-function:"CDB_Math_Mode(torque_category)";
-torque-resolution:1;
-torque-data-aggregation:linear;
}

#bird_tracking{
  comp-op: source-over;
  marker-fill-opacity: 0.9;
  marker-line-color: #FFF;
  marker-line-width: 0;
  marker-line-opacity: 1;
  marker-type: ellipse;
  marker-width: 3;
  marker-fill: #FF6600;
}
#bird_tracking[frame-offset=1] {
 marker-width:5;
 marker-fill-opacity:0.45; 
}
#bird_tracking[frame-offset=2] {
 marker-width:7;
 marker-fill-opacity:0.225; 
}
#bird_tracking[value=1] {
   marker-fill: #B81609;
}
#bird_tracking[value=2] {
   marker-fill: #FF9900;
}
#bird_tracking[value=3] {
   marker-fill: #A53ED5;
}
```
