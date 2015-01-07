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

// function to fetch all birds in the bird_tracking_devices table
function fetchBirdData() {
    query = "SELECT bird_name, device_info_serial, sex, scientific_name from bird_tracking_devices";
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
// app function will contain
// all functionality for the
// app
// -------------------------
var app = function() {
    var birds_call = fetchBirdData();
    var birds = [];
    var selectedBird;
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
}();
