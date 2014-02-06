// Test jquery call to cartodb backend
//   * LIMIT 1
//   * Check content of result
asyncTest( "fetch data limit 1", 1, function() {
    var result = fetchTrackingData("https://lifewatch-inbo.cartodb.com/api/v2/sql?q=WITH%20distance_view%20AS%20(%20SELECT%20date_time,%20ST_Distance_Sphere(the_geom,ST_GeomFromText(%27point(3.182875%2051.340768)%27,4326)%20)%20AS%20distance_in_meters%20FROM%20three_gulls%20WHERE%20bird_name=%27Eric%27%20AND%20outlier%20IS%20NULL%20)%20SELECT%20extract(epoch%20FROM%20date_trunc(%27hour%27,date_time))%20AS%20timestamp,%20round((sum(distance_in_meters)/1000)::numeric,%203)%20AS%20distance%20FROM%20distance_view%20GROUP%20BY%20timestamp%20ORDER%20BY%20timestamp", " LIMIT 1");
    var expectedResult = {
        "time":"this is variable, you shouldn't test this",
        "fields":{
            "timestamp":{"type":"number"},
            "distance":{"type":"number"}
        },
        "total_rows":1,
        "rows":[
            {
                "date_time":"1369738800",
                "distance": 0.325
            }
        ]
    };
    result.done(function (data) {
        equal(data.rows[0].distance, 0.325);
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
    var result = fetchTrackingData("https://lifewatch-inbo.cartodb.com/api/v2/sql?q=WITH%20distance_view%20AS%20(%20SELECT%20date_time,%20ST_Distance_Sphere(the_geom,ST_GeomFromText(%27point(3.182875%2051.340768)%27,4326)%20)%20AS%20distance_in_meters%20FROM%20three_gulls%20WHERE%20bird_name=%27Eric%27%20AND%20outlier%20IS%20NULL%20)%20SELECT%20extract(epoch%20FROM%20date_trunc(%27hour%27,date_time))%20AS%20timestamp,%20round((sum(distance_in_meters)/1000)::numeric,%203)%20AS%20distance%20FROM%20distance_view%20GROUP%20BY%20timestamp%20ORDER%20BY%20timestamp", " ");
    result.done(function (data) {
        deepEqual( data.rows.length, 1658);
        start();
    })
    .fail(function () {
        ok('', 'fetch tracking data failed');
        start();
    });
});

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
// Convert to expected object type for calendar heatmap
test("convert object from cartodb to cal-heatmap input", function() {
    var calHeatmapInput = {"1370044800": 5881.3, "4": 9};
    deepEqual(toCalHeatmap(testCartoDbOutput), calHeatmapInput);
});

// Convert to expected object type for nvd3 line chart
test("convert object from cartodb to nvd3 linechart input", function() {
    var lineChartInput = [ {"key": "Maximum distance", "color": "green", "values": [ {"x": 1370044800000, "y": 5881.3}, {"x": 4000, "y": 9} ] } ];
    result = toNvd3Linedata(testCartoDbOutput);
    deepEqual(result[0].values, lineChartInput[0].values);
});

// Convert to total hour chart
test("convert object from cartodb to nvd3 total time linechart input", function () {
    var lineChartInput = [{"key": "Total distance from nest", "color": "green", "values": [{"x": "0", "y": 5890.3}]}];
    result = toNvd3TotalLinedata(testCartoDbOutput);
    deepEqual(result[0].values, lineChartInput[0].values);
});

asyncTest( "fetch data aggregated by day-hour", 2, function() {
    var result = fetchTrackingData_byDayHour("Eric", "point(3.182875%2051.340768)", " LIMIT 1");
    var expectedNrOfRows = 1;
    var expectedRow = {timestamp: 1369738800, distance: 0.325};
    result.done(function(data) {
	equal(data.rows.length, expectedNrOfRows);
	deepEqual(data.rows[0], expectedRow);
        start();
    })
    .fail(function () {
        ok('', 'fetch aggregated tracking data failed');
        start();
    });
});

asyncTest( "fetch data aggregated by day", 2, function() {
    var result = fetchTrackingData_byDay("Eric", "point(3.182875%2051.340768)", " LIMIT 1");
    var expectedNrOfRows = 1;
    var expectedRow = {timestamp: 1369699200, distance: 1.48};
    result.done(function(data) {
	equal(data.rows.length, expectedNrOfRows);
	deepEqual(data.rows[0], expectedRow);
        start();
    })
    .fail(function () {
        ok('', 'fetch aggregated tracking data failed');
        start();
    });
});

asyncTest( "fetch travelled distance per hour", 2, function() {
    var result = fetchTravelledDist_byHour("Eric", " LIMIT 1");
    var expectedNrOfRows = 1;
    var expectedRow = {timestamp: 1369738800, distance: null};
    result.done(function(data) {
	equal(data.rows.length, expectedNrOfRows);
	deepEqual(data.rows[0], expectedRow);
        start();
    })
    .fail(function () {
        ok('', 'fetch aggregated tracking data failed');
        start();
    });
});

asyncTest( "fetch travelled distance per day", 2, function() {
    var result = fetchTravelledDist_byDay("Eric", " LIMIT 1");
    var expectedNrOfRows = 1;
    var expectedRow = {timestamp: 1369699200, distance: 1.668};
    result.done(function(data) {
	equal(data.rows.length, expectedNrOfRows);
	deepEqual(data.rows[0], expectedRow);
        start();
    })
    .fail(function () {
        ok('', 'fetch aggregated tracking data failed');
        start();
    });
});
