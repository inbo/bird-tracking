/* ------------
 * Fill select element with birdnames + draw charts for first bird
 * ------------
*/

$(document).ready(
    function() {
	bird_results = getAllBirdInfo("");
	bird_results.done(function(data) {
	    var birds = data.rows;
	    var len = birds.length;
	    globalData.bird_data = birds;
	    len = birds.length;
	    for (var i=0; i<len; i++) {
		bird = birds[i];
		$("#birdselector").append("<option value=\"" + i + "\">" + bird.bird_name + "</option>");
	    }
	    drawMapAndCharts("colony_dist", birds[0]);
	});
    }
);


/* ------------
 * Inititate global stuff
 * ------------
*/

var globalData = {}

/* ------------
 * set some globals
 * These calendars need to be initialized before running the create functions.
 * That's because the create functions are also used for updating the calendars
 * so they start with cal.destroy(), but therefore, cal should already be
 * a calendar.
 * ------------
*/

var hourcal = new CalHeatMap();
hourcal.init({itemSelector: "#hour-month-heatmap"});


/* ------------
 * Charting functions
 * ------------
*/

function drawMapAndCharts(data_type, bird_data) {
    drawCharts(data_type, bird_data);
    setBirdsLayer(window.map, bird_data.device_info_serial, "", "");
}

function drawCharts (data_type, bird_data) {
    insertBirdData(bird_data);
    if (data_type === "colony_dist") {
	var hour_month_cartodbdata = fetchTrackingData_byDayHour(bird_data.device_info_serial, "point("+ bird_data.colony_longitude + "%20" + bird_data.colony_latitude + ")", "");
    } else if (data_type === "dist_trav") {
	var hour_month_cartodbdata = fetchTravelledDist_byHour(bird_data.device_info_serial, "");
    }
    hour_month_cartodbdata.done(function (data) {
	globalData.hour_month_heatdata = toCalHeatmap(data);
	globalData.hour_month_linedata = toNvd3Linedata(data);
	var values = globalData.hour_month_linedata[0].values;
	var min_timestamp = values[0].x;
	var max_timestamp = values[values.length - 1].x;
	var startdate = new Date(min_timestamp);
	var nr_of_legend_categories = 6;
	var legend_scale = calculateScale(globalData.hour_month_heatdata, nr_of_legend_categories);
	drawHourCalHeatmap("#hour-month-heatmap", startdate, globalData.hour_month_heatdata, bird_data, legend_scale);
	drawHourLineChart(globalData.hour_month_linedata, min_timestamp, max_timestamp);
    });
}

