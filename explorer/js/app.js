// -------------------------
// Fetch data from cartodb
// -------------------------
function fetchTrackingData(url) {
    var result = jQuery.get(url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

function fetchBirdData() {
    query = "SELECT bird_name, device_info_serial, scientific_name from bird_tracking_devices";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

