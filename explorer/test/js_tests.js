// -------------------------------------
// Test calls to cartodb backend
// -------------------------------------

asyncTest("fetch 10 occurrences for device 703", 1, function() {
    var device = "703";
    var query = "SELECT date_time FROM bird_tracking WHERE device_info_serial='" + device + "' LIMIT 10";
    var result = fetchTrackingData("https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query);
    var expectedNROfRecords = 10;
    result.done(function (data) {
        equal(data.rows.length, expectedNROfRecords);
        start();
    })
    .fail(function () {
        ok('', 'fetching 10 occurrences for device 703 failed');
        start();
    });
});
