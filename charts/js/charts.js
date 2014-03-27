var weekIndex = 0;
var globalData = {
    "birdname": "Eric",
    "datatype": "max_dist"
}

var birds = {
    "Eric": "point(3.182875%2051.340768)",
    "Anne": "point(2.930688%2051.233267)",
    "Jurgen": "point(2.930131%2051.233474)"
}
drawCharts();

// set some globals
// These calendars need to be initialized before running the create functions.
// That's because the create functions are also used for updating the calendars
// so they start with cal.destroy(), but therefore, cal should already be
// a calendar.
var daycal = new CalHeatMap();
daycal.init({itemSelector: "#day-month-heatmap"});
var hourcal = new CalHeatMap();
hourcal.init({itemSelector: "#hour-month-heatmap"});

function drawCharts () {
    point = birds[globalData.birdname];

    if (globalData.datatype === "max_dist") {
	var hour_month_cartodbdata = fetchTrackingData_byDayHour(globalData.birdname, point, "");
    } else if (globalData.datatype === "total_dist") {
	var hour_month_cartodbdata = fetchTravelledDist_byHour(globalData.birdname, "");
    }
    hour_month_cartodbdata.done(function (data) {
	globalData.hour_month_heatdata = toCalHeatmap(data);
	globalData.hour_month_linedata = toNvd3Linedata(data);
	var values = globalData.hour_month_linedata[0].values;
	var min_timestamp = values[0].x;
	var max_timestamp = values[values.length - 1].x;
	var startdate = new Date(min_timestamp);
	var enddate = new Date(max_timestamp);
	var nrOfMonths = enddate.getMonth() - startdate.getMonth() + 1;
	drawHourCalHeatmap("#hour-month-heatmap", startdate, nrOfMonths, globalData.hour_month_heatdata);
	drawHourLineChart(globalData.hour_month_linedata, min_timestamp, max_timestamp);
    });

    if (globalData.datatype === "max_dist") {
	var day_month_cartodbdata = fetchTrackingData_byDay(globalData.birdname, point, "");
    } else if (globalData.datatype === "total_dist") {
	var day_month_cartodbdata = fetchTravelledDist_byDay(globalData.birdname, "");
    }
    day_month_cartodbdata.done(function (data) {
	globalData.day_month_heatdata = toCalHeatmap(data);
	globalData.day_month_linedata = toNvd3Linedata(data);
	var values = globalData.day_month_linedata[0].values;
	var startdate = new Date(values[0].x);
	var enddate = new Date(values[values.length - 1].x);
	var nrOfMonths = enddate.getMonth() - startdate.getMonth() + 1;
	console.log("startdate: " + startdate);
	console.log("enddate: " + enddate);
	console.log("domain range: " + nrOfMonths);
	drawDayCalHeatmap("#day-month-heatmap", startdate, nrOfMonths, globalData.day_month_heatdata);
    });

}

function drawDayCalHeatmap(element, startdate, nrOfMonths, data) {
    daycal = daycal.destroy(function () {
	daycal = new CalHeatMap();
	if (nrOfMonths > 6) {
	    nrOfMonths = 6;
	}
	daycal.init({
	    itemSelector: element,
	    domain: "month",
	    subDomain: "x_day",
	    start: startdate,
	    cellSize: 26,
	    subDomainTextFormat: "%d",
	    range: nrOfMonths,
	    domainMargin: 10,
	    itemName: ['kilometer', 'kilometers'],
	    displayLegend: true,
	    legend: [1, 5, 10, 50, 100],
	    legendColors: {
		range: [ "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32", "#000000"],
		empty: "#CFCFCF"
	    },
	    legendCellSize: 20,
	    legendCellPadding: 4,
	    data: data,
	    onClick: function(date, distance) {
		clicked_date_timestamp = date.getTime();
		next_date_timestamp = clicked_date_timestamp + (24 * 60 * 60 * 1000);
		drawHourLineChart(globalData.hour_month_linedata, clicked_date_timestamp, next_date_timestamp);
	    }
	});
    });
}

