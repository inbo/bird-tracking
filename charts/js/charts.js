var weekIndex = 0;
var globalData = new Object();
var birds = {
    "Eric": "point(3.182875%2051.340768)",
    "Anne": "point(2.930688%2051.233267)",
    "Jurgen": "point(2.930131%2051.233474)"
}
drawCharts("Eric");

// set some globals
// These calendars need to be initialized before running the create functions.
// That's because the create functions are also used for updating the calendars
// so they start with cal.destroy(), but therefore, cal should already be
// a calendar.
var daycal = new CalHeatMap();
daycal.init({itemSelector: "#day-month-heatmap"});
var hourcal = new CalHeatMap();
hourcal.init({itemSelector: "#hour-month-heatmap"});

function drawCharts (birdname) {
    point = birds[birdname];

    var hour_month_cartodbdata = fetchTrackingData_byDayHour(birdname, point, "");
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

    var day_month_cartodbdata = fetchTrackingData_byDay(birdname, point, "");
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
	drawBarChart(globalData.day_month_linedata);
    });

    firstWeek = weeks[weekIndex];
    subsetAreaData = subset(hour_stacked_area_data, firstWeek)
    drawHourAreaChart(hour_stacked_area_data);
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
	    cellSize: 20,
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
	    cellSize: 10,
	    rowLimit: 24,
	    subDomainTextFormat: "%H",
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
	    data: data
	});
    });
}

function drawBarChart(data) {
    nv.addGraph(function () {
	var chart = nv.models.discreteBarChart()
	    .x(function(d) { return d3.time.format('%d/%m')(new Date(d.x))})
	    .y(function(d) { return d.y})
	    .staggerLabels(true)
	    .color(['#A0E9AF', '#87CD95', '#6FB17B', '#579661', '#3E7A47', '#265E2D', '#0E4313']);

	d3.select('#barchart svg')
	    .datum(data)
	    .transition().duration(500)
	    .call(chart);

	nv.utils.windowResize(chart.update);

	return chart;
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

function drawHourAreaChart(data) {
    nv.addGraph(function() {
	var chart = nv.models.stackedAreaChart()
	  .x(function(d) {return d["x"]})
	  .y(function(d) {return d["y"]})
	  .clipEdge(true);

        chart.xAxis
	    .axisLabel("Hour")
	    .tickFormat(d3.format(',r'));

        chart.yAxis
	    .axisLabel('distance (km)')
	    .tickFormat(d3.format(',f'))
	    ;

      d3.select('#stackedareachart svg')
	    .datum(data)
	    .transition().duration(500)
	    .call(chart);

      nv.utils.windowResize(chart.update);
      return chart;
    });
}

// This function will fetch a subset of values from an array.
// The array is the one that is expected for the stacked area chart.
// The subsKeys should contain an array of dates (in string format)
// so that this function will only return the data points from the
// given dates.
function subset (array, subsKeys) {
    outArr = new Array();
    for (var i = 0; i < subsKeys.length ; i++) {
	key = subsKeys[i];
	for (var k = 0; k < array.length; k++) {
	    obj = array[k];
	    objKey = obj["key"];
	    if (objKey === key) {
		outArr.push(obj);
	    }
	}
    }
    return outArr;
}

function getWeek(weekIndex, weeks) {
    return weeks[weekIndex];
}

function nextWeek() {
    if (weekIndex < weeks.length - 1) {
	weekIndex++;
    }
    var newData = subset(hour_stacked_area_data, weeks[weekIndex]);
    drawHourAreaChart(newData);
}

function previousWeek() {
    if (weekIndex > 0) {
	weekIndex = weekIndex - 1;
    }
    var newData = subset(hour_stacked_area_data, weeks[weekIndex]);
    drawHourAreaChart(newData);
}

function allData() {
    drawHourAreaChart(hour_stacked_area_data);
}

$("#day-cal-next").on("click", function(event) {
    daycal.next();
});

$("#day-cal-previous").on("click", function(event) {
    daycal.previous();
});

$("#hour-cal-next").on("click", function(event) {
    hourcal.next();
});

$("#hour-cal-previous").on("click", function(event) {
    hourcal.previous();
});
