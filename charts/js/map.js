/* ---------------
 * Create map with baselayer
 * ---------------
 */
function drawMap() {
    window.map;
    var mapStyle = [
	{ "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 17 } ] },
	{ "featureType": "landscape", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 20 } ] },
	{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" }, { "lightness": 17 } ] },
	{ "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 29 }, { "weight": 0.2 } ] },
	{ "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 18 } ] },
	{ "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 16 } ] },
	{ "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 21 } ] },
	{ "elementType": "labels.text.stroke", "stylers": [ { "visibility": "on" }, { "color": "#000000" }, { "lightness": 16 } ] },
	{ "elementType": "labels.text.fill", "stylers": [ { "saturation": 36 }, { "color": "#000000" }, { "lightness": 40 } ] },
	{ "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },
	{ "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 19 } ] },
	{ "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" }, { "lightness": 20 } ] },
	{ "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 17 }, { "weight": 1.2 } ] }
    ];
    var mapOptions = {
	zoom: 9,
	center: new google.maps.LatLng(51.2, 3),
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	styles: mapStyle
    };

    window.map = new google.maps.Map(document.getElementById('map'),  mapOptions);
};


/* ---------------
 * Add layer with birds data
 * ---------------
 */
function setBirdsLayer(map, device_id, start_time, stop_time) {
    var sql;
    if (start_time != "" && stop_time != "") {
	var start_month = start_time.getMonth() + 1;
	var stop_month = stop_time.getMonth() + 1;
	var start_date = '' + start_time.getFullYear() + '/' + start_month + '/' + start_time.getDate();
	var stop_date = '' + stop_time.getFullYear() + '/' + stop_month + '/' + stop_time.getDate();
	sql = vsprintf("select * from bird_tracking where userflag is false and date_time > '%s' and date_time < '%s' and device_info_serial='%s'", [start_date, stop_date, device_id]);
    } else {
	sql = sprintf("select * from bird_tracking where userflag is false and date_time < '2014-01-01' and device_info_serial='%s'", device_id);
    };

    cartodb.createLayer(map, {
	user_name: 'lifewatch-inbo',
	type: 'cartodb',
	sublayers: [{
	    sql: sql,
	    cartocss: "#bird_tracking{ marker-fill: #ffcc00; marker-width: 2.5; marker-line-color: #FFF; marker-line-width: 0; marker-line-opacity: 0.5; marker-opacity: 0.9; marker-comp-op: multiply; marker-type: ellipse; marker-placement: point; marker-allow-overlap: true; marker-clip: false; marker-multi-policy: largest; }"
	}]
    })
    .addTo(map)
    .done(function(layer) {
    });
};


// Add the base map to the page
window.onload = drawMap;
