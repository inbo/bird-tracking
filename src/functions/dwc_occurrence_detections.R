dwc_occurrence_detections <- function(individual_detections, metadata) {
  require(dplyr)

  input_colnames <- colnames(individual_detections)

  occ <- individual_detections %>% mutate(
    occurrenceID = "",

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
  )

  occ <- occ %>% select(-one_of(input_colnames))

  return(occ)
}
