var weekIndex = 0;
firstWeek = weeks[weekIndex];
subsetAreaData = subset(hour_stacked_area_data, firstWeek)
drawHourLineChart(hour_month_linedata, 1370044800000, 1370563200000);
drawBarChart(day_month_bardata);
drawHourAreaChart(subsetAreaData);
drawDayCalHeatmap("#day-month-heatmap", day_month_heatdata);
drawHourCalHeatmap("#hour-month-heatmap", hour_month_heatdata);

function drawDayCalHeatmap(element, data) {
    var cal = new CalHeatMap();
    cal.init({
	itemSelector: element,
	domain: "month",
	subDomain: "x_day",
	start: new Date(2013, 5, 1),
	cellSize: 40,
	subDomainTextFormat: "%d",
	range: 2,
	domainMargin: 10,
	itemName: ['kilometer', 'kilometers'],
	displayLegend: true,
	legend: [20, 40, 60, 80, 100],
	legendColors: {
	    min: "#94E39D",
	    max: "000",
	    empty: "white"
	},
	legendCellSize: 20,
	legendCellPadding: 4,
	data: data,
	onClick: function(date, distance) {
	    clicked_date_timestamp = date.getTime();
	    next_date_timestamp = clicked_date_timestamp + (24 * 60 * 60 * 1000);
	    drawHourLineChart(hour_month_linedata, clicked_date_timestamp, next_date_timestamp);
	}
    });
}
function drawHourCalHeatmap(element, data) {
    var cal = new CalHeatMap();
    cal.init({
	domain: "month",
	subDomain: "x_hour",
	start: new Date(2013, 5, 1),
	minDate: new Date(2013, 5, 1),
	maxDate: new Date(2013, 7, 31),
	cellSize: 10,
	rowLimit: 24,
	subDomainTextFormat: "%H",
	range: 2,
	verticalOrientation: false,
	itemSelector: element,
	domainMargin: 10,
	itemName: ['kilometer', 'kilometers'],
	displayLegend: true,
	legend: [20, 40, 60, 80, 100],
	legendColors: {
	    min: "#94E39D",
	    max: "000",
	    empty: "white"
	},
	legendCellSize: 20,
	legendCellPadding: 4,
	data: data
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
