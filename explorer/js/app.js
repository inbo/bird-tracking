// -------------------------
// Fetch data from cartodb
// -------------------------

// general function to fetch data given a url
function fetchTrackingData(url) {
    var result = $.get(url, function(data) {
        $('.result').html(data);
    });
    return result;
}

// fetch distances of a device to a point per hour (max) for a date range
function fetchDistancesByHour(device, point, dateRange) {
    var start = dateRange[0].getFullYear() + "/" + (dateRange[0].getMonth() + 1) + "/" + dateRange[0].getDate();
    var end = dateRange[1].getFullYear() + "/" + (dateRange[1].getMonth() + 1) + "/" + dateRange[1].getDate();
    var query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('point(" + point + ")',4326) ) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE AND date_time>'" + start + "' AND date_time<'" + end + "') SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// fetch distance travelled of a device per day
function fetchDistTravelledByDay(device) {
    var query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// fetch distance travelled of a device per hour
function fetchDistTravelledByHour(device, dateRange) {
    var start = dateRange[0].getFullYear() + "/" + (dateRange[0].getMonth() + 1) + "/" + dateRange[0].getDate();
    var end = dateRange[1].getFullYear() + "/" + (dateRange[1].getMonth() + 1) + "/" + dateRange[1].getDate();
    var query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE AND date_time>'" + start + "' AND date_time<'" + end + "') SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);

}

