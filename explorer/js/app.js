// -------------------------
// Fetch data from cartodb
// -------------------------

// general function to fetch data given a url
function fetchTrackingData(url) {
    var result = jQuery.get(url, function(data) {
        jQuery('.result').html(data);
    });
    return result;
}

// fetch distances of a device to a point per day (max)
function fetchDistancesByDay(device, point) {
    query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,ST_GeomFromText('point(" + point + ")',4326) ) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((max(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp"
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// fetch distance travelled of a device per day
function fetchDistTravelledByDay(device) {
    query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('day',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// fetch distance travelled of a device per hour
function fetchDistTravelledByHour(device) {
    query = "WITH distance_view AS (SELECT date_time, ST_Distance_Sphere(the_geom,lag(the_geom,1) OVER(ORDER BY device_info_serial, date_time)) AS distance_in_meters FROM bird_tracking WHERE device_info_serial='" + device + "' AND userflag IS FALSE) SELECT extract(epoch FROM date_trunc('hour',date_time)) AS timestamp, round((sum(distance_in_meters)/1000)::numeric, 3) AS distance FROM distance_view GROUP BY timestamp ORDER BY timestamp";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);

}

// function to fetch all birds in the bird_tracking_devices table
function fetchBirdData() {
    query = "SELECT d.bird_name, d.catch_location, d.colour_ring_code, d.device_info_serial, d.sex, d.scientific_name, d.longitude, d.latitude, d.tracking_started_at, MAX(t.date_time) last_timestamp FROM bird_tracking_devices d LEFT OUTER JOIN bird_tracking t ON d.device_info_serial = t.device_info_serial GROUP BY d.bird_name, d.catch_location, d.colour_ring_code, d.device_info_serial, d.sex, d.scientific_name, d.longitude, d.latitude, d.tracking_started_at";
    var url = "https://lifewatch-inbo.cartodb.com/api/v2/sql?q=" + query;
    return fetchTrackingData(url);
}

// -------------------------
// Convert data
// -------------------------

// convert cartodb data to cal-heatmap input
function toCalHeatmap(indata) {
    var outdata = new Object();
    _.each(indata.rows, function(el, i) {
        var t = el.timestamp;
        var d = el.distance;
        outdata[t] = d;
    });
    return outdata;
}


// -------------------------
// General helper functions
// -------------------------
function getDayXMonthsAgo(datetime, nrOfMonths) {
    d = new Date(datetime * 1000);
    c = d.setMonth(d.getMonth() - nrOfMonths);
    return c.valueOf() / 1000;
}

function getSVGWidth(id) {
    var svg = d3.select("#" + id);
    return svg.style("width");
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
    var map;
    var cartodbLayer = "empty";
    var timestampFirstDate;
    var timestampLastDate;
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    birds_call.done(function(data) {
        birds = _.sortBy(data.rows, function(bird) {return bird.scientific_name + bird.bird_name});
        addBirdsToSelect()
    })

    // -------------------------
    // Bind functions to DOM elements
    // -------------------------
    $("#select-bird").on("change", function(e) {
        var optionSelected = $("option:selected", this);
        selectedBird = optionSelected.val();
        insertBirdMetadata();
        createYearChart();
    });

    var selMetricElements = d3.selectAll("#select-metric li");
    selMetricElements.on("click", function() {
        clicked_element = d3.select(this);
        selMetricElements.classed("active", false);
        clicked_element.classed("active", true);
    });

    // -------------------------
    // DOM interaction functions
    // -------------------------
    
    function addBirdsToSelect() {
        // create optgroups per species
        all_species = _.map(birds, function(bird){ return bird.scientific_name });
        species = _.uniq(all_species, true);
        opt_groups = {};
        _.each(species, function(spec_name){ opt_groups[spec_name] = "<optgroup label=\"" + spec_name +"\">"});

        // append bird names to the correct optgroups
        for (var i=0;i<birds.length;i++) {
            opt = "<option value=" + i + ">" + birds[i].bird_name + "</option>";
            opt_groups[birds[i].scientific_name] += opt;
        }

        // create one html text with all the optgroups and their options
        optgrp_html = "";
        _.each(opt_groups, function(optgrp, spec_name){ optgrp_html += optgrp + "</optgroup>"});

        // append the optgroups html to the select-bird element
        $("#select-bird").append(optgrp_html);
        selectedBird = 0;
        insertBirdMetadata();
    }

    // this function will insert bird metadata in the #bird-metadata element
    function insertBirdMetadata() {
        spec = birds[selectedBird].scientific_name;
        sex = birds[selectedBird].sex;
        catch_loc = birds[selectedBird].catch_location;
        colour_ring = birds[selectedBird].colour_ring_code;
        tracking_start = new Date(birds[selectedBird].tracking_started_at);
        track_start_date = tracking_start.getFullYear() + "-" + (tracking_start.getMonth() + 1) + "-" + tracking_start.getDate();
        $("#bird-metadata").text(
            "Species: " + spec +
            " | Sex: " + sex +
            " | Catched at: " + catch_loc +
            " | Colour ring: " + colour_ring +
            " | Tracked since: " + track_start_date
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
        timestampLastDate = _.last(_.sortBy(_.keys(yeardata), function(el) {return el}));
        timestampFirstDate = getDayXMonthsAgo(timestampLastDate, yearcalRange - 1);
    }

    // function to draw the month heatmap chart
    function drawMonthChart() {
        console.log("drawing the month chart");
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
        sublayer = cartodbLayer.getSubLayer(0);
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
                sublayer = cartodbLayer.getSubLayer(0);
                sublayer.setSQL(sql);
            }
        }
    }

    // function to draw the day line chart
    function drawDayLineChart() {
        console.log("drawing the day line chart");
    }

    // funtion called when a cell in the year calendar is clicked
    function dayClick(date, value) {
        yearcal.highlight(date);
        var dateStr = weekdays[date.getDay()] + " " + monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        var endDate = new Date(date);
        endDate.setDate(date.getDate() + 1);
        var dateRange = [date, endDate];
        insertDateSelection(dateStr);
        drawMonthChart();
        drawMap(dateRange);
        drawDayLineChart();
    }

    // this function is called when a month label is clicked
    function monthClick(d, i) {
        date = new Date(d);
        var dateStr = monthNames[date.getMonth()] + " " + date.getFullYear();
        var endDate = new Date(getDayXMonthsAgo(date.valueOf() / 1000, -1) * 1000);
        var dateRange = [date, endDate]
        insertDateSelection(dateStr);
        drawMonthChart();
        drawMap(dateRange);
        drawDayLineChart();
    }


    // this function will be called whenever a selection needs to be cleared
    function clearSelection() {
        clearDateSelection();
        console.log("clear month heatmap");
        console.log("clear map");
        clearCartodbLayer();
        console.log("clear day line chart");
    }

    // This function will add onClick events to all .graph-label elements
    function addCalendarMonthclickEvent() {
        console.log("adding calendar month click events");
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

    // fetch data and create the year chart
    function createYearChart() {
        var bird = birds[selectedBird];
        yearDataCall = fetchDistTravelledByDay(bird.device_info_serial);
        yearDataCall.done(function(data) {
            if (data.rows.length > 0) {
                setYearcalRange();
                setYearData(data);
                if (typeof(yearcal) != "undefined" && yearcal != null) {
                    yearcal = yearcal.destroy(drawNewYearChart);
                    clearSelection();
                } else {
                    drawNewYearChart();
                }
            } else {
                if (typeof(yearcal) != "undefined" && yearcal != null) {
                    yearcal = yearcal.destroy();
                    clearSelection();
                }
            }
        });
    }

}();
