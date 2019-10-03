download_data <- function(sql_file, download_directory,
                          download_filename = "movebank", ring_numbers,
                          shared = FALSE, connection, overwrite = FALSE) {
  # Check input arguments
  if (!file.exists(sql_file)) {
    stop("No such sql_file: ", sql_file)
  }

  if (!file.exists(download_directory)) {
    stop("No such directory: ", download_directory)
  }

  # Set tables names (shared vs non-shared)
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
  acceleration_table <- if (shared) {
    "ee_shared_acceleration_limited"
  } else {
    "ee_acceleration_limited"
  }

  # Loop over ring_numbers
  for (ring_number in ring_numbers) {
    # Create file name
    data_file = file.path(download_directory, paste0(download_filename, "_", ring_number, ".csv"))

    # Query and download data
    if (file.exists(data_file) && !overwrite) {
      print(paste(ring_number, ": ", data_file, "already exists, skipping download"))
    } else {
      print(paste(ring_number, ": downloading data"))
      data_sql <- glue_sql(read_file(sql_file), .con = connection)
      tryCatch({
        data <- dbGetQuery(connection, data_sql)
        write_csv(data, path = data_file, na = "")
      }, error = function(e) {
        stop(e)
      })
    }
  }
}
