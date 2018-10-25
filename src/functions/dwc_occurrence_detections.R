dwc_occurrence_detections <- function(data, metadata) {
  require(dplyr)

  # Add quality issue flag
  data <- data %>% mutate(
    quality_issue = case_when(
      speed_2d < 0 ~ TRUE,
      speed_2d > 33.33333 ~ TRUE,
      altitude > 10000 ~ TRUE,
      h_accuracy > 1000 ~ TRUE,
      date_time > Sys.Date() ~ TRUE,
      TRUE ~ FALSE
    )
  )

  # Save original column names
  input_colnames <- colnames(data)

  # Map to Darwin Core
  occ <- data %>% mutate(
    occurrenceID = paste(
      "urn",
      "catalog",
      metadata$institutionCode,
      metadata$collectionCode,
      ring_number,
      format(date_time, "%Y%m%d%H%M%S"),
      sep = ":"
    ),

    type = "Event",
    language = "en",
    license = metadata$license,
    rightsHolder = metadata$rightsHolder,
    accessRights = metadata$accessRights,
    datasetID = metadata$datasetID,
    institutionCode = metadata$institutionCode,
    collecionCode = metadata$collectionCode,
    datasetName = metadata$datasetName,
    basisOfRecord = "MachineObservation",
    informationWithheld = metadata$informationWithheld,
    # dynamicProperties

    # sex
    # lifeStage

    occurrenceStatus = case_when(
      quality_issue ~ "doubtful",
      TRUE ~ "present"
    ),
    occurrenceRemarks = case_when(
      quality_issue ~ "record flagged as doubtful",
      TRUE ~ ""
    ),

    organismID = ring_number,
    organismName = remarks_individual,

    samplingProtocol = "https://doi.org/10.1007/s10336-012-0908-1",
    # samplingEffort
    eventDate = format(date_time,"%Y-%m-%dT%H:%M:%SZ"),

    minimumElevationInMeters = 0,
    maximumElevationInMeters = 0,
    minimumDistanceAboveSurfaceInMeters = altitude,
    maximumDistanceAboveSurfaceInMeters = altitude,

    decimalLatitude = sprintf("%.7f", round(latitude, digits = 7)),
    decimalLongitude = sprintf("%.7f", round(longitude, digits = 7)),
    geodeticDatum = "EPSG:4326",
    coordinateUncertaintyInMeters = case_when(
      !is.na(h_accuracy) ~ h_accuracy,
      TRUE ~ 30
    ),
    georeferenceSources = "GPS",

    scientificName = species_latin_name,
    kingdom = "Animalia",
    taxonRank = "species",
    vernacularName = english_name
  )

  # Remove original columns
  occ <- occ %>% select(-one_of(input_colnames))

  # Sort by occurrenceID
  occ <- occ %>% arrange(occurrenceID)

  return(occ)
}
