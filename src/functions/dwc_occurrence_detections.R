dwc_occurrence_detections <- function(individual_detections, metadata) {
  require(dplyr)

  # Add quality issue flag
  individual_detections <- individual_detections %>% mutate(
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
  input_colnames <- colnames(individual_detections)

  # Map to Darwin Core
  occ <- individual_detections %>% mutate(
    occurrenceID = paste("urn", "catalog", metadata$institutionCode, metadata$collectionCode, ring_number, format(date_time, "%Y%m%d%H%M%S"), sep = ":"),

    type = "Event",
    language = "en",
    license = metadata$license,
    rightsHolder = metadata$rightsHolder,
    accessRights = metadata$accessRights,
    datasetID = metadata$datasetID,
    institutionCode = metadata$institutionCode,
    datasetName = metadata$datasetName,
    basisOfRecord = "MachineObservation",
    informationWithheld = metadata$informationWithheld,
    # dynamicProperties

    # sex
    occurrenceStatus = case_when(
      quality_issue ~ "doubtful",
      TRUE ~ "present"
    ),
    occurrenceRemarks = case_when(
      quality_issue ~ "record flagged as doubtful",
      TRUE ~ ""
    ),

  )

  occ <- occ %>% select(-one_of(input_colnames))

  return(occ)
}
