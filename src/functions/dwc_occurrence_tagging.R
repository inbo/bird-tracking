dwc_tagging_detections <- function(individuals_and_track_sessions, metadata) {
  require(dplyr)

  # Save original column names
  input_colnames <- colnames(individuals_and_track_sessions)

  # Map to Darwin Core
  occ <- individuals_and_track_sessions %>% mutate(
    occurrenceID = paste("urn", "catalog", metadata$institutionCode, metadata$collectionCode, ring_number, format(date_time, "%Y%m%d%H%M%S"), sep = ":"),

    type = "Event",
    language = "en",
    license = metadata$license,
    rightsHolder = metadata$rightsHolder,
    accessRights = metadata$accessRights,
    datasetID = metadata$datasetID,
    institutionCode = metadata$institutionCode,
    collecionCode = metadata$collectionCode,
    datasetName = metadata$datasetName,
    basisOfRecord = "HumanObservation",
    informationWithheld = metadata$informationWithheld,
    # dynamicProperties

    sex = recode(individual_sex,
      "M" = "male",
      "F" = "female",
      .default = "unknown",
      .missing = "unknown"
    ),
    lifeStage = "adult",

    occurrenceStatus = "present",
    # occurrenceRemarks

    organismID = ring_number,
    organismName = remarks_individual,

    samplingProtocol = "https://doi.org/10.1007/s10336-012-0908-1",
    # samplingEffort
    eventDate = format(track_session_start_date,"%Y-%m-%dT%H:%M:%SZ"),

    # minimumElevationInMeters
    # maximumElevationInMeters
    # minimumDistanceAboveSurfaceInMeters
    # maximumDistanceAboveSurfaceInMeters

    decimalLatitude = sprintf("%.7f", round(start_latitude, digits = 7)),
    decimalLongitude = sprintf("%.7f", round(start_longitude, digits = 7)),
    geodeticDatum = "EPSG:4326",
    coordinateUncertaintyInMeters = 30,
    georeferenceSources = "GPS",

    scientificName = species_latin_name,
    kingdom = "Animalia",
    taxonRank = "species",
    vernacularName = english_name
  )

  occ <- occ %>% select(-one_of(input_colnames))

  return(occ)
}
