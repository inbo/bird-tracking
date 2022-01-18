# Bird tracking

This repository contains the functionality to standardize data from the LifeWatch [GPS tracking network for large birds](http://lifewatch.be/en/gps-tracking-network-large-birds) so these can be published on [Movebank](https://www.movebank.org/).

## Datasets

### Movebank & Zenodo

Title | System | Started | Ended | Movebank | Zenodo
--- | --- | --- | --- | --- | ---
BOP_RODENT - Rodent specialized birds of prey (Circus, Asio, Buteo) in Flanders (Belgium) | Ornitela | 2020 | active | [1278021460](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1278021460) | [DOI](https://doi.org/10.5281/zenodo.5735405)
CURLEW_VLAANDEREN - Eurasian curlews (Numenius arquata, Scolopacidae) breeding in Flanders (Belgium) | Ornitela | 2020 | active | [1841091905](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1841091905) | [DOI](https://doi.org/10.5281/zenodo.5779130)
DELTATRACK - Herring gulls (Larus argentatus, Laridae) and Lesser black-backed gulls (Larus fuscus, Laridae) breeding at Neeltje Jans (Netherlands) | Ornitela | 2020 | active | [1258895879](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1258895879) | 
H_GRONINGEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding in Groningen (the Netherlands) | UvA-BiTS | 2012 | 2018 | [922263102](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study922263102) | [DOI](https://doi.org/10.5281/zenodo.3552507)
HG_OOSTENDE - Herring gulls (Larus argentatus, Laridae) breeding at the southern North Sea coast (Belgium) | UvA-BiTS | 2013 | active | [986040562](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study986040562) | [DOI](https://doi.org/10.5281/zenodo.3541811)
LBBG_JUVENILE - Juvenile lesser black-backed gulls (Larus fuscus, Laridae) hatched in Zeebrugge (Belgium) | Ornitela | 2020 | active | [1259686571](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1259686571) | [DOI](https://doi.org/10.5281/zenodo.5075868)
LBBG_ZEEBRUGGE - Lesser black-backed gulls (Larus fuscus, Laridae) breeding at the southern North Sea coast (Belgium and the Netherlands) | UvA-BiTS | 2013 | active | [985143423](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study985143423) | [DOI](https://doi.org/10.5281/zenodo.3540799)
MH_ANTWERPEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near Antwerp (Belgium) | UvA-BiTS | 2018 | active | [938783961](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study938783961) | [DOI](https://doi.org/10.5281/zenodo.3550093)
MEDGULL_ANTWERPEN - Mediterranean gulls (Ichthyaetus melanocephalus, Laridae) breeding near Antwerp (Belgium) | Ornitela | 2021 | active | [1609400843](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1609400843) |
MH_WATERLAND - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near the Belgium-Netherlands border | UvA-BiTS | 2013 | 2018 | [604806671](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study604806671) | [DOI](https://doi.org/10.5281/zenodo.3532940)
O_AMELAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding on Ameland (the Netherlands) | UvA-BiTS | 2010 | 2013 | [1605803389](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605803389) | [DOI](https://doi.org/10.5281/zenodo.5647596)
O_ASSEN - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding in Assen (the Netherlands) | UvA-BiTS | 2018 | 2019 | [1605797471](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605797471) |
O_BALGZAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) wintering on Balgzand (the Netherlands) | UvA-BiTS | 2010 | 2014 | [1605798640](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605798640) |
O_SCHIERMONNIKOOG - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding on Schiermonnikoog (the Netherlands) | UvA-BiTS | 2008 | 2014 | [1605799506](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605799506) |
O_VLIELAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding and wintering on Vlieland (the Netherlands) | UvA-BiTS | 2016 | 2021 | [1605802367](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605802367) |
O_WESTERSCHELDE - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding in East Flanders (Belgium) | UvA-BiTS | 2018 | active | [1099562810](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1099562810) | [DOI](https://doi.org/10.5281/zenodo.3734898)

Steps to upload data to Zenodo are described [here](https://github.com/inbo/bird-tracking/issues/131).

### GBIF

Title | Remark | GBIF
--- | --- | ---
Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast | Subset of `HG_OOSTENDE` and `LBBG_ZEEBRUGGE`, described in [Stienen et al. 2016](https://doi.org/10.3897/zookeys.555.6173) | [DOI](https://doi.org/10.15468/02omly)
Bird tracking - GPS tracking of Western Marsh Harriers breeding near the Belgium-Netherlands border | Subset of `MH_WATERLAND` | [DOI](https://doi.org/10.15468/rbguhj)

## Workflow

### UvA-BiTS

- **Reference data**: [UvA-BiTS](http://www.uva-bits.nl/) database → [Script](src/movebank_uvabits.Rmd) to query data in the [Movebank data format](https://www.movebank.org/node/2381) (defined in [SQL](sql)) → Generated file that can be uploaded to Movebank
- **GPS data**: same as reference data
- **Accerelation data**: same as reference data

### Ornitela

- **Reference data**: Spreadsheet → [Script](src/movebank_ornitela.Rmd) to query  data in the [Movebank data format](https://www.movebank.org/node/2381) (defined as `dplyr::mutate()`) → Generated file that can be uploaded to Movebank
- **GPS data**: [Ornitela](https://www.ornitela.com/) database → Live feed to Movebank by associating a selection of tags to a study
- **Acceleration data**: not yet defined

### Zenodo

1. Download reference data from Movebank, as well as GPS and acceleration data per year.
2. Create `datapackage.json` file using [script](src/movebank_frictionless.Rmd).
3. Deposit on Zenodo and document with metadata.

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
│   ├── functions       : Custom functions used in scripts
│   ├── movebank_ornitela.Rmd : Script to get data for a specific Ornitela project in Movebank format
│   ├── movebank_uvabits.Rmd : Script to get data for a specific UvA-BiTS project in Movebank format
│   └── outliers.Rmd    : Script to mark outliers based on high speeds
│
├── sql
│   ├── movebank_ref.sql: Query to get reference data in Movebank format
│   ├── movebank_gps.sql: Query to get gps data in Movebank format
│   └── movebank_acc.sql: Query to get acceleration data in Movebank format
│
└── data
    └── processed       : Data that can be uploaded to Movebank GENERATED, large files IGNORED
```

## Contributors

[List of contributors](https://github.com/inbo/bird-tracking/contributors)

## License

[MIT License](LICENSE)
