# Bird tracking

This repository contains the functionality to **standardize bird tracking data** from the LifeWatch [GPS tracking network for large birds](http://lifewatch.be/en/gps-tracking-network-large-birds) so these can be published on [Movebank](https://www.movebank.org/), [Zenodo](https://zenodo.org), [GBIF](https://www.gbif.org) and [OBIS](https://obis.org). For reusable functions, see the [movepub](https://inbo.github.io/movepub) R package.

## Datasets

Title | System | Started | Ended | Movebank | Zenodo | GBIF | OBIS
--- | --- | --- | --- | --- | --- | --- | ---
BOP_RODENT - Rodent specialized birds of prey (Circus, Asio, Buteo) in Flanders (Belgium) | Ornitela | 2020 | active | [1278021460](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1278021460) | [DOI](https://doi.org/10.5281/zenodo.5735405) | [GBIF](https://www.gbif.org/dataset/e2fb42ca-e408-4aa2-a7bd-a9bb4ddcc83a) | NA
CURLEW_VLAANDEREN - Eurasian curlews (Numenius arquata, Scolopacidae) breeding in Flanders (Belgium) | Ornitela | 2020 | active | [1841091905](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1841091905) | [DOI](https://doi.org/10.5281/zenodo.5779130) |  [GBIF](https://www.gbif.org/dataset/88216808-1942-44ed-b059-b576bf79a28e) | [OBIS](https://obis.org/dataset/7ee5747e-f7c5-44ad-9012-925dd60967aa)
DELTATRACK - Herring gulls (Larus argentatus, Laridae) and Lesser black-backed gulls (Larus fuscus, Laridae) breeding at Neeltje Jans (Netherlands) | Ornitela | 2020 | active | [1258895879](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1258895879) | [DOI](https://doi.org/10.5281/zenodo.10209520) | [GBIF](https://www.gbif.org/dataset/39ca385b-6f25-402c-aa92-a76c89ecda0a) | [OBIS](https://obis.org/dataset/9ca26a96-ff54-45f3-a423-7f6ab9f540ef)
H_GRONINGEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding in Groningen (the Netherlands) | UvA-BiTS | 2012 | 2018 | [922263102](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study922263102) | [DOI](https://doi.org/10.5281/zenodo.3552507) | [GBIF](https://www.gbif.org/dataset/5124534e-2d9c-46b7-a857-e0012821526b) | NA
HG_JUVENILE - Juvenile herring gulls (Larus argentatus, Laridae) hatched at the southern North Sea coast (Belgium) | Interrex | 2022 | active | [2217728245](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study2217728245)
HG_OOSTENDE - Herring gulls (Larus argentatus, Laridae) breeding at the southern North Sea coast (Belgium) | UvA-BiTS | 2013 | active | [986040562](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study986040562) | [DOI](https://doi.org/10.5281/zenodo.3541811) | [GBIF](https://www.gbif.org/dataset/6c860eb3-83ba-48c3-9328-a7b3c7a3c7b4) | [OBIS](https://obis.org/dataset/00cad65a-aa33-4d98-93a2-15155fa963e3)
LBBG_ADULT - Lesser black-backed gulls (Larus fuscus, Laridae) breeding in Belgium | Ornitela | 2022 | active | [2298738353](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study2298738353) | [DOI](https://doi.org/10.5281/zenodo.10055493) | [GBIF](https://www.gbif.org/dataset/df50c722-070a-4c6a-a260-3a186ce72fe1) | [OBIS](https://obis.org/dataset/6639fa5b-1d59-48fd-a53b-59a3e823fa6f)
LBBG_JUVENILE - Juvenile lesser black-backed gulls (Larus fuscus, Laridae) hatched in Zeebrugge (Belgium) | Ornitela | 2020 | active | [1259686571](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1259686571) | [DOI](https://doi.org/10.5281/zenodo.5075868) | [GBIF](https://www.gbif.org/dataset/83de99ee-92bd-4dc2-a038-a4856f13cd29) | [OBIS](https://obis.org/dataset/a8c7c2d3-533a-4b8f-aff8-a43b8f280a7b)
LBBG_ZEEBRUGGE - Lesser black-backed gulls (Larus fuscus, Laridae) breeding at the southern North Sea coast (Belgium and the Netherlands) | UvA-BiTS | 2013 | active | [985143423](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study985143423) | [DOI](https://doi.org/10.5281/zenodo.3540799) | [GBIF](https://www.gbif.org/dataset/355b8ff9-7bd9-49c3-92af-f6741b8bd0cb) | [OBIS](https://obis.org/dataset/aac5ca81-638a-4335-9aa7-5c2bda67a362)
MEDGULL_ANTWERPEN - Mediterranean gulls (Ichthyaetus melanocephalus, Laridae) breeding near Antwerp (Belgium) | Ornitela | 2021 | active | [1609400843](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1609400843) | [DOI](https://doi.org/10.5281/zenodo.6599272) | [GBIF](https://www.gbif.org/dataset/ebce3c1f-4307-4539-afb2-3876ec9ae737) | [OBIS](https://obis.org/dataset/cd6933a8-797e-41f4-94f0-fcd969b6794e)
MH_ANTWERPEN - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near Antwerp (Belgium) | UvA-BiTS | 2018 | active | [938783961](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study938783961) | [DOI](https://doi.org/10.5281/zenodo.3550093) | [GBIF](https://www.gbif.org/dataset/e347ea47-db3f-4c47-8771-ea562330382c) | NA
MH_WATERLAND - Western marsh harriers (Circus aeruginosus, Accipitridae) breeding near the Belgium-Netherlands border | UvA-BiTS | 2013 | 2018 | [604806671](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study604806671) | [DOI](https://doi.org/10.5281/zenodo.3532940) | [GBIF](https://www.gbif.org/dataset/66e0553e-75f6-49de-b614-22efd9fbf6e9) | NA
O_AMELAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding on Ameland (the Netherlands) | UvA-BiTS | 2010 | 2013 | [1605803389](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605803389) | [DOI](https://doi.org/10.5281/zenodo.5647596) | [GBIF](https://www.gbif.org/dataset/a700359e-a4fa-47d2-9bca-0b8500528cea) | [OBIS](https://obis.org/dataset/3b1da04e-7b8d-4080-ba17-d29909d6d95b)
O_ASSEN - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding in Assen (the Netherlands) | UvA-BiTS | 2018 | 2019 | [1605797471](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605797471) | [DOI](https://doi.org/10.5281/zenodo.5653310) | [GBIF](https://www.gbif.org/dataset/226421f2-1d29-4950-901c-aba9d0e8f2bc) | [OBIS](https://obis.org/dataset/550b4cc1-c40d-4070-a0cb-26e010eca9d4)
O_BALGZAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) wintering on Balgzand (the Netherlands) | UvA-BiTS | 2010 | 2014 | [1605798640](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605798640) | [DOI](https://doi.org/10.5281/zenodo.5653441) | [GBIF](https://www.gbif.org/dataset/833c03c5-fc23-4e77-8689-4e97fcce96f0) | [OBIS](https://obis.org/dataset/2c6aa97e-e886-4564-a55a-48e2e506f014)
O_SCHIERMONNIKOOG - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding on Schiermonnikoog (the Netherlands) | UvA-BiTS | 2008 | 2014 | [1605799506](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605799506) | [DOI](https://doi.org/10.5281/zenodo.5653477) | [GBIF](https://www.gbif.org/dataset/361adb42-c1ea-46ed-979c-281ef027cf8f) | [OBIS](https://obis.org/dataset/01dbc62a-e166-4752-8547-6db4542ec039)
O_VLIELAND - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding and wintering on Vlieland (the Netherlands) | UvA-BiTS | 2016 | 2021 | [1605802367](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1605802367) | [DOI](https://doi.org/10.5281/zenodo.5653890) | [GBIF](https://www.gbif.org/dataset/cd15902d-3ded-41c2-893d-8840e146cbb3) | [OBIS](https://obis.org/dataset/c633b0f8-90bb-43f2-8680-65ac26dd8400)
O_WESTERSCHELDE - Eurasian oystercatchers (Haematopus ostralegus, Haematopodidae) breeding in East Flanders (Belgium) | UvA-BiTS | 2018 | 2020 | [1099562810](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study1099562810) | [DOI](https://doi.org/10.5281/zenodo.3734898) | [GBIF](https://www.gbif.org/dataset/20bbd36e-d1a1-4169-8663-59feaa2641c0) | [OBIS](https://obis.org/dataset/132cfd6e-097d-4ee4-b737-58a596dcbe27)
SPOONBILL_VLAANDEREN - Eurasian spoonbills (Platalea leucorodia, Threskiornithidae) in Flanders (Belgium) | Ornitela | 2022 | active | [2313947453](https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study2313947453) | [DOI](https://doi.org/10.5281/zenodo.10055132) | [GBIF](https://www.gbif.org/dataset/6850e626-46fd-4843-a391-2c06b069a940) | [OBIS](https://obis.org/dataset/6c77ad5e-e635-4c2a-b389-e11676f20137)

Steps to upload data to Zenodo are described [here](https://github.com/inbo/bird-tracking/issues/131).

Before we adopted the workflow to publish on Movebank and Zenodo, two datasets were published on GBIF as source datasets (https://doi.org/10.15468/02omly and https://doi.org/10.15468/rbguhj). Those have since been deleted, since these are better represented by the datasets listed above (`HG_OOSTENDE`, `LBBG_ZEEBRUGGE` and `MH_WATERLAND`).

## Workflow

- [Prepare Uva-BiTS (meta)data for Movebank upload](src/uvabits_to_movebank.Rmd)
- [Prepare Ornitela (meta)data for Movebank upload](src/ornitela_to_movebank.Rmd)
- [Prepare Interrex (meta)data for Movebank upload](src/interrex_to_movebank.Rmd)
- [Prepare Movebank data for Zenodo upload (make frictionless)](src/movebank_to_frictionless.Rmd)

## Repo structure

The repository structure is based on [Cookiecutter Data Science](http://drivendata.github.io/cookiecutter-data-science/). Files and directories indicated with `GENERATED` should not be edited manually, those with `IGNORED` are ignored by git and will not appear on GitHub.

```
├── README.md           : Description of this repository
├── LICENSE             : Repository license
├── bird-tracking.Rproj : RStudio project file
├── .gitignore          : Files and directories to be ignored by git
│
├── src                 : Scripts to process tracking data for Movebank
│   └── functions       : Custom functions used in scripts
|
├── sql                 : Queries to transform tracking data to Movebank format
│
└── data
    └── processed       : Data that can be uploaded to Movebank GENERATED, large files IGNORED
```

The repository used to include SQL and CSS for [CartoDB maps](https://oscibio.inbo.be/blog/?category=cartodb) and the source code for a [bird tracking explorer](https://oscibio.inbo.be/blog/bird-tracking-explorer/). These are accessible in the [version history](https://github.com/inbo/bird-tracking/tree/carto) of this repository.

## Contributors

[List of contributors](https://github.com/inbo/bird-tracking/contributors)

## License

[MIT License](LICENSE)
