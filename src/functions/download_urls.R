download_urls <- function(start_date, end_date, project_id) {
  # Assign project integer
  project_integer <- dplyr::case_match(
    project_id,
    "LARGE_GULLS" ~ 38,
    "CORMORANT" ~ 36,
    "PIED_AVOCET" ~ 37
  )

  # Create time series of start_dates and end_dates (in yearly steps)
  # start_dates: 2000-01-01, 2000-01-02, ...
  # end_dates:   2000-12-31, 2001-12-31, ...
  years <-
    seq.Date(as.Date(start_date), as.Date(end_date), by = "years") |>
    purrr::map_chr(~ stringr::str_sub(.x, 1, 4))
  start_dates <- purrr::map_chr(years, ~ paste0(.x, "-01-01"))
  end_dates <- purrr::map_chr(years, ~ paste0(.x, "-12-31"))
  end_dates[[length(end_dates)]] <- end_date # Shorten last duration to end_date

  # Create download URLs
  urls <- purrr::map2(
    start_dates,
    end_dates,
    ~ paste0(
      "https://submit.cr-birding.org/projects/", project_integer, "/export/csv/",
      "?date_min=", .x,
      "&date_max=", .y
    )
  )
  unlist(urls)
}
