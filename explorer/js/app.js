// -------------------------
// Fetch data from cartodb
// -------------------------

// general function to fetch data given a url
function fetchTrackingData(url) {
    var result = jQuery.get(url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

// function to fetch all birds in the bird_tracking_devices table
function fetchBirdData() {
    query = "SELECT bird_name, device_info_serial, sex, scientific_name from bird_tracking_devices";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

