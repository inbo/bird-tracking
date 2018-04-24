query_uvabits <- function(sql) {
  # Load libraries
  library(RODBC)
  library(odbc)

  # Get UvA-BiTS credentials from config file
  uvabits <- config::get("uvabits")

  # Define connection string
  connection_string <- paste0(
    "driver=", uvabits$driver,
    ";server=", uvabits$server,
    ";port=", uvabits$port,
    ";database=", uvabits$database,
    ";username=", uvabits$username,
    ";password=", uvabits$password,
    ";sslmode=require;"
  )

  # Make connection
  con <- odbcDriverConnect(connection_string, case = "postgresql")

  # Query database
  result <- sqlQuery(con, sql)

  return(result)
}
