function fetchTrackingData(limit) {
    url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=SELECT%20cartodb_id,%20date_time,%20day_of_year,%20ST_Distance_Sphere(the_geom,%20ST_GeomFromText('POINT(3.182863%2051.3407476)',%204326))%20as%20distance_from_nest_in_meters%20FROM%20tracking_eric%20ORDER%20BY%20date_time " + limit;
    var result = jQuery.get(url, function(data) {
        jQuery('.result').html(data);
        console.log('load was performed. Data: ' + JSON.stringify(data));
    });
    return result;
}
