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

// function to fetch all birds in the bird_tracking_devices table
function fetchBirdData() {
    query = "SELECT bird_name, device_info_serial, sex, scientific_name, longitude, latitude from bird_tracking_devices";
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
function getDayOneYearAgo(datetime) {
    d = new Date(datetime * 1000);
    if (d.getMonth() != 11) {
        c = new Date(d.getFullYear() - 1, d.getMonth() + 1);
    } else {
        c = new Date(d.getFullYear(), 0);
    }
    return c.valueOf() / 1000;
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
    var timestampFirstDate;
    var timestampLastDate;
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

    function insertBirdMetadata() {
        spec = birds[selectedBird].scientific_name;
        sex = birds[selectedBird].sex;
        $("#bird-metadata").text("Species: " + spec + " | Sex: " + sex);
    }

    // function to set the year data to the needed local variables
    function setYearData(data) {
        yeardata = toCalHeatmap(data);
        timestampLastDate = _.last(_.sortBy(_.keys(yeardata), function(el) {return el}));
        timestampFirstDate = getDayOneYearAgo(timestampLastDate);
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
            tooltip: true,
            itemSelector: "#year-chart",
            previousSelector: "#previous-month",
            nextSelector: "#next-month",
            start: new Date(timestampFirstDate * 1000),
            range: 12,
            data: yeardata
        });
    }

    // fetch data and create the year chart
    function createYearChart() {
        var bird = birds[selectedBird];
        yearDataCall = fetchDistTravelledByDay(bird.device_info_serial);
        yearDataCall.done(function(data) {
            if (data.rows.length > 0) {
                setYearData(data);
                if (typeof(yearcal) != "undefined" && yearcal != null) {
                    yearcal = yearcal.destroy(drawNewYearChart);
                } else {
                    drawNewYearChart();
                }
            } else {
                if (typeof(yearcal) != "undefined" && yearcal != null) {
                    yearcal = yearcal.destroy();
                }
            }
        });
    }

}();
