drawHourLineChart(hour_month_linedata);
drawDayCalHeatmap("#day-month-heatmap", day_month_heatdata);
drawHourCalHeatmap("#hour-month-heatmap", hour_month_heatdata);

console.log("Heatmap drawn.")
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
	data: data
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

function drawHourLineChart(data) {
    nv.addGraph(function() {
	var chart = nv.models.lineChart();

	chart.xAxis
	    .axisLabel('Time')
	    .ticks(20)
	    .tickFormat(function(d) {   return d3.time.format('%Y %B %d %Hh')(new Date(d)); });

        chart.yAxis
	    .axisLabel('Distance from nest (km)')
	    .tickFormat(d3.format('.02f'))

	d3.select('#linechart svg')
	    .datum(data)
	    .transition().duration(500)
	    .call(chart);
        
        nv.utils.windowResize(function() { d3.select('#linechart svg').call(chart) });

	return chart;
    });
}
