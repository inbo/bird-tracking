# Bird tracking

This repository contains the functionality to standardize data from the LifeWatch [GPS tracking network for large birds](http://lifewatch.be/en/gps-tracking-network-large-birds) so these can be published on [Movebank](https://www.movebank.org/).

## Workflow

GPS trackers → [UvA-BiTS](http://www.uva-bits.nl/) database → [Script](src/movebank.Rmd) to query data in the [Movebank data format](https://www.movebank.org/node/2381) (defined in [SQL](sql)) → Generated files that can be uploaded to Movebank

## Published datasets

### Movebank

- [HG_OOSTENDE](https://www.movebank.org/panel_embedded_movebank_webapp?gwt_fragment=page=studies,path=study986040562) - Herring gulls (Larus argentatus, Laridae) breeding at the southern North Sea coast (Belgium)
- [LBBG_ZEEBRUGGE](https://www.movebank.org/panel_embedded_movebank_webapp?gwt_fragment=page=studies,path=study985143423) - Lesser black-backed gulls (Larus fuscus, Laridae) breeding at the southern North Sea coast (Belgium and the Netherlands)
- [MH_WATERLAND](https://www.movebank.org/panel_embedded_movebank_webapp?gwt_fragment=page=studies,path=study604806671) - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near the Belgium-Netherlands border
- [MH_ANTWERPEN](https://www.movebank.org/panel_embedded_movebank_webapp?gwt_fragment=page=studies,path=study938783961) - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding at Linkeroever (Belgium)
- [H_GRONINGEN](https://www.movebank.org/panel_embedded_movebank_webapp?gwt_fragment=page=studies,path=study922263102) - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding in Groningen (the Netherlands)

### GBIF

- [Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast](https://doi.org/10.15468/02omly) (subset of `HG_OOSTENDE` and `LBBG_ZEEBRUGGE` and described in [Stienen et al. 2016](https://doi.org/10.3897/zookeys.555.6173))
- [Bird tracking - GPS tracking of Western Marsh Harriers breeding near the Belgium-Netherlands border](https://doi.org/10.15468/rbguhj) (subset of `MH_WATERLAND`)

## Repo structure

The repository structure is based on [Cookiecutter Data Science](http://drivendata.github.io/cookiecutter-data-science/). Files and directories indicated with `GENERATED` should not be edited manually, those with `IGNORED` are ignored by git and will not appear on GitHub, and those with `DEPRECATED` are no longer maintained.

```
├── README.md           : Description of this repository
├── LICENSE             : Repository license
├── bird-tracking.Rproj : RStudio project file
├── .gitignore          : Files and directories to be ignored by git
│
├── cartodb             : Documentation for gps tracking data on CartoDB, see
|                         https://inbo.carto.com/u/lifewatch/ DEPRECATED
|
├── explorer            : Source code for an online exploratory tool, see 
|                         https://oscibio.inbo.be/blog/bird-tracking-explorer/ DEPRECATED
|
├── src
│   ├── individuals.Rmd : Script to get information on individuals
│   └── movebank.Rmd    : Script to get data for a specific project in Movebank format
│
├── sql
│   ├── individuals.sql : Query to get individuals and tracking sessions
│   ├── movebank_ref.sql: Query to get reference data in Movebank format
│   ├── movebank_gps.sql: Query to get gps data in Movebank format
│   └── movebank_acc.sql: Query to get acceleration data in Movebank format
│
└── data
    ├── interim         : Intermediate data GENERATED
    └── processed       : Data that can be uploaded to Movebank GENERATED IGNORED
```

## Contributors

[List of contributors](https://github.com/inbo/bird-tracking/contributors)

## License

[MIT License](LICENSE)
