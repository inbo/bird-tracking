download_gps <- function(sql_file, download_directory,
                                device_info_serials, connection,
                                overwrite = FALSE) {
  # Check input arguments
  if (!file.exists(sql_file)) {
    stop("No such sql_file: ", sql_file)
  }

  if (!file.exists(download_directory)) {
    stop("No such directory: ", download_directory)
  }

  # Loop over device_info_serials
  for (device_info_serial in device_info_serials) {
    # Create file name
    detections_file = file.path(download_directory, paste0(device_info_serial, "_detections.csv"))

    # Query and download data
    if (file.exists(detections_file) && !overwrite) {
      print(paste(device_info_serial, ": ", detections_file, "already exists, skipping download"))
    } else {
      print(paste(device_info_serial, ": downloading data"))
      individuals_sql <- glue_sql(read_file(sql_file), .con = connection)
      detections <- tryCatch({
        dbGetQuery(con, individuals_sql)
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
