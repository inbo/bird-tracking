// Test jquery call to cartodb backend
//   * LIMIT 1
//   * Check content of result
asyncTest( "fetch data limit 1", 2, function() {
    var result = fetchTrackingData("LIMIT 1");
    var expectedResult = {
        "time":0.05,
        "fields":{
            "cartodb_id":{"type":"number"},
            "date_time":{"type":"date"},
            "day_of_year":{"type":"number"},
            "distance_from_nest_in_meters":{"type":"number"}
        },
        "total_rows":1,
        "rows":[
            {
                "cartodb_id":1517,
                "date_time":"2013-06-01T00:01:09Z",
                "day_of_year":152,
                "distance_from_nest_in_meters":5881.892200839
            }
        ]
    };
    result.done(function (data) {
        deepEqual( data, expectedResult );
        equal(data.rows[0].distance_from_nest_in_meters, 5881.892200839);
        start();
    })
    .fail(function () {
        ok('', 'fetch tracking data failed');
        start();
    });
});

// Test jquery call to cartodb backend
//   * count number of output rows
asyncTest( "fetch all data", 1, function() {
    var result = fetchTrackingData("");
    result.done(function (data) {
        deepEqual( data.rows.length, 25483);
        start();
    })
    .fail(function () {
        ok('', 'fetch tracking data failed');
        start();
    });
});

// Convert to expected object type
test("convert object from cartodb to nvd3 input", function() {
    var cartoDbOutput = {
        "time":0.05,
        "fields":{
            "cartodb_id":{"type":"number"},
            "date_time":{"type":"date"},
            "day_of_year":{"type":"number"},
            "distance_from_nest_in_meters":{"type":"number"}
        },
        "total_rows":1,
        "rows":[
            {
                "cartodb_id":1517,
                "date_time":"2013-06-01T00:01:09Z",
                "day_of_year":152,
                "distance_from_nest_in_meters":5881.892200839
            }
        ]
    };
    equal(1, "This test needs to be implemented. First we need to be able to request the aggregated data from cartodb.");
});
