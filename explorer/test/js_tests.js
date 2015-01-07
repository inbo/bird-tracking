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

asyncTest("fetch distances data by day for device 703 and point 3.1828, 51.3407", 1, function() {
    var device = "703";
    var point = "3.1828 51.3407"
    var result = fetchDistancesByDay(device, point);
    result.done(function(data) {
        deepEqual(_.map(data.rows[0], function(val, key) {return key}), ["timestamp", "distance"]);
        start();
    })
    .fail(function() {
        ok("", "fetching distances data failed");
        start();
    });
});

asyncTest("fetch bird data", 1, function() {
    result = fetchBirdData();
    result.done(function (data) {
        equal(data.rows.length, 66);
        start();
    })
    .fail(function () {
        ok('', 'fetching bird data failed');
        start();
    });
});

// -------------------------------------
// Test data convertion functions
// -------------------------------------

// Convert to expected object type for calendar heatmap
test("convert object from cartodb to cal-heatmap input", function() {
    var testCartoDbOutput = {
        "time":0.05,
        "fields":{
            "timestamp":{"type":"number"},
            "distance":{"type":"number"}
        },
        "total_rows":1,
            "rows":[
                {
                    "timestamp": 1370044800,
                    "distance":5881.3
                },
                {
                    "timestamp": 4,
                    "distance": 9
                }
            ]
    };
    var calHeatmapInput = {"1370044800": 5881.3, "4": 9};
    deepEqual(toCalHeatmap(testCartoDbOutput), calHeatmapInput);
});
