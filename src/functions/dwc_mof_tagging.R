dwc_mof_tagging <- function(data, metadata) {
  data <- individuals_and_track_sessions

  require(dplyr)

  # Add adult life stage for all individuals
  data <- data %>% mutate(
    life_stage = "adult"
  )

  # Clean values
  data <- data %>% mutate(
    individual_sex = recode(individual_sex,
      "M" = "male",
      "F" = "female",
      .default = "unknown",
      .missing = "unknown"
    ),
    colour_ring = recode(colour_ring,
      "none" = NA_character_
    )
  )

  # Gather data in type and values
  mof <- data %>% gather(
    type,
    value,
    individual_sex,
    life_stage,
    mass,
    colour_ring,
    device_info_serial,
    na.rm = TRUE,
    convert = FALSE
  )

  # Save original column names
  # Has to be done after gathering, as that process will already remove columns
  input_colnames <- colnames(mof)

  # Map to Darwin Core
  mof <- mof %>% mutate(
    occurrenceID = paste(
      "urn",
      "catalog",
      metadata$institutionCode,
      metadata$collectionCode,
      ring_number,
      format(track_session_start_date, "%Y%m%d%H%M%S"),
      sep = ":"
    ),
    measurementType = recode(type,
      "individual_sex" = "sex",
      "life_stage" = "life stage",
      "mass" = "weight",
      "colour_ring" = "colour ring",
      "device_info_serial" = "device serial number",
      .default = NA_character_,
      .missing = NA_character_
    ),
    measurementTypeID = recode(type,
      "individual_sex" = "http://vocab.nerc.ac.uk/collection/P01/current/ENTSEX01/",
      "life_stage" = "http://vocab.nerc.ac.uk/collection/P01/current/LSTAGE01/",
      "mass" = "http://vocab.nerc.ac.uk/collection/P01/current/SPWGXX01/",
      "colour_ring" = NA_character_,
      "device_info_serial" = NA_character_,
      .default = NA_character_,
      .missing = NA_character_
    ),
    measurementValue = as.character(value),
    measurementUnit = recode(type,
      "individual_sex" = NA_character_,
      "life_stage" = NA_character_,
      "mass" = "g",
      "colour_ring" = NA_character_,
      "device_info_serial" = NA_character_,
      .default = NA_character_,
      .missing = NA_character_
    ),
    measurementMethod = recode(type,
      "individual_sex" = NA_character_,
      "life_stage" = NA_character_,
      "mass" = NA_character_,
      "colour_ring" = NA_character_,
      "device_info_serial" = NA_character_,
      .default = NA_character_,
      .missing = NA_character_
    ),
    measurementDeterminedDate = format(track_session_start_date,"%Y-%m-%dT%H:%M:%SZ")
  )

  # Remove original columns
  mof <- mof %>% select(-one_of(input_colnames))

  # Remove records without a measurementType (in case of oversight in recode)
  mof <- mof %>% filter(!is.na(measurementType))

  # Sort by occurrenceID
  mof <- mof %>% arrange(occurrenceID)

  return(mof)
}
