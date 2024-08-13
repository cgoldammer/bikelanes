import { createSlice } from "@reduxjs/toolkit";
import {
  getRoutes,
  createSegments,
  getGeojsonFromFilters,
  boros,
} from "../helpers/location";
import { routesCleaned } from "../helpers/locationLarge";

const positionStart = { y: 40.6582, x: -73.956 };

const defaultState = {
  mapCenter: positionStart,
  mapHeight: 400,
  zoomLevel: 12,
  showMarkers: true,
  opacity: 0.0,
  selectedProperties: undefined,
  labelId: undefined,
  showStored: false,
  laneTypesFilter: ["Protected Path"],
  boroFilter: boros.brooklyn,
  segments: undefined,
};

const initialState = () => {
  return defaultState;
};

const reducersDefault = {
  mapCenter: "setMapCenter",
  mapHeight: "setMapHeight",
  showMarkers: "setShowMarkers",
  opacity: "setOpacity",
  zoomLevel: "setZoomLevel",
  selectedProperties: "setSelectedProperties",
  labelId: "setLabelId",
  segments: "setSegments",
  showStored: "setShowStored",
  laneTypesFilter: "setLaneTypesFilter",
  boroFilter: "setBoroFilter",
};

const createReducersFromDefault = (defaultReducers) => {
  const reducers = {};
  for (const key in defaultReducers) {
    reducers[defaultReducers[key]] = (state, actions) => {
      state[key] = actions.payload;
    };
  }

  reducers["labelSegment"] = (state, action) => {
    const data = action.payload;
    const id = data.id;
    state.segments[id] = data;
  };
  reducers["deleteLabel"] = (state, action) => {
    const id = action.payload;
    const segment = state.segments[id];
    segment.labels = undefined;
    state.segments[id] = segment;
  };

  reducers["updateSegments"] = (state, action) => {
    const geojson = getGeojsonFromFilters(routesCleaned, state);
    const segments = createSegments(geojson);
    state.segments = segments;
  };
  return reducers;
};

const defaultReducers = createReducersFromDefault(reducersDefault);

export const mapStateSlice = createSlice({
  name: "mapState",
  initialState: initialState(),
  reducers: defaultReducers,
});

export const {
  setShowMarkers,
  setMapCenter,
  setZoomLevel,
  setOpacity,
  setSelectedProperties,
  setLabelId,
  setSegments,
  labelSegment,
  setShowStored,
  setLaneTypesFilter,
  setMapHeight,
  deleteLabel,
  updateSegments,
  setBoroFilter,
} = mapStateSlice.actions;
export default mapStateSlice.reducer;
