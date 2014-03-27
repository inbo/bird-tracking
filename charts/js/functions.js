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
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", device_id);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    console.log(url);
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTravelledDist_byDay (device_id, limit) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='%s' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", device_id);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    console.log(url);
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
    console.log("result: ", result);
    return result;
    /*
    var data = [
	{
	    "device_id": 1066,
	    "data": {"name": "Eric", "species": "gull", "sex": "male", "colony_lat": 3.2939, "colony_lon": 52.492}
	},
	{
	    "device_id": 4929,
	    "data": {"name": "Anne", "species": "big gull", "sex": "male", "colony_lat": 3.2914, "colony_lon": 51.392}
	},
	{
	    "device_id": 8392,
	    "data": {"name": "Jurgen", "species": "big gull", "sex": "male", "colony_lat": 2.9287, "colony_lon": 52.0392}
	}

    ];
    return data;
    */
}