function drawHourCalHeatmap(element, startdate, nrOfMonths, data) {
    hourcal = hourcal.destroy(function () {
	hourcal = new CalHeatMap();
	if (nrOfMonths > 4) {
	    nrOfMonths = 4;
	}
	hourcal.init({
	    domain: "month",
	    subDomain: "x_hour",
	    start: startdate,
	    minDate: startdate,
	    cellSize: 6.5,
	    rowLimit: 24,
	    range: nrOfMonths,
	    verticalOrientation: false,
	    itemSelector: element,
	    domainMargin: 10,
	    itemName: ['kilometer', 'kilometers'],
	    displayLegend: true,
	    legend: [0.05, 1, 5, 10, 50, 100],
	    legendColors: {
		range: ["#C2F2C3", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32", "#000000"],
		empty: "#CFCFCF"
	    },
	    legendCellSize: 20,
	    legendCellPadding: 4,
	    data: data,
	    onClick: function(date, distance) {
		start_of_that_day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		clicked_date_timestamp = start_of_that_day.getTime();
		next_date_timestamp = clicked_date_timestamp + (24 * 60 * 60 * 1000);
		drawHourLineChart(globalData.hour_month_linedata, clicked_date_timestamp, next_date_timestamp);
	    }
	});
    });
}

function drawHourLineChart(data, focus_min, focus_max) {
    nv.addGraph(function() {
	chart = nv.models.lineWithFocusChart();

	chart.xAxis
	    .axisLabel('Time')
	    .tickFormat(function(d) {return d3.time.format('%d/%m %Hh')(new Date(d)); });

	chart.x2Axis
	    .axisLabel('Time')
	    .ticks(20)
	    .tickFormat(function(d) {   return d3.time.format('%d/%m')(new Date(d)); });

        chart.yAxis
	    .axisLabel('Distance from nest (km)')
	    .tickFormat(d3.format('.02f'))

        chart.y2Axis
	    .axisLabel('Distance from nest (km)')
	    .tickFormat(d3.format('.02f'))

	chart.showLegend(false);
	chart.brushExtent([focus_min, focus_max]);

	d3.select('#linechart svg')
	    .datum(data)
	    .transition().duration(500)
	    .call(chart);
        
        nv.utils.windowResize(function() { d3.select('#linechart svg').call(chart) });

	return chart;
    });
}

$("#cal-next").on("click", function(event) {
    daycal.next();
    hourcal.next();
});

$("#cal-previous").on("click", function(event) {
    daycal.previous();
    hourcal.previous();
});

$("#birdname-eric").on("click", function(event) {
    $(this).attr("class", "active");
    globalData.birdname = "Eric";
    drawCharts();
    $("#birdname-anne").attr("class", "inactive");
    $("#birdname-jurgen").attr("class", "inactive");
});

$("#birdname-anne").on("click", function(event) {
    $(this).attr("class", "active");
    globalData.birdname = "Anne";
    drawCharts();
    $("#birdname-eric").attr("class", "inactive");
    $("#birdname-jurgen").attr("class", "inactive");
});

$("#birdname-jurgen").on("click", function(event) {
    $(this).attr("class", "active");
    globalData.birdname = "Jurgen";
    drawCharts();
    $("#birdname-eric").attr("class", "inactive");
    $("#birdname-anne").attr("class", "inactive");
});

$("#data-type-max").on("click", function(event) {
    $(this).attr("class", "active");
    globalData.datatype = "max_dist";
    drawCharts();
    $("#data-type-total").attr("class", "inactive");
});

$("#data-type-total").on("click", function(event) {
    $(this).attr("class", "active");
    globalData.datatype = "total_dist";
    drawCharts();
    $("#data-type-max").attr("class", "inactive");
});

$("#show-day-cal").on("click", function(event) {
    $(this).attr("class", "active");
    $("#show-hour-cal").attr("class", "inactive");
    $("#day-month-heatmap").toggle(true);
    $("#hour-month-heatmap").toggle(false);
});

$("#show-hour-cal").on("click", function(event) {
    $(this).attr("class", "active");
    $("#show-day-cal").attr("class", "inactive");
    $("#hour-month-heatmap").toggle(true);
    $("#day-month-heatmap").toggle(false);
});
