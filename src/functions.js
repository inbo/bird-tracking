function fetchTrackingData(url, limit) {
    var new_url = url + limit;
    var result = jQuery.get(new_url, function(data) {
        jQuery('.result').html(data);
        console.log('load was performed. Data: ' + JSON.stringify(data));
    });
    return result;
}

function fetchTrackingData_byDayHour(limit) {
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=SELECT%20extract(epoch%20from%20date_trunc(%27hour%27,date_time))%20as%20timestamp,%20round(cast(max(%20ST_Distance_Sphere(the_geom,ST_GeomFromText(%27point(3.182875%2051.340768)%27,4326)%20)/1000)%20as%20numeric),%203)%20as%20max_distance_from_nest%20FROM%20tracking_eric%20GROUP%20BY%20timestamp%20ORDER%20BY%20timestamp" + limit;
    var result = fetchTrackingData(url, "");
    return result;

}
function toNvd3Heatmap(indata) {
    var outdata = new Object();
    nrOfRows = indata.rows.length;
    for (i=0;i<nrOfRows;i++) {
	line = indata.rows[i];
	outdata[line.timestamp] = line.distance_from_nest_in_meters;
    }
    return outdata;
}
