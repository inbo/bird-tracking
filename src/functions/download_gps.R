download_gps <- function(sql_file, download_directory, ring_numbers,
                         shared = FALSE, connection, overwrite = FALSE) {
  # Check input arguments
  if (!file.exists(sql_file)) {
    stop("No such sql_file: ", sql_file)
  }

  if (!file.exists(download_directory)) {
    stop("No such directory: ", download_directory)
  }

  # Set tables (shared vs non-shared)
  track_session_table <- if (shared) {
    "ee_shared_track_session_limited"
  } else {
    "ee_track_session_limited"
  }
  tracking_speed_table <- if (shared) {
    "ee_shared_tracking_speed_limited"
  } else {
    "ee_tracking_speed_limited"
  }

  # Loop over ring_numbers
  for (ring_number in ring_numbers) {
    # Create file name
    detections_file = file.path(download_directory, paste0("movebank_gps_", ring_number, ".csv"))

    # Query and download data
    if (file.exists(detections_file) && !overwrite) {
      print(paste(ring_number, ": ", detections_file, "already exists, skipping download"))
    } else {
      print(paste(ring_number, ": downloading data"))
      gps_sql <- glue_sql(read_file(sql_file), .con = connection)
      detections <- tryCatch({
        dbGetQuery(con, gps_sql)
      }, error = function(e) {
        return(NA)
      })

      if (nrow(detections) != 0 && is.na(detections)) {
        # detections = NA will be the case if there was an error in SQL conn.
        # break loop and don't write to file
        break
      } else {
        write_csv(detections, path = detections_file, na = "")
      }
    }
  }
}
