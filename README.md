# Bird tracking

Tools and documentation for analyzing and visualizing data from our [bird tracking network](http://lifewatch.inbo.be/blog/tag/bird-tracking.html).

## Published dataset

* [Published dataset](http://doi.org/10.15468/02omly)
* [Our data publication process](https://github.com/inbo/data-publication/tree/master/datasets/bird-tracking-gull-occurrences)

## Accessing the bird tracking data with CartoDB

[See this document](cartodb/README.md).

## Bird tracking explorer

We built a tool to explore the bird tracking data, using [D3.js](http://d3js.org/), [C3](http://c3js.org), [Cal-heatmap](http://kamisama.github.io/cal-heatmap/), and [CartoDB.js](http://developers.cartodb.com/documentation/cartodb-js.html).

* [See it in action](http://inbo.github.io/bird-tracking/explorer/index.html)
* [Browse the code](explorer/)

## Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast

*Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast* is a species occurrence dataset published by the Research Institute for Nature and Forest (INBO) at http://dataset.inbo.be/bird-tracking-gull-occurrences.

### Data publication process

* [Metadata](metadata.md) (working document)
* [Darwin Core mapping (R) from the processed log files](src/dwc_occurrence.Rmd)
* [Darwin Core mapping (SQL) from CartoDB (DEPRECATED)](src/dwc_occurrence.sql)
* [Data specifications](specification/)
* [Known issues](https://github.com/LifeWatchINBO/data-publication/labels/bird-tracking-gull-occurrences)
* [Submit an issue](https://github.com/LifeWatchINBO/data-publication/issues/new) (please mention the dataset name)

### Data paper

> Stienen EWM, Desmet P, Aelterman B, Courtens W, Feys S, Vanermen N, Verstraete H, Van de walle M, Deneudt K, Hernandez F, Houthoofdt R, Vanhoorne B, Bouten W, Buijs RJ, Kavelaars MM, Müller W, Herman D, Matheve H, Sotillo A, Lens L (2016) GPS tracking data of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast. ZooKeys 555: 115–124. https://doi.org/10.3897/zookeys.555.6173

## Bird tracking - GPS tracking of Western Marsh Harriers breeding near the Belgium-Netherlands border

*Bird tracking - GPS tracking of Western Marsh Harriers breeding near the Belgium-Netherlands border* is a species occurrence dataset published by the Research Institute for Nature and Forest (INBO) at http://dataset.inbo.be/bird-tracking-wmh-occurrences.

### Data publication process

* [Metadata](metadata.md) (working document)
* Darwin Core mapping: see `bird-tracking-gull-occurrences`, it is [described there](../bird-tracking-gull-occurrences) and the same.
* [Data specifications](specification/)
* [Known issues](https://github.com/LifeWatchINBO/data-publication/labels/bird-tracking-wmh-occurrences)
* [Submit an issue](https://github.com/LifeWatchINBO/data-publication/issues/new) (please mention the dataset name)

