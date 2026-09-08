get_reference_data <- function(project_id) {
  # Define spreadsheet URLs
  urls <- list(
    "Ornitela" = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU838D5jOOcPSyL21iheYdC1hEwYaR88x9qhJNLOZtmaTuK6hv23Vpz-o1b5erXur4Vw2g9Z2mQchh/pub?gid=0&single=true&output=csv",
    "Interrex" = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU838D5jOOcPSyL21iheYdC1hEwYaR88x9qhJNLOZtmaTuK6hv23Vpz-o1b5erXur4Vw2g9Z2mQchh/pub?gid=668940&single=true&output=csv",
    "Druid" = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU838D5jOOcPSyL21iheYdC1hEwYaR88x9qhJNLOZtmaTuK6hv23Vpz-o1b5erXur4Vw2g9Z2mQchh/pub?gid=2022063817&single=true&output=csv",
    "Global Messenger" = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSU838D5jOOcPSyL21iheYdC1hEwYaR88x9qhJNLOZtmaTuK6hv23Vpz-o1b5erXur4Vw2g9Z2mQchh/pub?gid=1432656981&single=true&output=csv"
  )

  # Combine spreadsheets
  read_tab <- function(url) {
    readr::read_csv(url, col_types = readr::cols(.default = readr::col_character()))
  }
  metadata <-
    urls |>
    purrr::map(read_tab) |>
    dplyr::bind_rows(.id = "tag_manufacturer")

  # Map data
  movebank_ref_data <-
   metadata |>
   dplyr::filter(project == project_id) |>
   dplyr::mutate(
     `animal-id` = dplyr::coalesce(metal_ring, colour_ring),
     `animal-nickname` = dplyr::case_when(
       str_detect(animal_name, "OT-") ~ NA_character_, # Exclude names that are the default tag name
       TRUE ~ animal_name
     ),
     `animal-ring-id` = ifelse(tag_manufacturer %in% c("Druid", "Global Messenger"), metal_ring, colour_ring),
     `animal-sex` = dplyr::recode(sex,
       "F" = "f",
       "M" = "m",
       "X" = "u",
       .missing = "u"
     ),
     `animal-taxon` = scientific_name,
     `alt-project-id` = project_id,
     `animal-life-stage` = dplyr::recode(age,
       "A" = "adult",
       "J" = "juvenile"
     ),
     `animal-mass` = animal_weight,
     `animal-mortality-type` = mortality_type,
     `animal-mortality-date` = dplyr::if_else(
       !is.na(mortality_type),
       format(
         as.POSIXct(track_session_end_date, tz = "UTC", format = "%Y-%m-%d %H:%M:%S"),
         "%Y-%m-%dT%H:%M:%SZ"
       ),
       NA_character_
     ),
     `animal-death-comments` =
       dplyr::if_else(!is.na(mortality_type), track_session_remarks, NA_character_),
     `attachment-type` = "harness",
     `deploy-off-timestamp` = format(
       as.POSIXct(track_session_end_date, tz = "UTC", format = "%Y-%m-%d %H:%M:%S"),
       "%Y-%m-%dT%H:%M:%SZ"
     ),
     `deploy-on-latitude` = release_latitude,
     `deploy-on-longitude` = release_longitude,
     `deploy-on-measurements` = animal_measurements,
     `deploy-on-timestamp` = format(
       as.POSIXct(track_session_start_date, tz = "UTC", format = "%Y-%m-%d %H:%M:%S"),
       "%Y-%m-%dT%H:%M:%SZ"
     ),
     `deployment-comments` = track_session_remarks,
     `deployment-end-type` = dplyr::case_when(
       stringr::str_detect(tolower(track_session_remarks), "dead") ~ "dead",
       stringr::str_detect(tolower(track_session_remarks), "died") ~ "dead",
       stringr::str_detect(tolower(track_session_remarks), "predated") ~ "dead",
       stringr::str_detect(tolower(track_session_remarks), "victim") ~ "dead",
       stringr::str_detect(tolower(track_session_remarks), "defect") ~ "equipment failure",
       stringr::str_detect(tolower(track_session_remarks), "malfunction") ~ "equipment failure",
       TRUE ~ NA_character_
     ),
     `manipulation-type` = dplyr::case_when(
       stringr::str_detect(manipulation_type, "manipulated other") ~ "manipulated other",
       # Birds that were hatched from egg or raised as chicks
       # e.g. placed in controlled environment and subjected to behavioural studies
       TRUE ~ "none"
     ),
     `study-site` = release_location,
     `tag-readout-method` = ifelse(tag_manufacturer == "Druid", "Wi-Fi/Bluetooth", "phone network"),
     `sensor-type` = "GPS",
     `tag-id` = serial_number,
     `tag-manufacturer-name` = tag_manufacturer,
     `tag-mass` = tag_weight,
     `tag-serial-no` = serial_number,
     .keep = "none"
   ) |>
   dplyr::filter(!is.na(`animal-id`)) |>
   dplyr::arrange(`tag-id`, `animal-id`)

  # Select columns
  manufacturer <- unique(movebank_ref_data$`tag-manufacturer-name`)
  if (manufacturer == "Ornitela") {
    movebank_ref_data <-
      movebank_ref_data |>
      dplyr::select(
        - `animal-mortality-type`,
        - `animal-mortality-date`,
        - `animal-death-comments`,
        - `deploy-on-latitude`,
        - `deploy-on-longitude`
      )
  }
  if (manufacturer == "Druid") {
    movebank_ref_data <-
      movebank_ref_data |>
      dplyr::select(
        - `animal-mortality-type`,
        - `animal-mortality-date`,
        - `animal-death-comments`,
      )
  }

  return(movebank_ref_data)
}

