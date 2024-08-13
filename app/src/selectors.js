import { createSelector } from "@reduxjs/toolkit";
import { routesCleaned } from "./helpers/locationLarge";
import {
  filterGeoJson,
  boros,
  getGeojsonFromFilters,
} from "./helpers/location";

const mapStateSelector = (state) => state.mapState;

export const getGeojsonFiltered = createSelector(
  [mapStateSelector],
  (filters) => {
    return getGeojsonFromFilters(routesCleaned, filters);
  }
);
