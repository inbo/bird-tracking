function fetchTrackingData(url, limit) {
    var new_url = url + limit;
    var result = jQuery.get(new_url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

function fetchTrackingData_byDayHour(birdname, nestposition, limit) {
    var sql = vsprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('%s',4326) ) AS distance_in_meters FROM three_gulls WHERE bird_name='%s' AND outlier IS NULL) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", [nestposition, birdname]);
	 
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTrackingData_byDay(birdname, nestposition, limit) {
    var sql = vsprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('%s',4326) ) AS distance_in_meters FROM three_gulls WHERE bird_name='%s' AND outlier IS NULL) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", [nestposition, birdname]);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTravelledDist_byHour(birdname, limit) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY date_time)) AS distance_in_meters FROM three_gulls WHERE bird_name='%s' AND outlier IS NULL) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", birdname);
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + sql + limit;
    console.log(url);
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTravelledDist_byDay (birdname, limit) {
    var sql = sprintf("WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY date_time)) AS distance_in_meters FROM three_gulls WHERE bird_name='%s' AND outlier IS NULL) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp", birdname);
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

function toNvd3TotalLinedata(indata) {
    var outdata_element =  {"key": "Maximum distance", "color": "green"}; 
    var hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var data = {};
    nrOfRows = indata.rows.length;
    for (i=0;i<nrOfRows;i++) {
	var line = indata.rows[i];
	var t = new Date(parseInt(line.timestamp) * 1000);
	t.toUTCString();
	hour = t.getUTCHours();
	var d = line.distance;
	if (hour in data) {
	    data_dist = data[hour];
	    data_dist += parseFloat(d);
	} else {
	    data_dist = parseFloat(d);
	}
	data[hour] = data_dist;
    }
    values = [];
    hours = Object.keys(data);
    for (i = 0; i < hours.length; i++) {
	var outline = {"x": hours[i], "y": data[hours[i]]}; // Convert unix timestamp to nvd3 timestamp
	values.push(outline);
    }
    outdata_element["values"] = values;
    outdata = new Array();
    outdata.push(outdata_element);
    return outdata;
}
