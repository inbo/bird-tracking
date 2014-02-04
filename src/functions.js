function fetchTrackingData(url, limit) {
    var new_url = url + limit;
    var result = jQuery.get(new_url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

function fetchTrackingData_byDayHour(birdname, nestposition, limit) {
    /*var birdname = "Anne";
    var nestposition = "point(2.930353%2051.233452)";*/
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=SELECT%20extract(epoch%20from%20date_trunc(%27hour%27,date_time))%20as%20timestamp,%20round(cast(max(%20ST_Distance_Sphere(the_geom,ST_GeomFromText(%27" + nestposition + "%27,4326)%20)/1000)%20as%20numeric),%203)%20as%20max_distance_from_nest%20FROM%20three_gulls%20WHERE%20bird_name=%27" + birdname + "%27%20AND%20outlier%20IS%20NULL%20GROUP%20BY%20timestamp%20ORDER%20BY%20timestamp%20" + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function fetchTrackingData_byDay(birdname, nestposition, limit) {
    /*var birdname = "Eric";
    var nestposition = "point(3.182875%2051.340768)";
    var birdname = "Anne";
    var nestposition = "point(2.930353%2051.233452)";*/
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=SELECT%20extract(epoch%20from%20date_trunc(%27day%27,date_time))%20as%20timestamp,%20round(cast(max(%20ST_Distance_Sphere(the_geom,ST_GeomFromText(%27" + nestposition + "%27,4326)%20)/1000)%20as%20numeric),%203)%20as%20max_distance_from_nest%20FROM%20three_gulls%20WHERE%20bird_name=%27" + birdname + "%27%20AND%20outlier%20IS%20NULL%20GROUP%20BY%20timestamp%20ORDER%20BY%20timestamp%20" + limit;
    var result = fetchTrackingData(url, "");
    return result;
}

function toCalHeatmap(indata) {
    var outdata = new Object();
    nrOfRows = indata.rows.length;
    for (i=0;i<nrOfRows;i++) {
	var line = indata.rows[i];
	var t = line.timestamp;
	var d = line.max_distance_from_nest;
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
	var d = line.max_distance_from_nest;
	var outline = {"x": t*1000, "y": d}; // Convert unix timestamp to nvd3 timestamp
	values.push(outline);
    }
    outdata_element["values"] = values;
    outdata = new Array();
    outdata.push(outdata_element);
    return outdata;
}
