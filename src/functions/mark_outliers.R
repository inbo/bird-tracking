#' Returns the Movebank gps data with a column `import-marked-outlier` that has
#' `TRUE` if the speed between point `i` and `i-1` is above `max_speed`.
#' `max_runs` indicates how often this process is repeated: recalculating speed
#' after removing those already marked as outliers.
mark_outliers <- function(x, max_speed = 30, max_runs = 5) {
  outliers <- c()
  gps_speed <- x
  run <- 0

  if (nrow(x) > 0) {
    for (i in 1:max_runs) {
      run <- run + 1
      # Calculate speed (see function below)
      gps_speed <- calc_speed(gps_speed)

      # Record outliers: timestamps that have speed above max_speed
      new_outliers <- gps_speed %>% filter(speed > max_speed) %>% pull(timestamp)

      # Prepare next run if outliers have been found
      if (length(new_outliers) == 0) {
        break
      } else {
        outliers <- append(outliers, new_outliers)
        # Remove outliers from dataframe for next run
        gps_speed <- gps_speed %>% filter(!timestamp %in% outliers)
      }
    }
    message(paste(length(outliers), "outliers found using", run, "runs."))
  } else {
    message("No data.")
  }

  # Add import-marked-outlier column
  x <- x %>% mutate(`import-marked-outlier` = case_when(
    timestamp %in% outliers ~ TRUE,
    TRUE ~ FALSE
  ))
  return(x)
}

#' Returns gps data with column `speed`  in m/s between point `i` and `i-1`,
#' using the trip package.
calc_speed <- function(x, timestamp = "timestamp", lat = "location-lat",
                       lon = "location-long") {
  # Add datetime and stop function if not sorted
  x$datetime <- as_datetime(x[[timestamp]])
  stopifnot(x$datetime == arrange(x, datetime)$datetime)

  # Create matrix of long/lat
  trip_matrix <- data.matrix(x[, c(lon, lat)], rownames.force = NA)
  # Calculate distances between points with trip
  distances_between_points <- trip::trackDistance(trip_matrix, longlat = TRUE)

  # Add distance and time elapsed
  x$distance <- c(0, distances_between_points) # dist in km
  x$time_elapsed <- 0
  for (i in 2:nrow(x)) {
    x$time_elapsed[i] <- difftime(x$datetime[i], x$datetime[i-1], units = "secs")
  }

  # Add speed
  x$speed <- (x$distance * 1000) / x$time_elapsed # speed = dist/time in m/s

  # Remove unnecessary columns
  x <- select(x, -datetime, -distance, -time_elapsed)
  return(x)
}
