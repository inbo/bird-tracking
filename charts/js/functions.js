function fetchTrackingData(url, limit) {
    var new_url = url + limit;
    var result = jQuery.get(new_url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

function fetchTrackingData_byDayHour(device_id, colony_position, limit) {
    var sql = vsprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('%s',4326) ) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", [colony_position, device_id]);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTrackingData_byDay(device_id, colony_position, limit) {
    var sql = vsprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('%s',4326) ) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", [colony_position, device_id]);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTravelledDist_byHour(device_id, limit) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", device_id);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTravelledDist_byDay (device_id, limit) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", device_id);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function toCalHeatmap(indata) {
    var outdata = new Object();
    nrOfRows = indata.rows.length;
    for (i=0;i<nrOfRows;i++) {
    	var line = indata.rows[i];
    	var t = line.timestamp;
    	var d = line.distance;
    	outdata[t] = d;
    }
    return outdata;
}

function toNvd3Linedata(indata) {
    var outdata_element =  {"key": "Maximum distance", "color": "green"}; 
    values = [];
    nrOfRows = indata.rows.length;
    for (i=0;i<nrOfRows;i++) {
    	var line = indata.rows[i];
    	var t = line.timestamp;
    	var d = line.distance;
    	var outline = {"x": t*1000, "y": d}; // Convert unix timestamp to nvd3 timestamp
    	values.push(outline);
    }
    outdata_element["values"] = values;
    outdata = new Array();
    outdata.push(outdata_element);
    return outdata;
}

function getAllBirdInfo(limit) {
    var sql = "select bird_name, device_info_serial, sex, scientific_name, colony_longitude, colony_latitude from bird_tracking_devices order by bird_name";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

/*
function getMaxSpeed(device_id) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", device_id);
}
*/

function getMaxDistance(device_id, colony_lon, colony_lat) {
    var sql = vsprintf("WITH distance_per_day as ( SELECT ST_Distance_Sphere( ST_GeomFromText('point(' || longitude || ' ' || latitude || ')',4326), ST_GeomFromText('point(%s %s)',4326)) as distance_from_colony FROM bird_tracking WHERE device_info_serial=%s AND userflag IS FALSE) SELECT MAX(distance_from_colony) FROM distance_per_day", [colony_lon, colony_lat, device_id]);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql;
    console.log(url);
    var result = fetchTrackingData(url, "");
    return result
}
