import React from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { GeoJSON, Marker, Popup } from "react-leaflet";
import Grid from "@mui/material/Unstable_Grid2";
import {
  setZoomLevel,
  setOpacity,
  setSelectedProperties,
  setLabelId,
  setShowMarkers,
  setMapHeight,
  labelSegment,
  setLaneTypesFilter,
  setBoroFilter,
  updateSegments,
} from "../reducers/mapStateReducer";
import {
  locationToArray,
  toFixedLocation,
  getColor,
  getSegmentsSample,
  laneTypeValues,
} from "../helpers/location";

import { useMapEvents } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import { Button, Select } from "@mui/material";
import { Slider } from "@mui/material";
import { Typography } from "@mui/material";
import { getGeojsonFiltered } from "../selectors";
import { LabelView } from "./LabelView";
import { getIcon } from "../helpers/markers";
import { MenuItem } from "@mui/material";
import { boros } from "../helpers/location";

const invertXY = (coordinates) => {
  return [coordinates[1], coordinates[0]];
};

const MyComponent = (props) => {
  const { zoom } = props;
  const dispatch = useDispatch();
  const mapEvents = useMapEvents({
    zoomend: () => {
      dispatch(setZoomLevel(mapEvents.getZoom()));
    },
  });

  return null;
};

const PropertyView = (props) => {
  const selectedProperties = useSelector(
    (state) => state.mapState.selectedProperties
  );

  const { tf_facilit, ft_facilit, maxFacilit } = selectedProperties;

  return (
    <Grid container>
      <Grid xs={4}>Id</Grid>
      <Grid xs={8}>{selectedProperties.id}</Grid>
      <Grid xs={4}>
        <Typography>Facility TF: {tf_facilit}</Typography>
      </Grid>
      <Grid xs={4}>
        <Typography>Facility FT: {ft_facilit}</Typography>
      </Grid>
      <Grid xs={4}>
        <Typography>Max Facility: {maxFacilit}</Typography>
      </Grid>
    </Grid>
  );
};

export const SearchView = () => {
  const showMarkers = useSelector((state) => state.mapState.showMarkers);
  const mapCenter = useSelector((state) => state.mapState.mapCenter);
  const zoomLevel = useSelector((state) => state.mapState.zoomLevel);
  const opacity = useSelector((state) => state.mapState.opacity);
  const mapHeight = useSelector((state) => state.mapState.mapHeight);
  const laneTypesSelected = useSelector(
    (state) => state.mapState.laneTypesFilter
  );
  const boro = useSelector((state) => state.mapState.boroFilter);
  const segments = useSelector((state) => state.mapState.segments);
  const dispatch = useDispatch();
  const selectedLabel = useSelector((state) => state.mapState.labelId);

  const properties = {
    mapCenter: toFixedLocation(mapCenter, 5),
    laneTypesSelected: laneTypesSelected,
    boro: boro,
    mapHeight: mapHeight,
  };

  const labelView =
    selectedLabel != undefined ? (
      <LabelView
        key={selectedLabel}
        id={selectedLabel}
        segment={segments[selectedLabel]}
      />
    ) : (
      <div />
    );

  const opacitySlider = (
    <Slider
      value={opacity}
      min={0.0}
      max={1.0}
      step={0.1}
      onChange={(event, value) => dispatch(setOpacity(value))}
    />
  );

  const mapHeightSlider = (
    <Slider
      value={mapHeight}
      min={0}
      max={1500}
      step={10}
      onChange={(event, value) => dispatch(setMapHeight(value))}
    />
  );

  const laneTypeSelector = (
    <Select
      multiple
      value={laneTypesSelected}
      onChange={(event) => {
        dispatch(setLaneTypesFilter(event.target.value));
        dispatch(updateSegments());
      }}
    >
      {Object.keys(laneTypeValues).map((type) => {
        return (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        );
      })}
    </Select>
  );

  const boroSelector = (
    <Select
      value={boro}
      onChange={(event) => {
        dispatch(setBoroFilter(event.target.value));
        dispatch(updateSegments());
      }}
    >
      {Object.keys(boros).map((key) => {
        return (
          <MenuItem key={key} value={boros[key]}>
            {key}
          </MenuItem>
        );
      })}
    </Select>
  );

  const uniqueKey = JSON.stringify(properties);
  return (
    <Grid container>
      <Grid xs={12}>
        <Grid xs={6}>
          <Button onClick={() => dispatch(setShowMarkers(!showMarkers))}>
            {showMarkers ? "Hide" : "Show"} Markers
          </Button>
        </Grid>
      </Grid>
      <Grid xs={6}>
        <Typography>Opacity for Streets</Typography>
      </Grid>
      <Grid xs={6}>{opacitySlider}</Grid>
      <Grid xs={6}>
        <Typography>Map height</Typography>
      </Grid>
      <Grid xs={6}>{mapHeightSlider}</Grid>
      <Grid xs={6}>
        <Typography>Lane types</Typography>
      </Grid>
      <Grid xs={6}>{laneTypeSelector}</Grid>
      <Grid xs={6}>
        <Typography>Boro</Typography>
      </Grid>
      <Grid xs={6}>{boroSelector}</Grid>
      <Grid xs={12}>
        <MapView
          key={uniqueKey}
          mapCenter={mapCenter}
          mapHeight={mapHeight}
          zoom={zoomLevel}
          showMarkers={showMarkers}
          opacity={opacity}
        />
      </Grid>
      <Grid xs={12}>{labelView}</Grid>
    </Grid>
  );
};

export const MapView = (props) => {
  const { mapCenter, zoom, opacity, width, showMarkers, mapHeight } = props;
  const geojson = useSelector(getGeojsonFiltered);
  const segments = useSelector((state) => state.mapState.segments);
  const dispatch = useDispatch();
  const mapCenterArray = locationToArray(mapCenter);

  if (segments == undefined) {
    return <div>loading</div>;
  }

  const segmentsSample = getSegmentsSample(segments, 2000);

  const markers = Object.values(segmentsSample).map((segment) => {
    const { id, properties, geometry, labels } = segment;

    return (
      <Marker
        position={invertXY(geometry)}
        key={id}
        icon={getIcon(labels != undefined ? "green" : "red")}
        eventHandlers={{
          click: () => {
            dispatch(setLabelId(id));
          },
        }}
      ></Marker>
    );
  });

  const url =
    "https://orthos.its.ny.gov/arcgis/rest/services/wms/2022/MapServer/tile/{z}/{y}/{x}";

  const satLayer = <TileLayer url={url} opacity={1} maxZoom={19} />;

  const geojsonLayer = (
    <GeoJSON
      data={geojson}
      style={(feature) => ({
        color: getColor(feature.properties.maxFacilit),
        weight: 4,
      })}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => {
            dispatch(setSelectedProperties(feature.properties));
          },
        });
      }}
    />
  );

  const tileLayer = (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      opacity={opacity}
      maxZoom={20}
    />
  );

  return (
    <MapContainer
      center={mapCenterArray}
      maxZoom={19}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: mapHeight, minWidth: width, opacity: 1.0, margin: 10 }}
    >
      <MyComponent zoom={zoom} />
      {satLayer}
      {tileLayer}
      {geojsonLayer}
      {showMarkers ? markers : null}
    </MapContainer>
  );
};
