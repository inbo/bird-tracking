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
