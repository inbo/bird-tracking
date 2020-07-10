# Bird tracking

This repository contains the functionality to standardize data from the LifeWatch [GPS tracking network for large birds](http://lifewatch.be/en/gps-tracking-network-large-birds) so these can be published on [Movebank](https://www.movebank.org/).

## Workflow

GPS trackers → [UvA-BiTS](http://www.uva-bits.nl/) database → [Script](src/movebank.Rmd) to query data in the [Movebank data format](https://www.movebank.org/node/2381) (defined in [SQL](sql)) → Generated files that can be uploaded to Movebank

## Published datasets

### Movebank & Zenodo

Title | Movebank | Zenodo | Status
--- | --- | --- | ---
HG_OOSTENDE - Herring gulls (Larus argentatus, Laridae) breeding at the southern North Sea coast (Belgium) | [986040562](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study986040562) | https://doi.org/10.5281/zenodo.3541811 | active
LBBG_ZEEBRUGGE - Lesser black-backed gulls (Larus fuscus, Laridae) breeding at the southern North Sea coast (Belgium and the Netherlands) | [985143423](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study985143423) | https://doi.org/10.5281/zenodo.3540799 | active
MH_WATERLAND - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near the Belgium-Netherlands border | [604806671](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study604806671) | https://doi.org/10.5281/zenodo.3532940 | stopped in 2018, described in [Milotic et al. 2020](https://doi.org/10.3897/zookeys.947.52570) 
MH_ANTWERPEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near Antwerp (Belgium) | [938783961](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study938783961) | https://doi.org/10.5281/zenodo.3550093 | active, described in [Milotic et al. 2020](https://doi.org/10.3897/zookeys.947.52570) 
H_GRONINGEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding in Groningen (the Netherlands) | [922263102](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study922263102) | https://doi.org/10.5281/zenodo.3552507 | stopped in 2018, described in [Milotic et al. 2020](https://doi.org/10.3897/zookeys.947.52570) 
O_WESTERSCHELDE - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding in East Flanders (Belgium) | [1099562810](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1099562810) | https://doi.org/10.5281/zenodo.3734898 | active

Steps to upload data to Zenodo are described [here](https://github.com/inbo/bird-tracking/issues/131).

### GBIF

Title | GBIF | Remark
--- | --- | ---
Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast | https://doi.org/10.15468/02omly | Subset of `HG_OOSTENDE` and `LBBG_ZEEBRUGGE`, described in [Stienen et al. 2016](https://doi.org/10.3897/zookeys.555.6173)
Bird tracking - GPS tracking of Western Marsh Harriers breeding near the Belgium-Netherlands border | https://doi.org/10.15468/rbguhj | Subset of `MH_WATERLAND`

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
│   ├── functions:      : Cutsom functions used in scripts
│   ├── individuals.Rmd : Script to get information on individuals
│   ├── movebank.Rmd    : Script to get data for a specific project in Movebank format
│   └── outliers.Rmd    : Script to mark outliers based on high speeds
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
