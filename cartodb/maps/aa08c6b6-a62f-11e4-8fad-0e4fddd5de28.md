## Tracking Eric - Duration per UTM

<https://inbo.cartodb.com/u/lifewatch/viz/aa08c6b6-a62f-11e4-8fad-0e4fddd5de28/public_map>

## SQL

```SQL
SELECT
row_number() OVER (ORDER BY utm.the_geom_webmercator) AS cartodb_id,
utm.the_geom_webmercator, sum(duration_in_seconds) as duration_in_seconds
    FROM lifewatch.utm_1km AS utm, lifewatch.tracking_eric AS eric
    WHERE ST_Intersects(utm.the_geom_webmercator, eric.the_geom_webmercator) 
    GROUP BY utm.the_geom_webmercator
```

## CartoCSS

```CSS
/** choropleth visualization */

#utm_1km{
  line-color: #ffffff;
  line-opacity: 1;
  line-width: 1;
  polygon-opacity: 0.8;
}
#utm_1km [ duration_in_seconds <= 10000000] {
   polygon-fill: #B10026;
}
#utm_1km [ duration_in_seconds <= 1000000] {
   polygon-fill: #E31A1C;
}
#utm_1km [ duration_in_seconds <= 100000] {
   polygon-fill: #FC4E2A;
}
#utm_1km [ duration_in_seconds <= 10000] {
   polygon-fill: #FD8D3C;
}
#utm_1km [ duration_in_seconds <= 1000] {
   polygon-fill: #FEB24C;
}
#utm_1km [ duration_in_seconds <= 100] {
   polygon-fill: #FED976;
}
#utm_1km [ duration_in_seconds <= 10] {
   polygon-fill: #FFFFB2;
}
```
