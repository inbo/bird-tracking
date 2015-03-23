var app = function() {
    // -------------------------
    // Set variables
    // -------------------------

    var birds = [],
        selectedBird = [],
        selectedMetric = "distance-travelled",
        map,
        mapLayer = "",
        yearChart,
        
        monthcal,
        monthdata,
        daychart,
        daydata,
        nrOfDaysInMonth,
        currentMonthRange,
        currentDayRange,
        currentlyDisplayedMetric,
        highlightedDay = "",
        weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    // -------------------------
    // General helper functions
    // -------------------------

    // Get certain day of defined number of months ago
    var getDayXMonthsAgo = function (datetime, nrOfMonths) {
        var d = new Date(datetime * 1000);
        var c = d.setMonth(d.getMonth() - nrOfMonths);
        return c.valueOf() / 1000;
    };

    // -------------------------
    // Data fetch functions
    // -------------------------

    // Fetch metadata of bird_tracking_devices (that have tracking data)
    var fetchBirdData = function () {
        var sql = "SELECT d.*, t.start_date, t.end_date FROM bird_tracking_devices AS d INNER JOIN (SELECT device_info_serial, min(date_time) AS start_date, max(date_time) AS end_date FROM bird_tracking WHERE userflag IS FALSE GROUP BY device_info_serial) AS t ON d.device_info_serial = t.device_info_serial ORDER BY d.scientific_name, d.bird_name";
        return $.get("https://lifewatch.cartodb.com/api/v2/sql?q=" + sql);
    };

    // Fetch distance travelled by a device, per day
    var fetchDistanceTravelledPerDay = function (device) {
        var sql = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom, 1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day', date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
        return $.get("https://lifewatch.cartodb.com/api/v2/sql?q=" + sql);
    };

    // Fetch distance travelled by a device, per hour, for a date range
    var fetchDistanceTravelledPerHour = function (device, dateRange) {
        var sql = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom, 1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE AND date_time > '" + toISODate(dateRange[0]) + "' AND date_time < '" + toISODate(dateRange[1]) + "') SELECT extract(epoch FROM date_trunc('hour', date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
        return $.get("https://lifewatch.cartodb.com/api/v2/sql?q=" + sql);
    };

    // Fetch furthest distance of a device from a location, per hour, for a date range
    var fetchFurthestDistanceByHour = function (device, point, dateRange) {
        var sql = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('point(" + point + ")',4326) ) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE AND date_time>'" + toISODate(dateRange[0]) + "' AND date_time<'" + toISODate(dateRange[1]) + "') SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
        return $.get("https://lifewatch.cartodb.com/api/v2/sql?q=" + sql);
    };

    // -------------------------
    // Data transformation functions
    // -------------------------

    // Transform datetimestring to ISO date
    var toISODate = function (dateTimeString) {
        var dateTime = new Date(dateTimeString);
        return dateTime.toISOString();
    };

    // Transfrom CartoDB tracking data to calender heatmap data
    var toCalendarHeatmapData = function (inputData) {
        var outputData = {};
        _.each(inputData.rows, function(el, i) {
            outputData[el.timestamp] = el.distance;
        });
        return outputData;
    };

    // Transform distance data to C3 timeseries chart data
    var toC3Chart = function (inputData) {
        var x = ["x", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        var y = ["distance", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
        _.each(inputData, function(val, key) {
            var d = new Date(key * 1000);
            y[d.getHours() + 1] = val;
        });
        return [x, y];
    };

    // TODO: START REVIEW --------

    var setDayData = function (dateRange) {
        // TODO: Don't use dateRange
        var timestamps = _.sortBy(_.keys(monthdata), function(x) {return x;});
        var selectedData = {};
        _.each(timestamps, function(timestamp) {
            if (timestamp > dateRange[0].valueOf() / 1000  && timestamp < dateRange[1].valueOf() / 1000) {
                selectedData[timestamp] = monthdata[timestamp];
            }
        });
        daydata = toC3Chart(selectedData);
    };

    // this function will insert bird metadata in the #bird-metadata element
    var insertBirdMetadata = function () {
        var species = selectedBird.scientific_name;
        var sex = selectedBird.sex;
        var ring_code = selectedBird.ring_code;
        var tracking_start = new Date(selectedBird.tracking_started_at);
        var track_start_date = tracking_start.getFullYear() + "-" + (tracking_start.getMonth() + 1) + "-" + tracking_start.getDate();
        $("#bird-metadata").html(
            sex + " <em>" + species + "</em> (" + ring_code + "), caught in " + track_start_date.substring(0,4) + "."
        );
    };

    // function to insert the selected date in the frontend
    var insertDateSelection = function (date) {
        var selectedTime = d3.select("#selected-time");
        selectedTime.text(date);
    };

    // this function will clear the date selection from the #selected-time element
    var clearDateSelection = function () {
        d3.select("#selected-time").text("");
    };

    var setMonthData = function (data) {
        monthdata = toCalendarHeatmapData(data);
        var dayInMonth = new Date(_.keys(monthdata)[0] * 1000);
        var monthStart = new Date(dayInMonth.getFullYear(), dayInMonth.getMonth());
        var lastMonthDay = new Date(monthStart);
        lastMonthDay.setMonth(lastMonthDay.getMonth() + 1);
        lastMonthDay.setDate(lastMonthDay.getDate() - 1);
        nrOfDaysInMonth = lastMonthDay.getDate();
    };

    var drawMonthAndDayChart = function (includeDayChart) {
        var monthDataCall;
        if (selectedMetric == "distance-travelled") {
            monthDataCall = fetchDistanceTravelledPerHour(selectedBird.device_info_serial, currentMonthRange);
        } else {
            var point = selectedBird.longitude + " " + selectedBird.latitude;
            monthDataCall = fetchFurthestDistanceByHour(selectedBird.device_info_serial, point, currentMonthRange);
        }
        monthDataCall.done(function(data) {
            setMonthData(data);
            drawMonthChart();
            showMetrics();
            if (includeDayChart) {
                setDayData(currentDayRange);
                drawDayLineChart();
            }
        });
    };

    // this function will insert metrics into the #metric-metadata element
    var showDistTravelledMetric = function () {
        var text = "";
        if (_.keys(monthdata).length != 0) {
            var sum = _.reduce(monthdata, function (memo, dist, timestamp) {
                return memo + dist;
            });
            var nr_of_days = _.keys(monthdata).length / 24;
            var avg = sum / nr_of_days;
            avg = Math.round(avg * 100) / 100;
            text = "Average distance travelled this month: " + avg + " km/day.";
        }
        d3.select("#metric-metadata").text(text);
    };

    var showDistFromCatchMetric = function () {
        var text = "";
        if (_.keys(monthdata).length != 0) {
            var maxDistPerDay = {};
            _.each(monthdata, function (dist, timestamp) {
                var ts = new Date(timestamp * 1000);
                ts.setHours(0); // ts refers to the beginning of the day
                if (_.contains(_.keys(maxDistPerDay), ts.valueOf().toString())) {
                    maxDistPerDay[ts.valueOf()].push(dist);
                } else {
                    maxDistPerDay[ts.valueOf()] = [dist];
                }
            });
            var maxDistances = [];
            _.each(maxDistPerDay, function (distArr, timestamp) {
                maxDistances.push(_.max(distArr));
            });
            var sum = _.reduce(maxDistances, function (memo, dist, timestamp) {
                return memo + dist;
            });
            var nr_of_days = maxDistances.length;
            var avgMax = sum / nr_of_days;
            avgMax = Math.round(avgMax * 100) / 100;
            text = "Average furthest distance this month: "+ avgMax + " km/day.";
        }
        d3.select("#metric-metadata").text(text);
    };

    var showMetrics = function () {
        if (selectedMetric == "distance-travelled") {
            showDistTravelledMetric();
        } else {
            showDistFromCatchMetric();
        }
    };

    // this function will clear the information in the #metric-metadata element
    var clearMetrics = function () {
        d3.select("#metric-metadata").text();
    };

    // function to draw the month heatmap chart
    var drawMonthChart = function () {
        if (_.keys(monthdata).length > 0) {
            if (typeof(monthcal) != "undefined" && monthcal !== null) {
                monthcal = monthcal.destroy(drawNewMonthChart);
            } else {
                drawNewMonthChart();
            }
        }
    };

    // function to load data in an existing line chart
    var loadDataInLineChart = function () {
        daychart.load({columns: daydata});
    };

    // function to clear the data in the day line chart
    var unloadDataInLineChart = function () {
        daychart.unload({ids: ["x", "distance"]});
    };

    // function to draw a new line chart if no one exists
    var drawNewDayLineChart = function () {
        var data = {
            x: "x",
            columns: daydata[0],
            type: "spline"
        };
        data.columns = [data.columns[0]];
        daychart = c3.generate({
            bindto: "#day-chart",
            data: data,
            axis: {
                x: {
                    tick: {format: function (x) {return x + "h";}}
                }
            },
            legend: {
                show: false
            }
        });
    };

    // function to draw the day line chart
    var drawDayLineChart = function () {
        if (typeof(daychart) == "undefined" || daychart === null) {
            drawNewDayLineChart();
        }
        loadDataInLineChart();
    };

    // function to remove the day line chart completely
    var clearDayChart = function () {
        daychart.destroy();
        daychart = null;
    };

    // funtion called when a cell in the year calendar is clicked
    var dayClick = function (date, value) {
        date.setHours(0);
        var monthStart = new Date(date.getFullYear(), date.getMonth());
        var monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        var monthRange = [monthStart, monthEnd];
        yearChart.highlight(date);
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
        // selectedMetric = getSelectedMetric();
        if (!_.isEqual(currentMonthRange, monthRange) || !_.isEqual(selectedMetric, currentlyDisplayedMetric)) {
            currentMonthRange = monthRange;
            currentlyDisplayedMetric = selectedMetric;
            drawMonthAndDayChart(true);
        } else {
            monthcal.highlight(highlightedDay);
            setDayData(currentDayRange);
            drawDayLineChart();
        }
        refreshMap(currentDayRange);
    };

    // this function is called when a month label is clicked
    var monthClick = function (d, i) {
        var date = new Date(d);
        var dateStr = monthNames[date.getMonth()] + " " + date.getFullYear();
        var endDate = new Date(getDayXMonthsAgo(date.valueOf() / 1000, -1) * 1000);
        var dateRange = [date, endDate];
        insertDateSelection(dateStr);
        highlightedDay = "";
        yearChart.highlight("now");
        // selectedMetric = getSelectedMetric();
        // TODO: Don't use dateRange
        if (!_.isEqual(currentMonthRange, dateRange) || !_.isEqual(selectedMetric, currentlyDisplayedMetric)) {
            currentMonthRange = dateRange;
            currentlyDisplayedMetric = selectedMetric;
            drawMonthAndDayChart(false);
        } else {
            monthcal.highlight("now"); // should clear the highlight but can't get it to work. Since we're publishing data after an embargo period, "now" will always seem to clear the highlight.
        }
        refreshMap(dateRange);
        if (typeof(daychart) != "undefined" && daychart !== null) {
            unloadDataInLineChart();
        }
    };

    // this function will be called whenever a selection needs to be cleared
    var clearSelection = function () {
        clearDateSelection();
        highlightedDay = "";
        if (typeof(monthcal) != "undefined" && monthcal !== null) {
            monthcal.destroy();
        }
        // if (mapLayer !== "") {
        //     clearMapLayer();
        // }
        if (typeof(daychart) != "undefined" && daychart !== null) {
            clearDayChart();
        }
        clearMetrics();
    };

    // this function will add an event to the #next-month element that
    // will cause the year calendar to load the next domain
    var addNextClickEvent = function () {
        d3.select("#next-month").on("click", function () {
            yearChart.next();
            addCalendarMonthclickEvent();
        });
    };

    // this function will add an event to the #previous-month element that
    // will cause the year calendar to load the previous domain
    var addPreviousClickEvent = function () {
        d3.select("#previous-month").on("click", function () {
           yearChart.previous();
            addCalendarMonthclickEvent();
        });
    };

    // This function will add onClick events to all .graph-label elements
    var addCalendarMonthclickEvent = function () {
        var labels = d3.selectAll(".graph-label");
        labels.on("click", monthClick);
    };

    // This function will add events to interact with the calender after it
    // is drawn.
    var addYearCalendarEvents = function () {
        addNextClickEvent();
        addPreviousClickEvent();
        addCalendarMonthclickEvent();
    };

    // helper function to actually draw the month year chart
    var drawNewMonthChart = function () {
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
                min: "#dae289",
                max: "#3b6427",
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
            onClick: dayClick,
            highlight: highlightedDay,
            range: nrOfDaysInMonth,
            data: monthdata
        });
    };


    // TODO: END REVIEW --------



    // -------------------------
    // CartoDB map functions
    // -------------------------

    // Load default data on map
    var clearMapLayer = function () {
        mapLayer.getSubLayer(0).set({"sql": "SELECT * FROM bird_tracking"});
    };

    // Load selected data on map
    var refreshMap = function (dateRange) {
        var sql = "SELECT * FROM bird_tracking WHERE userflag IS FALSE AND date_time >= '" + toISODate(dateRange[0]) + "' AND date_time <= '" + toISODate(dateRange[1]) + "' AND device_info_serial='" + selectedBird.device_info_serial + "'";
        clearMapLayer();
        mapLayer.getSubLayer(0).set({"sql": sql});
    };

    // Create CartoDB map
    var createMap = function (callback) {
        map = new L.Map("map-canvas", {
            center: [51.2, 3],
            zoom: 8
        });

        // Add dark matter baselayer
        L.tileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        }).addTo(map);

        // Create default layer
        cartodb.createLayer(map, "http://lifewatch.cartodb.com/api/v2/viz/86605af2-b1fc-11e4-8c13-0e0c41326911/viz.json")
            .addTo(map)
            .on("done", function (layer) {
                mapLayer = layer; // Store layer handle
                callback();
            }).on("error", function () {});
    };

    // -------------------------
    // Year chart functions
    // -------------------------

    // Assess the number of months to display for the current width
    var getDisplayableMonths = function (anchor) {
        var svgWidth = d3.select(anchor).style("width");
        svgWidth = svgWidth.substr(0, svgWidth.length - 2); // Remove px
        return Math.floor(svgWidth / 88); // 88 is an estimated average for the total domain width. It depends on the number of columns that are present in a domain and hence, this will not be 100% correct.      
    };

    // Fetch data and create the year chart
    var createYearChart = function () {
        fetchDistanceTravelledPerDay(selectedBird.device_info_serial)
            .done(function (data) {
                if (data.rows.length > 0) {
                    var anchor = "#year-chart",
                        yearChartRange = getDisplayableMonths(anchor),
                        yearChartData = toCalendarHeatmapData(data),
                        yearChartEnd = _.last(_.sortBy(_.keys(yearChartData), function(el) {return el;})),
                        yearChartStart = getDayXMonthsAgo(yearChartEnd, yearChartRange - 1);

                    if (typeof yearChart !== "undefined") {
                        $(anchor).empty(); // Faster than yearChart.destroy()
                    }
                    yearChart = new CalHeatMap();
                    yearChart.init({
                        data: yearChartData,
                        start: new Date(yearChartStart * 1000),
                        range: yearChartRange,
                        itemSelector: anchor,
                        domain: "month",
                        subDomain: "day",
                        itemName: ['kilometer', 'kilometers'],
                        cellSize: 14,
                        domainGutter: 5,
                        displayLegend: false,
                        legendColors: {
                            min: "#dae289",
                            max: "#3b6427",
                            base: "#dddddd"
                        },
                        tooltip: true,
                        onClick: dayClick,
                        onComplete: addYearCalendarEvents
                    });
                }
            });
    };


    // -------------------------
    // Data load functions
    // -------------------------

    var loadBird = function () {
        // clearSelection(); // TODO: Remove
        refreshMap([selectedBird.start_date, selectedBird.end_date]);
        insertBirdMetadata();
        createYearChart();
    };

    var loadMetric = function () {
        drawMonthAndDayChart(true); // TODO: Load data in the load metric function
    };


    // -------------------------
    // Page load functions
    // -------------------------

    // Create bird selection dropdown
    var createBirdSelection = function () {
        // Create optgroups per species
        var allSpecies = _.map(birds, function (bird) { return bird.scientific_name; }),
            species = _.uniq(allSpecies, true),
            optgroups = {};
        _.each(species, function (spec_name) {
            optgroups[spec_name] = '<optgroup label="' + spec_name + '">';
        });

        // Append bird names to the correct optgroups
        for (var i = 0; i < birds.length; i++) {
            var option = '<option value="' + i + '">' + birds[i].bird_name + '</option>';
            optgroups[birds[i].scientific_name] += option;
        }

        // Create one html text with all the optgroups and their options
        var html = "";
        _.each(optgroups, function (optgroup) {
            html += optgroup + "</optgroup>";
        });

        // Append the optgroups html to the select-bird element
        $("#select-bird").append(html);
    };

    var init = function() {
        fetchBirdData()
            .done(function (data) {
                birds = data.rows;
                selectedBird = birds[0]; // First bird
                createBirdSelection(); // Don't wait to finish
                createMap(loadBird);
            });
    };
    
    init();


    // -------------------------
    // DOM interactions
    // -------------------------

    var selectBird = function() {
        clearSelection();
        var birdID = $("option:selected", this).val();
        selectedBird = birds[birdID];
        loadBird();        
    };

    var selectMetric = function () {
        var selectedMetricElement = $(this),
            siblings = selectedMetricElement.siblings();
        siblings.removeClass("active");
        selectedMetricElement.addClass("active");
        selectedMetric = selectedMetricElement.attr("id");
        loadMetric();
    };

    $("#select-bird").on("change", selectBird);
    $("#select-metric li").on("click", selectMetric);

}();
