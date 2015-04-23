// -------------------------------------
// Test calls to cartodb backend
// -------------------------------------

asyncTest("fetch distance data by hour for device 703 and point 3.1828, 51.3407", 2, function() {
    var device = "703";
    var point = "3.1828 51.3407"
    // june 1, 2013 = 1370037600000
    // july 1, 2013 = 1372629600000
    var june1 = new Date(1370037600000);
    var july1 = new Date(1372629600000);
    var result = app.fetchFurthestDistanceByHour(device, point, [june1, july1]);
    result.done(function(data) {
        deepEqual(_.map(data.rows[0], function(val, key) {return key}), ["timestamp", "distance"]);
        ok(data.rows.length < 31*24);
        start();
    })
    .fail(function() {
        ok("", "fetching distance data failed");
        start();
    });
});

asyncTest("fetch distance travelled by day for device 703", 1, function() {
    var device = "703";
    var result = app.fetchDistanceTravelledPerDay(device);
    result.done(function(data) {
        deepEqual(_.map(data.rows[0], function(val, key) {return key}), ["timestamp", "distance"]);
        start();
    })
    .fail(function() {
        ok("", "fetching distance travelled data failed");
        start();
    });
});

asyncTest("fetch distance travelled by hour for device 703", 2, function() {
    var device = "703";
    // june 1, 2013 = 1370037600000
    // july 1, 2013 = 1372629600000
    var june1 = new Date(1370037600000);
    var july1 = new Date(1372629600000);
    var result = app.fetchDistanceTravelledPerHour(device, [june1, july1]);
    result.done(function(data) {
        deepEqual(_.map(data.rows[0], function(val, key) {return key}), ["timestamp", "distance"]);
        ok(data.rows.length < 31*24);
        start();
    })
    .fail(function() {
        ok("", "fetching distance travelled data failed");
        start();
    });
});

asyncTest("fetch bird data", 2, function() {
    result = app.fetchBirdData();
    result.done(function (data) {
        equal(data.rows.length, 27);
        deepEqual(_.map(data.rows[0], function(val, key) {return key}), ["bird_name", "catch_location", "ring_code", "device_info_serial", "sex", "scientific_name", "longitude", "latitude", "tracking_started_at", "start_date", "end_date"]);
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
    deepEqual(app.toCalendarHeatmapData(testCartoDbOutput), calHeatmapInput);
});

// Convert to expected type for C3 line chart
test("convert data to C3 input format", function() {
    // 946681200000 = January 1, 2000, 0h
    // 946684800000 = January 1, 2000, 1h
    // 946688400000 = January 1, 2000, 2h
    var h0 = 946681200000 / 1000; // cal-heatmap data is timestamp / 1000
    var h1 = 946684800000 / 1000;
    var h2 = 946688400000 / 1000;
    var monthdata = {};
    monthdata[h0] = 20;
    monthdata[h1] = 10;
    monthdata[h2] = 40;
    var c3input = [
        ['x', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        ['distance', 20, 10, 40, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    ];
    deepEqual(app.toC3Chart(monthdata), c3input);
});

// -------------------------------------
// Test other helper functions
// -------------------------------------

// Get first day of the month of 11 months before given day
test("get day 11 months ago", function() {
    var inputDate = new Date(2005, 11, 10);
    var inputSeconds = inputDate.valueOf() / 1000; // cal heatmap works with seconds, not miliseconds
    var result = app.getDayXMonthsAgo(inputSeconds, 11);
    var d = new Date(result * 1000);
    equal(d.getFullYear(), 2005);
    equal(d.getMonth(), 0);
    equal(d.getDate(), 10);
});
