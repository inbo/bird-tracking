#' Returns the Movebank gps data with a column `import-marked-outlier` that has
#' `TRUE` if between point `i` and `i-1` has a very high speed (`max_speed`) or
#' a sharp angle when going at a high speed (`min_angle_above_speed`).
#' `max_runs` indicates how often this process is repeated: recalculating speed
#' after removing those already marked as outliers.
mark_outliers <- function(x,
                          max_speed = 0,
                          min_angle_above_speed = c(0, 0),
                          max_runs = 5) {
  outliers <- c()
  gps_speed <- x
  run <- 0

  if (nrow(x) == 0) {
    message("No data.")
  } else if (nrow(x) == 1) {
    message("No calculation because one record.")
  } else {
    for (i in 1:max_runs) {
      run <- run + 1
      # Calculate speed and angle (see function below)
      gps_speed <- calc_speed_angle(gps_speed)

      # Record timestamps that are outliers
      new_outliers <- gps_speed %>% filter(
        # Very high speed
        speed > max_speed
        # Or high speed at sharp angle
        # (high speed can happen during migration, but should be straight line)
        | (angle < min_angle_above_speed[1] & speed > min_angle_above_speed[2])
      ) %>% pull(timestamp)

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
  }

  # Add import-marked-outlier column
  x <- x %>% mutate(`import-marked-outlier` = case_when(
    timestamp %in% outliers ~ TRUE,
    TRUE ~ FALSE
  ))
  return(x)
}

#' Returns gps data with column `speed` in m/s and `angle` between point `i`
#' and `i-1` using the trip and geosphere packages.
calc_speed_angle <- function(x, timestamp = "timestamp", lat = "location-lat",
                             lon = "location-long") {
  # Add datetime and stop function if not sorted
  x$datetime <- as_datetime(x[[timestamp]])
  stopifnot(x$datetime == arrange(x, datetime)$datetime)

  # Create matrix of long/lat
  trip_matrix <- data.matrix(x[, c(lon, lat)], rownames.force = NA)

  # Calculate distances between points and bearings of points
  distances_between_points <- trip::trackDistance(trip_matrix, longlat = TRUE)
  bearing_of_points <- geosphere::bearing(trip_matrix)
  bearing_of_points <- ifelse(
    bearing_of_points < 0,
    360 - abs(bearing_of_points),
    bearing_of_points
  )

  # Add distance and bearing to data
  x$distance <- c(0, distances_between_points) # dist in km
  x$bearing <- bearing_of_points

  # Calculate and add speed and angles between points
  x$time_elapsed <- 0
  x$angle <- 0
  for (i in 2:nrow(x)) {
    x$time_elapsed[i] <- difftime(x$datetime[i], x$datetime[i-1], units = "secs")
    x$angle[i] <- abs(180 - abs(x$bearing[i-1] - x$bearing[i]))
  }
  x$speed <- (x$distance * 1000) / x$time_elapsed # speed = dist/time in m/s

  # Remove unnecessary columns
  x <- select(x, -datetime, -distance, -time_elapsed, -bearing)
  return(x)
}