function drawHourCalHeatmap(element, startdate, data, bird_data, legend_scale) {
    hourcal = hourcal.destroy(function () {
	hourcal = new CalHeatMap();
	hourcal.init({
	    onComplete: addEvents,
	    domain: "month",
	    subDomain: "x_hour",
	    range: 6,
	    start: startdate,
	    cellSize: 6.5,
	    rowLimit: 24,
	    verticalOrientation: false,
	    itemSelector: element,
	    domainMargin: 10,
	    itemName: ['kilometer', 'kilometers'],
	    tooltip: true,
	    displayLegend: true,
	    legend: legend_scale,
	    legendOrientation: "vertical",
	    legendVerticalPosition: "center",
	    legendHorizontalPosition: "left",
	    legendColors: {
		range: ["#C2F2C3", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32", "#000000"],
		empty: "#CFCFCF"
	    },
	    legendCellSize: 20,
	    legendCellPadding: 4,
	    data: data,
	    onClick: function(date, distance) {
		$(".graph-label").attr("class", "graph-label"); // remove highlight from month labels
		start_of_that_day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var highlight_dates = [];
		for (var i = 0; i < 24; i++) {
		    new_day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i);
		    highlight_dates.push(new_day);
		}
		hourcal.highlight(highlight_dates);
		clicked_date_timestamp = start_of_that_day.getTime();
		next_date_timestamp = clicked_date_timestamp + (24 * 60 * 60 * 1000);
		next_date = new Date(next_date_timestamp);
		$("#cur-select").text(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
		drawHourLineChart(globalData.hour_month_linedata, clicked_date_timestamp, next_date_timestamp);
		setBirdsLayer(window.map, bird_data.device_info_serial, start_of_that_day, next_date);
	    }
	});
    });
}

function calculateScale(data, nr_of_categs) {
    var values = [];
    for (var key in data) {
	values.push(data[key]);
    }
    min = values.sort(function(a,b) {return a-b})[0];
    max = values.sort(function(a,b) {return b-a})[0];
    range = [];
    scale = [];
    for (var i = 0; i <= nr_of_categs; i++) {
	range.push(i);
    }
    // create quadratic scale, normalized to min-max interval
    for (var range_e in range) {
	el = (Math.pow(range_e, 2) / (Math.pow(nr_of_categs, 2))) * (max - min) + min;
	out_el = Math.round(el*100) / 100.0;
	scale.push(out_el);
    }
    scale.pop();
    return scale
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

// ----- End of Charting functions ----- //

/* ------------
 * Add events to buttons
 * ------------
*/

// Go button
$("#gobutton").on("click", function(event) {
    globalData.datatype = "total_dist";
    $("#show-dist-col").attr("class", "tab active");
    $("#show-dist-trav").attr("class", "tab inactive");
    var bird_index = $("#birdselector").val();
    var bird = globalData.bird_data[bird_index];
    var data_type = "colony_dist";
    drawMapAndCharts(data_type, bird);
});

// Calendar navigation
$("#cal-next").on("click", function(event) {
    hourcal.next();
});

$("#cal-previous").on("click", function(event) {
    hourcal.previous();
});

// Calendar tabs
$("#show-dist-col").on("click", function(event) {
    $(this).attr("class", "tab active");
    $("#show-dist-trav").attr("class", "tab inactive");
    var bird_index = $("#birdselector").val();
    var bird = globalData.bird_data[bird_index];
    var data_type = "colony_dist";
    drawCharts(data_type, bird);
});

$("#show-dist-trav").on("click", function(event) {
    $(this).attr("class", "tab active");
    $("#show-dist-col").attr("class", "tab inactive");
    var bird_index = $("#birdselector").val();
    var bird = globalData.bird_data[bird_index];
    var data_type = "dist_trav";
    drawCharts(data_type, bird);
});

// Clear selection function
function clearSelection() {
    $("#cur-select").text("No date range selected");
    hourcal.highlight(new Date(1971, 1, 1)); // remove highlight from calendar cells
    $(".graph-label").attr("class", "graph-label"); // remove highlight from month labels
    var bird_index = $("#birdselector").val();
    var bird = globalData.bird_data[bird_index];
    var values = globalData.hour_month_linedata[0].values;
    var min_timestamp = values[0].x;
    var max_timestamp = values[values.length - 1].x;
    drawHourLineChart(globalData.hour_month_linedata, min_timestamp, max_timestamp);
    setBirdsLayer(window.map, bird.device_info_serial, "", "");
}

/* ------------
 * Add events to cal-heatmap graph-label
 * This function is called as call-back function
 * after the calendar data is loaded.
 * ------------
*/
function addEvents() {
    var bird_index = $("#birdselector").val();
    var bird = globalData.bird_data[bird_index];
    $(".graph-label").on("click", function(event) {
	// get class of parent DOM object. This should be "graph-domain m_A y_B"
	// Where A and B are month and year respectively.
	$(".graph-label").attr("class", "graph-label"); // remove highlight from other month labels
	$(this).attr("class", "graph-label highlight"); // set highlight on this label
	hourcal.highlight(new Date(1971, 1, 1)); // remove highlight from calendar cells
	var pclasses = $(this).parent().attr("class").split(" ");
	var month_nr = parseInt(pclasses[1].split("_")[1]);
	var year_nr = parseInt(pclasses[2].split("_")[1]);
	$("#cur-select").text(year_nr + "-" + month_nr);
	var month_index = month_nr - 1;
	if (month_nr == 12) {
	    var next_month_index = 0;
	    var next_year = year_nr + 1;
	}
        else {
	    var next_month_index = month_index + 1;
	    var next_year = year_nr;
	}
	var startdate = new Date(year_nr, month_index, 1);
	var enddate = new Date(next_year, next_month_index, 1);
	drawHourLineChart(globalData.hour_month_linedata, startdate.getTime(), enddate.getTime());
	setBirdsLayer(window.map, bird.device_info_serial, startdate, enddate);
    });
}


/* ------------
 * Insert bird data in web page
 * ------------
*/
function insertBirdData(bird_data) {
    $("#species-text").text(" " + bird_data.scientific_name);
    $("#sex-text").text(" " + bird_data.sex);
    $("#max-speed-text").text("");
    $("#max-dist-col").text("");
    var speed_result = fetchMaximumSpeed(bird_data.device_info_serial)
    speed_result.done(function (data) {
	$("#max-speed-text").text(" " + data.rows[0].round + " km/h");
    });
    var dist_result = getMaxDistance(bird_data.device_info_serial, bird_data.colony_longitude, bird_data.colony_latitude);
    dist_result.done(function (data) {
	$("#max-dist-col").text(" " + Math.round(data.rows[0].max / 10) / 100 + " km");
    });
}
