library(tidyverse)
library(lubridate)
library(sf)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
# fn that turns a given date and time into a combined lubridate type
combine_date_time <- function(date, time) {
  time <- as.numeric(time)
  h <- time %/% 100
  m <- time %% 100
  hour(date) <- h
  minute(date) <- m
  as.POSIXct(date)
} 
# fn that unifies polygons of city areas
extract_shape <- function(city) {
  comm_codes %>% 
    filter(NAME == city) %>% 
    st_combine()
}
# reads in shape file for different CDPs and cities
comm_codes <- read_sf("./Community_Codes/") %>% 
  st_transform(4269)

#Reads in file of 'useful columns from TIMS'
raw_fields <- read_csv("./Metadata_TIMS.csv") %>% 
  pull("Raw Field")

#Reads in file with raw TIMS data
refined_data <- read_csv("./Collisions.csv") %>% 
  # Pulls only the columns that are headed by a raw field
  select(raw_fields) %>% 
  mutate(
    # Changes DAY_OF_WEEK from a number to an appropriate name
    DAY_OF_WEEK = case_when(
      DAY_OF_WEEK == 1 ~ "Monday",
      DAY_OF_WEEK == 2 ~ "Tuesday",
      DAY_OF_WEEK == 3 ~ "Wednesday",
      DAY_OF_WEEK == 4 ~ "Thursday",
      DAY_OF_WEEK == 5 ~ "Friday",
      DAY_OF_WEEK == 6 ~ "Saturday",
      DAY_OF_WEEK == 7 ~ "Sunday",
      TRUE ~ NA_character_
    ),
    
    # Replaces NAs in certain columns with a 'N' char
    across(c("PEDESTRIAN_ACCIDENT", "BICYCLE_ACCIDENT", "MOTORCYCLE_ACCIDENT", "TRUCK_ACCIDENT", "ALCOHOL_INVOLVED"), ~ if_else(is.na(.), "N", "Y")),
    
    # CHanges any primary roads that are state routes to just the number of the route(dbl)
    PRIMARY_RD = if_else(!is.na(STATE_ROUTE), as.character(STATE_ROUTE), PRIMARY_RD),
    
    # Changes COLLISION_TIME to a lubridate type that also contains the date
    COLLISION_TIME = combine_date_time(COLLISION_DATE, COLLISION_TIME),
    
    # creates latitude and longitude columns
    lat = if_else(!is.na(POINT_Y), POINT_Y, 0),
    lon = if_else(!is.na(POINT_X), POINT_X, 0)
    
  ) %>% 
  # adds geometries
  st_as_sf(coords = c("lon","lat"), remove = FALSE) %>% 
  st_set_crs(st_crs(comm_codes)) %>% #comm_codes is comm_codes tibble
  st_transform(4269) %>% 
  mutate(
    city_new = case_when(
      st_within(geometry, extract_shape("BIG SUR"), sparse=FALSE) == TRUE ~ "Big Sur",
      st_within(geometry, extract_shape("BRADLEY"), sparse=FALSE) == TRUE ~ "Bradley",
      st_within(geometry, extract_shape("CARMEL VALLEY"), sparse=FALSE) == TRUE ~ "Carmel Valley",
      st_within(geometry, extract_shape("CARMEL (CITY)"), sparse=FALSE) == TRUE ~ "Carmel-by-the-Sea",
      st_within(geometry, extract_shape("CASTROVILLE"), sparse=FALSE) == TRUE ~ "Castroville",
      st_within(geometry, extract_shape("CHUALAR"), sparse=FALSE) == TRUE ~ "Chualar",
      st_within(geometry, extract_shape("DEL REY OAKS (CITY)"), sparse=FALSE) == TRUE ~ "Del Rey Oaks",
      st_within(geometry, extract_shape("EAST GARRISON"), sparse=FALSE) == TRUE ~ "East Garrison",
      st_within(geometry, extract_shape("GONZALES (CITY)"), sparse=FALSE) == TRUE ~ "Gonzales",
      st_within(geometry, extract_shape("GREENFIELD (CITY)"), sparse=FALSE) == TRUE ~ "Greenfield",
      st_within(geometry, extract_shape("JOLON"), sparse=FALSE) == TRUE ~ "Jolon",
      st_within(geometry, extract_shape("KING CITY (CITY)"), sparse=FALSE) == TRUE ~ "King City",
      st_within(geometry, extract_shape("LOCKWOOD"), sparse=FALSE) == TRUE ~ "Lockwood",
      st_within(geometry, extract_shape("MARINA (CITY)"), sparse=FALSE) == TRUE ~ "Marina",
      st_within(geometry, extract_shape("MONTEREY (CITY)"), sparse=FALSE) == TRUE ~ "Monterey",
      st_within(geometry, extract_shape("MOSS LANDING"), sparse=FALSE) == TRUE ~ "Moss Landing",
      st_within(geometry, extract_shape("PACIFIC GROVE (CITY)"), sparse=FALSE) == TRUE ~ "Pacific Grove",
      st_within(geometry, extract_shape("PAJARO"), sparse=FALSE) == TRUE ~ "Pajaro",
      st_within(geometry, extract_shape("PARKFIELD"), sparse=FALSE) == TRUE ~ "Parkfield",
      st_within(geometry, extract_shape("PEBBLE BEACH"), sparse=FALSE) == TRUE ~ "Pebble Beach",
      st_within(geometry, extract_shape("ROYAL OAKS"), sparse=FALSE) == TRUE ~ "Royal Oaks",
      st_within(geometry, extract_shape("SALINAS (CITY)"), sparse=FALSE) == TRUE ~ "Salinas",
      st_within(geometry, extract_shape("SAN ARDO"), sparse=FALSE) == TRUE ~ "San Ardo",
      st_within(geometry, extract_shape("SAN LUCAS"), sparse=FALSE) == TRUE ~ "San Lucas",
      st_within(geometry, extract_shape("SAND CITY (CITY)"), sparse=FALSE) == TRUE ~ "Sand City",
      st_within(geometry, extract_shape("SEASIDE (CITY)"), sparse=FALSE) == TRUE ~ "Seaside",
      st_within(geometry, extract_shape("SOLEDAD (CITY)"), sparse=FALSE) == TRUE ~ "Soledad",
      TRUE ~ "Other Unincorporated"
    )
  )

# Writes out the cleaned data to a new csv file
write_csv(refined_data, "./collisions_final_cleaned.csv")
