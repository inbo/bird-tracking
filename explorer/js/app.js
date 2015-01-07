// -------------------------
// Fetch data from cartodb
// -------------------------
function fetchTrackingData(url) {
    var result = jQuery.get(url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}
