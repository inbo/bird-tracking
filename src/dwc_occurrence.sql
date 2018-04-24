# DEPRECATED!
# 
# This query mapped the data to Darwin Core in CartoDB
# It was used to publish the bird-tracking-gull-occurrences until v5.5:
# http://data.inbo.be/ipt/resource?r=bird-tracking-gull-occurrences&v=5.5
# 
# The query is mentioned in the corresponding data paper:
# https://doi.org/10.3897/zookeys.555.6173
# 
# For the current mapping procedure, please see:
# https://github.com/inbo/data-publication/tree/master/datasets/bird-tracking-gull-occurrences

with no_outliers as (
  select
    *,
    extract(epoch from (date_time - lag(date_time,1) over(order by device_info_serial, date_time))) as intervalinseconds
  from
    lifewatch.bird_tracking
  where
    userflag is false
)

select
  t.device_info_serial || ':' || to_char(t.date_time at time zone 'UTC','YYYYMMDDHH24MISS') as occurrenceID,
  'Event'::text as type,
  to_char(t.updated_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') as modified,
  'en'::text as language,
  'http://creativecommons.org/publicdomain/zero/1.0/'::text as license,
  'INBO'::text as rightsholder,
  'http://www.inbo.be/en/norms-for-data-use'::text as accessRights,
  'https://doi.org/10.15468/02omly'::text as datasetID,
  'INBO'::text as institutionCode,
  'Bird tracking - GPS tracking of Lesser Black-backed Gulls and Herring Gulls breeding at the southern North Sea coast'::text as datasetName,
  'INBO'::text as ownerInstitutionCode,
  'MachineObservation'::text as basisOfRecord,
  'see metadata'::text as informationWithheld,
  ('{"device_info_serial":' || t.device_info_serial)::text || '}' as dynamicProperties,
  d.sex::text as sex,
  'adult'::text as lifeStage,
  d.ring_code::text as organismID,
  d.bird_name::text as organismName,
  'doi:10.1007/s10336-012-0908-1'::text as samplingProtocol,
  case
    when intervalinseconds >= 0 then ('{"secondsSinceLastOccurrence":' || intervalinseconds || '}')::text
    else '{"secondsSinceLastOccurrence":}'::text
  end as samplingEffort,
  to_char(t.date_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') as eventDate,
  0::numeric as minimumElevationInMeters,
  t.altitude::numeric as minimumDistanceAboveSurfaceInMeters,
  t.latitude::numeric as decimalLatitude,
  t.longitude::numeric as decimalLongitude,
  'WGS84'::text as geodeticDatum,
  case
    when h_accuracy is not null then round(h_accuracy)::numeric
    else 30::numeric
  end as coordinateUncertaintyInMeters,
  to_char(t.date_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') as georeferencedDate,
  'doi:10.1080/13658810412331280211'::text as georeferenceProtocol,
  'GPS'::text as georeferenceSources,
  'unverified'::text as georeferenceVerificationStatus,
  d.scientific_name::text as scientificName,
  'Animalia'::text as kingdom,
  'Chordata'::text as phylum,
  'Aves'::text as class,
  'Charadriiformes'::text as _order,
  'Laridae'::text as family,
  split_part(d.scientific_name, ' ', 1)::text as genus,
  split_part(d.scientific_name, ' ', 2)::text as specificEpithet,
  'species'::text as taxonRank,
  case
    when d.species_code = 'lbbg' then 'Linnaeus, 1758'
    when d.species_code = 'hg' then 'Pontoppidan, 1763'
  end::text as scientificNameAuthorship,
  case
    when d.species_code = 'lbbg' then 'Lesser Black-backed Gull'
    when d.species_code = 'hg' then 'Herring Gull'
  end::text as vernacularName,
  'ICZN'::text as nomenclaturalCode
from
no_outliers as t
left join lifewatch.bird_tracking_devices as d
on t.device_info_serial = d.device_info_serial
where
  d.species_code = 'lbbg' or d.species_code = 'hg'
order by
  t.device_info_serial,
  t.date_time
limit
  100