// function to fetch all birds in the bird_tracking_devices table
function fetchBirdData() {
    var query = "SELECT d.bird_name, d.catch_location, d.ring_code, d.device_info_serial, d.sex, d.scientific_name, d.longitude, d.latitude, d.tracking_started_at, MAX(t.date_time) last_timestamp FROM bird_tracking_devices d LEFT OUTER JOIN bird_tracking t ON d.device_info_serial = t.device_info_serial GROUP BY d.bird_name, d.catch_location, d.ring_code, d.device_info_serial, d.sex, d.scientific_name, d.longitude, d.latitude, d.tracking_started_at";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// -------------------------
// Convert data
// -------------------------

// convert cartodb data to cal-heatmap input
function toCalHeatmap(indata) {
    var outdata = {};
    _.each(indata.rows, function(el, i) {
        var t = el.timestamp;
        var d = el.distance;
        outdata[t] = d;
    });
    return outdata;
}

function toC3Format(indata) {
    var x = ["x", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    var y = ["distance", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
    _.each(indata, function(val, key) {
        var d = new Date(key * 1000);
        y[d.getHours() + 1] = val;
    });
    return [x, y];
}

// -------------------------
// General helper functions
// -------------------------
function getDayXMonthsAgo(datetime, nrOfMonths) {
    var d = new Date(datetime * 1000);
    var c = d.setMonth(d.getMonth() - nrOfMonths);
    return c.valueOf() / 1000;
}

function getSVGWidth(id) {
    var svg = d3.select("#" + id);
    return svg.style("width");
}

function findCurrentSelectedMetric() {
    var activeMetricElement = d3.select("#select-metric .active a");
    var text = activeMetricElement.text();
    if (text == "Distance travelled") {
        return "distance_travelled";
    } else if (text == "Distance from catch location") {
        return "distance_from_catch_loc";
    }
}

// -------------------------
// app function will contain
// all functionality for the
// app
// -------------------------
var app = function() {
    var birds_call = fetchBirdData();
    var birds = [];
    var selectedBird;
    var yearcal;
    var yeardata;
    var yearcalRange;
    var monthcal;
    var monthdata;
    var daychart;
    var daydata;
    var nrOfDaysInMonth;
    var currentMonthRange;
    var currentDayRange;
    var currentlySelectedMetric = "distance_travelled";
    var currentlyDisplayedMetric;
    var map;
    var cartodbLayer = "empty";
    var timestampFirstDate;
    var timestampLastDate;
    var highlightedDay = "";
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    birds_call.done(function(data) {
        birds = _.sortBy(data.rows, function(bird) {return bird.scientific_name + bird.bird_name;});
        addBirdsToSelect();
    });

    // -------------------------
    // Bind functions to DOM elements
    // -------------------------
    $("#select-bird").on("change", function(e) {
        var optionSelected = $("option:selected", this);
        selectedBird = optionSelected.val();
        insertBirdMetadata();
        createYearChart();
        clearSelection();
    });

    var selMetricElements = d3.selectAll("#select-metric li");
    selMetricElements.on("click", changeMetric);

    // -------------------------
    // DOM interaction functions
    // -------------------------
    
    function addBirdsToSelect() {
        // create optgroups per species
        var all_species = _.map(birds, function(bird){ return bird.scientific_name;});
        var species = _.uniq(all_species, true);
        var opt_groups = {};
        _.each(species, function(spec_name){ opt_groups[spec_name] = "<optgroup label=\"" + spec_name +"\">";});

        // append bird names to the correct optgroups
        for (var i=0;i<birds.length;i++) {
            var opt = "<option value=" + i + ">" + birds[i].bird_name + "</option>";
            opt_groups[birds[i].scientific_name] += opt;
        }

        // create one html text with all the optgroups and their options
        var optgrp_html = "";
        _.each(opt_groups, function(optgrp, spec_name){ optgrp_html += optgrp + "</optgroup>";});

        // append the optgroups html to the select-bird element
        $("#select-bird").append(optgrp_html);
        selectedBird = 0;
        insertBirdMetadata();
    }

    // this function will insert bird metadata in the #bird-metadata element
    function insertBirdMetadata() {
        var species = birds[selectedBird].scientific_name;
        var sex = birds[selectedBird].sex;
        var ring_code = birds[selectedBird].ring_code;
        var tracking_start = new Date(birds[selectedBird].tracking_started_at);
        var track_start_date = tracking_start.getFullYear() + "-" + (tracking_start.getMonth() + 1) + "-" + tracking_start.getDate();
        $("#bird-metadata").html(
            sex + " <em>" + species + "</em> (" + ring_code + "), caught in " + track_start_date.substring(0,4) + "."
        );
    }

    // function to insert the selected date in the frontend
    function insertDateSelection(date) {
        var selectedTime = d3.select("#selected-time");
        selectedTime.text(date);
    }

    // this function will clear the date selection from the #selected-time element
    function clearDateSelection() {
        d3.select("#selected-time").text("");
    }

    // function to define the number of domains that will be drawn
    // in the year calendar chart. This is based on the width of
    // the svg element.
    function setYearcalRange() {
        var svgWidth = getSVGWidth("year-chart");
        svgWidth = svgWidth.substr(0, svgWidth.length - 2);
        yearcalRange = Math.floor(svgWidth / 88); // 88 is an estimated average for the total domain width. It depends on the number of columns that are present in a domain and hence, this will not be 100% correct.
    }

    // function to set the year data to the needed local variables
    function setYearData(data) {
        yeardata = toCalHeatmap(data);
        timestampLastDate = _.last(_.sortBy(_.keys(yeardata), function(el) {return el;}));
        timestampFirstDate = getDayXMonthsAgo(timestampLastDate, yearcalRange - 1);
    }

    function setMonthData(data) {
        monthdata = toCalHeatmap(data);
        var dayInMonth = new Date(_.keys(monthdata)[0] * 1000);
        var monthStart = new Date(dayInMonth.getFullYear(), dayInMonth.getMonth());
        var lastMonthDay = new Date(monthStart);
        lastMonthDay.setMonth(lastMonthDay.getMonth() + 1);
        lastMonthDay.setDate(lastMonthDay.getDate() - 1);
        nrOfDaysInMonth = lastMonthDay.getDate();
    }

    function drawMonthAndDayChart(includeDayChart) {
        var monthDataCall;
        var bird = birds[selectedBird];
        if (currentlySelectedMetric == "distance_travelled") {
            monthDataCall = fetchDistTravelledByHour(bird.device_info_serial, currentMonthRange);
        } else {
            var point = bird.longitude + " " + bird.latitude;
            monthDataCall = fetchDistancesByHour(bird.device_info_serial, point, currentMonthRange);
        }
        monthDataCall.done(function(data) {
            setMonthData(data);
            drawMonthChart();
            if (includeDayChart) {
                setDayData(currentDayRange);
                drawDayLineChart();
            }
        });
    }

    // function called when the metric is changed
    function changeMetric() {
        var clicked_element = d3.select(this);
        selMetricElements.classed("active", false);
        clicked_element.classed("active", true);
        currentlySelectedMetric = findCurrentSelectedMetric();
        drawMonthAndDayChart(true);
    }

    // function to draw the month heatmap chart
    function drawMonthChart() {
        if (_.keys(monthdata).length > 0) {
            if (typeof(monthcal) != "undefined" && monthcal !== null) {
                monthcal = monthcal.destroy(drawNewMonthChart);
            } else {
                drawNewMonthChart();
            }
        }
    }

    // helper function to create the google maps base layer
    function createNewBaseLayer() {
        var mapOptions = {
            zoom: 9,
            center: new google.maps.LatLng(51.2, 3),
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map'),  mapOptions);
    }

    // helper function to add a new cartodb layer to the map
    function createNewCartoDBLayer(sql) {
        cartodb.createLayer(map, {
            user_name: "lifewatch-inbo",
            type: "cartodb",
            sublayers: [{
                sql: sql,
                cartocss: "#bird_tracking{ marker-fill: #ffcc00; marker-width: 2.5; marker-line-color: #FFF; marker-line-width: 0; marker-line-opacity: 0.5; marker-opacity: 0.9; marker-comp-op: multiply; marker-type: ellipse; marker-placement: point; marker-allow-overlap: true; marker-clip: false; marker-multi-policy: largest; }"
            }]
        })
        .addTo(map)
        .done(function(layer) {
            cartodbLayer = layer;
        });
    }

    // this function will clear the cartodb layer
    function clearCartodbLayer() {
        var sublayer = cartodbLayer.getSubLayer(0);
        sublayer.remove();
        cartodbLayer = "empty";
    }


    // function to draw the cartodb map
    function drawMap(dateRange) {
        // construct the query based on the given dateRange and the current selected bird
        var start_str = dateRange[0].getFullYear() + "/" + (dateRange[0].getMonth() + 1) + "/" + dateRange[0].getDate();
        var end_str = dateRange[1].getFullYear() + "/" + (dateRange[1].getMonth() + 1) + "/" + dateRange[1].getDate();
        var sql = "select * from bird_tracking where userflag is false and date_time > '" + start_str + "' and date_time < '" + end_str + "' and device_info_serial='" + birds[selectedBird].device_info_serial + "'";

        // determine whether the map already exists. If so, we only need to update
        // the sql of the cartodb sublayer.
        if (typeof(map) == "undefined") {
            createNewBaseLayer();
            createNewCartoDBLayer(sql);
        } else {
            if (cartodbLayer == "empty") {
                // map is still present, but layer was removed.
                // need to create a new layer.
                createNewCartoDBLayer(sql);
            } else {
                var sublayer = cartodbLayer.getSubLayer(0);
                sublayer.setSQL(sql);
            }
        }
    }

    function setDayData(dateRange) {
        var timestamps = _.sortBy(_.keys(monthdata), function(x) {return x;});
        var selectedData = {};
        _.each(timestamps, function(timestamp) {
            if (timestamp > dateRange[0].valueOf() / 1000  && timestamp < dateRange[1].valueOf() / 1000) {
                selectedData[timestamp] = monthdata[timestamp];
            }
        });
        daydata = toC3Format(selectedData);
    }

    // function to load data in an existing line chart
    function loadDataInLineChart() {
        daychart.load({columns: daydata});
    }

    // function to clear the data in the day line chart
    function unloadDataInLineChart() {
        daychart.unload({ids: ["x", "distance"]});
    }

    // function to draw a new line chart if no one exists
    function drawNewDayLineChart() {
        var data = {
            x: "x",
            columns: daydata[0]
        };
        data.columns = [data.columns[0]],
        daychart = c3.generate({
            bindto: "#day-chart",
            data: data,
            axis: {
                x: {
                    tick: {format: function (x) {return x + "h";}}
                },
            }
        });
    }

    // function to draw the day line chart
    function drawDayLineChart() {
        if (typeof(daychart) == "undefined" || daychart === null) {
            drawNewDayLineChart();
        }
        loadDataInLineChart();
    }

    // function to remove the day line chart completely
    function clearDayChart() {
        daychart.destroy();
        daychart = null;
        d3.select("#day-chart").text("Select a day from the top heatmap.");
    }

    // funtion called when a cell in the year calendar is clicked
    function dayClick(date, value) {
        var monthStart = new Date(date.getFullYear(), date.getMonth());
        var monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        var monthRange = [monthStart, monthEnd];
        yearcal.highlight(date);
        highlightedDay = [];
        for (var i=0;i<24;i++) {
            var highlightHour = new Date(date);
            highlightHour.setHours(i);
            highlightedDay.push(highlightHour);
        }
        var dateStr = weekdays[date.getDay()] + " " + monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        var endDate = new Date(date);
        endDate.setDate(date.getDate() + 1);
        currentDayRange = [date, endDate];
        insertDateSelection(dateStr);
        currentlySelectedMetric = findCurrentSelectedMetric();
        if (!_.isEqual(currentMonthRange, monthRange) || !_.isEqual(currentlySelectedMetric, currentlyDisplayedMetric)) {
            currentMonthRange = monthRange;
            currentlyDisplayedMetric = currentlySelectedMetric;
            drawMonthAndDayChart(true);
        } else {
            monthcal.highlight(highlightedDay);
            setDayData(currentDayRange);
            drawDayLineChart();
        }
        drawMap(currentDayRange);
    }

    // this function is called when a month label is clicked
    function monthClick(d, i) {
        var date = new Date(d);
        var dateStr = monthNames[date.getMonth()] + " " + date.getFullYear();
        var endDate = new Date(getDayXMonthsAgo(date.valueOf() / 1000, -1) * 1000);
        var dateRange = [date, endDate];
        insertDateSelection(dateStr);
        currentlySelectedMetric = findCurrentSelectedMetric();
        if (!_.isEqual(currentMonthRange, dateRange) || !_.isEqual(currentlySelectedMetric, currentlyDisplayedMetric)) {
            currentMonthRange = dateRange;
            currentlyDisplayedMetric = currentlySelectedMetric;
            drawMonthAndDayChart(false);
        } else {
            highlightedDay = "";
            monthcal.highlight([]);
        }
        drawMap(dateRange);
        if (typeof(daychart) != "undefined" && daychart !== null) {
            unloadDataInLineChart();
        }
    }


    // this function will be called whenever a selection needs to be cleared
    function clearSelection() {
        clearDateSelection();
        highlightedDay = "";
        if (typeof(monthcal) != "undefined" && monthcal !== null) {
            monthcal.destroy();
        }
        if (cartodbLayer != "empty") {
            clearCartodbLayer();
        }
        if (typeof(daychart) != "undefined" && daychart !== null) {
            clearDayChart();
        }
    }

    // This function will add onClick events to all .graph-label elements
    function addCalendarMonthclickEvent() {
        var labels = d3.selectAll(".graph-label");
        labels.on("click", monthClick);
    }

    // helper function to actually draw the year chart
    function drawNewYearChart() {
        yearcal = new CalHeatMap();
        yearcal.init({
            domain: "month",
            subDomain: "day",
            itemName: ['kilometer', 'kilometers'],
            domainGutter: 5,
            displayLegend: false,
            cellSize: 14,
            legendColors: {
                min: "#DAE289",
                max: "#3B6427",
                empty: "#dddddd"
            },
            tooltip: true,
            itemSelector: "#year-chart",
            previousSelector: "#previous-month",
            nextSelector: "#next-month",
            start: new Date(timestampFirstDate * 1000),
            range: yearcalRange,
            data: yeardata,
            onClick: dayClick,
            onComplete: addCalendarMonthclickEvent
        });
    }

    // helper function to actually draw the month year chart
    function drawNewMonthChart() {
        var ts = new Date(_.keys(monthdata)[0] * 1000);
        var start_ts = new Date(ts.getFullYear(), ts.getMonth());
        monthcal = new CalHeatMap();
        monthcal.init({
            domain: "day",
            subDomain: "x_hour",
            itemName: ['kilometer', 'kilometers'],
            domainGutter: 2,
            displayLegend: true,
            cellSize: 8,
            verticalOrientation: true,
            rowLimit: 24,
            legendColors: {
                min: "#DAE289",
                max: "#3B6427",
                empty: "#dddddd"
            },
            label: {
                position: "left",
                width: 46,
                height: 4
            },
            domainLabelFormat: "%d",
            tooltip: true,
            itemSelector: "#month-chart",
            start: start_ts,
            highlight: highlightedDay,
            range: nrOfDaysInMonth,
            data: monthdata
        });
    }

    // fetch data and create the year chart
    function createYearChart() {
        var bird = birds[selectedBird];
        var yearDataCall = fetchDistTravelledByDay(bird.device_info_serial);
        yearDataCall.done(function(data) {
            if (data.rows.length > 0) {
                setYearcalRange();
                setYearData(data);
                if (typeof(yearcal) != "undefined" && yearcal !== null) {
                    yearcal = yearcal.destroy(drawNewYearChart);
                    clearSelection();
                } else {
                    drawNewYearChart();
                }
            } else {
                if (typeof(yearcal) != "undefined" && yearcal !== null) {
                    yearcal = yearcal.destroy();
                    clearSelection();
                }
            }
        });
    }
}();
