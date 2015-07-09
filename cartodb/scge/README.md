# Visualizing bird tracking data with CartoDB

## Introduction

[CartoDB](http://cartodb.com) is a tool to explore, analyze and visualize geospatial data online. In my opinion, it's like Gmail or GitHub: one of the best software tools ever. CartoDB is being used in a [wide area of domains](https://cartodb.com/gallery) (e.g. [education and research](https://cartodb.com/industries/education-and-research/)): in this workshop I'll give an introduction how to use it for tracking data.

## Create account

**Go to <https://cartodb.com/signup> to create an account**. Free accounts allow you to upload 50MB as public tables.

## Login

1. On login, you see your private dashboard. This is where you can upload data, create maps and manage your account.
2. CartoDB will display contextual help messages to get you to know the tool. For an overview, see [the documentation on the editor](http://docs.cartodb.com/).
3. You have a `dashboard/maps` overview and `dashboard/datasets` overview.
4. You also have a public profile (`https://user.cartodb.com/maps`). All datasets you upload and maps you create will be visible there.

## Upload data

1. **Go to your datasets overview.**
2. Upload data by dragging the file to the screen. CartoDB recognizes [multiple files formats](http://docs.cartodb.com/cartodb-editor.html#supported-file-formats).
3. **Upload `scge_lbbg_migration.csv`**

## Data view

1. CartoDB is powered by PostgreSQL and PostGIS.
2. CartoDB has created a table from your file and done some automatic interpretation of the data types. Some additional columns have been created as well, such as `cartodb_id`.
3. Geospatial data is interpreted automatically in `the_geom`. This interpretation assumes the geodetic datum to be `WGS84`. `the_geom` supports points, lines and polygons, but only one type per dataset.
4. Click arrow next to field name to manipulate columns: delete, alter data type, etc.
5. Toolbar on the right hand side: e.g. `Merge datasets`, `Add rows` and `Filters.
6. Filters is great for exploring the data. **Try out the filter on altitude.**

    ![Filters](filters.png)

7. Filters are actually just `SQL`, a much more powerful language to select, aggregate or update your data. CartoDB supports all PostgreSQL and PostGIS SQL functions.
8. **Try this SQL** to get some statistics about the scope of the dataset:

    ```SQL
    SELECT
        count(*) AS occurrences,
        min(date_time) AS min_date_time,
        max(date_time) AS max_date_time,
        count(distinct device_info_serial) AS individuals
    FROM scge_lbbg_migration
    ```

9. **Click** `Clear view` to remove any applied SQL.
 
## Create your first map

1. **Click** `Visualize` in the top right to create your first visualization and **name it** `My first map`.
2. **Click** `Map view`.
3. Change the background map by clicking `Change basemap` in the bottom right. `Positron` is a good default basemap, but there are many more options available and even more via `Yours` (including maps from NASA).
4. Click `Options` to change the map interaction options available to people viewing the map.
5. Toolbar on the right. `SQL` and `Filters` we already know.
6. **Click** `Wizards` to see a lot of visualization options. These are all explained in the [CartoDB documentation](http://docs.cartodb.com/cartodb-editor.html#map-wizards).
7. **Try** `Intensity` with the following options:

    ![Intensity map](intensity.png)

8. **Try** `Choropleth` with the following options: (use a `Dark matter` basemap. See the [documentation](http://docs.cartodb.com/cartodb-editor.html#choropleth) for quantification methods.):

    ![Choropleth map](choropleth.png)

9. Just like the filters are powered by SQL, the wizards are powered by `CartoCSS`, which you can use to fine-tune your visualization. **Click** `CSS` to discover how the quantification buckets are defined:

    ```CSS
    /** choropleth visualization */

    #scge_lbbg_migration{
      marker-fill-opacity: 0.8;
      marker-line-color: #FFF;
      marker-line-width: 0.5;
      marker-line-opacity: 1;
      marker-width: 8;
      marker-fill: #F2D2D3;
      marker-allow-overlap: true;
    }
    #scge_lbbg_migration [ altitude <= 3294] {
       marker-fill: #C1373C;
    }
    #scge_lbbg_migration [ altitude <= 2345] {
       marker-fill: #CC4E52;
    }
    #scge_lbbg_migration [ altitude <= 1396] {
       marker-fill: #D4686C;
    }
    #scge_lbbg_migration [ altitude <= 447] {
       marker-fill: #EBB7B9;
    }
    #scge_lbbg_migration [ altitude <= -502] {
       marker-fill: #F2D2D3;
    }
    ```

## Create a map of migration speed

1. We want to save our previous work and create another visualization. **Click** `Edit > Duplicate map` and **name it** `Where does gull 311 rest?`.
2. **Add a `WHERE` clause to the SQL** to only select male gull 311 between specific dates:

    ```SQL
    SELECT *
    FROM scge_lbbg_migration
    WHERE
        device_info_serial = 311
        AND date_time >= '2010-08-01'
        AND date_time <= '2011-03-30'
    ```

3. We want to visualize the travel speed of gull 311. The best way to start is to **create a `Choropleth` map**, with the following options:

    ![Start from a choropleth map](migration-speed-1.png)

4. Most of the dots are red, the story doesn't come across yet. Let's dive into the CSS to **fine-tine the visualization**. We basically set all dots to green, except where the speed is below 2m/s, which we show larger and in red:

    ```CSS
    /** choropleth visualization */

    #scge_lbbg_migration{
      marker-fill-opacity: 0.8;
      marker-line-color: #FFF;
      marker-line-width: 0.5;
      marker-line-opacity: 1;
      marker-width: 6;
      marker-fill: #1a9850;
      marker-allow-overlap: true;
    }
    #scge_lbbg_migration [ speed_2d < 2] {
      marker-fill: #d73027;
      marker-width: 10;
      marker-line-width: 1;
    }
    ```

5. **Click** `Legends` to manually set what to be shown in the legend:

    ![Update the legend](migration-speed-2.png)

6. **Click a point** and chose `Select field` to create an info window.

    ![Define info windows](migration-speed-3.png)

7. **Describe your map** in the top left by clicking `Edit metadata...`.
8. **Share your map** by clicking `Publish` in the top right. The sharing dialog box provides you with a link or the code to embed in a html page. The `CartoDB.js` is for advanced use in apps.
9. **Copy the link and paste it in a new browser tab** to verify the info windows and the bounding box** (i.e. is the interesting part of the data visible?). Anything you update in your visualization (including zoom level and bounding box) will affect the visualization (reload the page to see the changes).

[See the final visualization](https://inbo.cartodb.com/u/lifewatch/viz/7ad8e926-2644-11e5-9890-0e4fddd5de28/public_map)

## Create a map of tracks per month

1. **Duplicate** your visualization and **name it** `Tracks per month`.
2. This time we want to string the occurrences together as lines: one line per individual, per month. **This can be done in the SQL**. See the [PostgreSQL documentation](http://www.postgresql.org/docs/9.4/static/functions-datetime.html) for date functions. `the_geom_webmercator` is a geospatial field that is calculated by CartoDB in the background based on `the_geom` and is used for the actual display on the map. Since we're defining a new geospatial field (i.e. a line), we have to explicitely include it.

    ```SQL
    SELECT
        ST_MakeLine(the_geom_webmercator ORDER BY date_time ASC) AS the_geom_webmercator,
        extract(month from date_time) AS month,
        device_info_serial
    FROM scge_lbbg_migration
    WHERE
        date_time >= '2010-08-01'
        AND date_time <= '2010-12-31'
    GROUP BY
        device_info_serial,
        month
    ```

3. We want to display each month in a different colour, so **start with a `Choropleth` map**, with the following options:

    ![Start from a choropleth map](month-tracks-1.png)

4. We will also include labels (start doing this in the `Choropleth` options), so you can still see which track belongs to which individual. **Fine-tune the visualization in the CSS**:

    ```CSS
    /** choropleth visualization */

    #scge_lbbg_migration{
      polygon-opacity: 0;
      line-color: #FFFFCC;
      line-width: 1.5;
      line-opacity: 0.8;
    }

    #scge_lbbg_migration::labels {
      text-name: [device_info_serial];
      text-face-name: 'Lato Bold';
      text-size: 12;
      text-label-position-tolerance: 10;
      text-fill: #000;
      text-halo-fill: #FFF;
      text-halo-radius: 2;
      text-dy: -10;
      text-allow-overlap: false;
      text-placement: interior;
      text-placement-type: simple;
    }

    #scge_lbbg_migration [ month <= 12] {
       line-color: #253494;
    }
    #scge_lbbg_migration [ month <= 11] {
       line-color: #2C7FB8;
    }
    #scge_lbbg_migration [ month <= 10] {
       line-color: #41B6C4;
    }
    #scge_lbbg_migration [ month <= 9] {
       line-color: #A1DAB4;
    }
    #scge_lbbg_migration [ month <= 8] {
       line-color: #FFFFCC;
    }
    ```

5. **Update the legend**:

    ![Update the legend](month-tracks-2.png)

6. To provide some more context, let's annotate the map. In the top right, **click** `Add Element > Add annotation item` and **indicate summer and winter location**:

    ![Add annotatinos](month-tracks-3.png)

7. Finally, **update the description** in `Edit metadata...` and **publish your map**.

[See the final visualization](https://inbo.cartodb.com/u/lifewatch/viz/3f607d1c-264b-11e5-9d8b-0e018d66dc29/public_map)

## Create an animated map

1. **Duplicate** your visualization and **name it** `Migration in time`.

## Appendices

### Preparation of the migration data

1. Upload `migration_data.csv`
2. Make a selection:

    ```SQL
    SELECT
        altitude,
        date_time,
        device_info_serial,
        direction,
        latitude,
        longitude,
        speed_2d
    FROM migration_data
    ```
3. Export data
4. Rename to `scge_lbbg_migration.csv`

### Preparation of the metadata

These data are not used in the visualizations

1. Upload `individual.csv` to CartoDB
2. Upload `nest.csv` to CartoDB
3. Join tables:

    ```SQL
        SELECT
        i.colour_ring,
        i.ring_number,
        n.reference_name,
        n.device_info_serial,
        i.species_latin_name,
        i.sex,
        i.mass,
        n.latitude,
        n.longitude,
        n.start_date_time,
        n.end_date_time,
        n.remarks
    FROM individual i
        LEFT JOIN nest n
        ON i.colour_ring = n.colour_ring
    ```

4. Export data
5. Rename to `scge_metadata.csv`
