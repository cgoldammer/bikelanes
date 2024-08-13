import { MapContainer } from "react-leaflet/MapContainer";
import React, { useState, useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import { TileLayer } from "react-leaflet/TileLayer";
import Grid from "@mui/material/Unstable_Grid2";
import data from "../data/data.json";
import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { Box } from "@mui/material";
import { allValues, protectedName } from "../helpers/location";
import { styleImage } from "../helpers/helpersUI";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Typography } from "@mui/material";
import { texts } from "../texts";
import { MapDataContainer } from "./MapDataContainer";
import { LegendView } from "./LegendView";
const labels = data;

const styleLoad = {
  ...styleImage,
  opacity: 0.1,
};
const startZoom = 11;
const ImageHidden = styled(Box)(styleLoad);
const positionParkSlope = [40.672, -73.977];
const positionLaGuardia = [40.776, -73.872];
const positionStart = positionLaGuardia;

const MyComponent = (props) => {
  const { setZoom, setCurrentLocation } = props;
  const mapEvents = useMapEvents({
    zoomend: () => {
      setZoom(mapEvents.getZoom());
    },
    moveend: () => {
      setCurrentLocation(mapEvents.getCenter());
    },
  });

  return null;
};

const defaultDisplay = process.env.RUNMODE != "public";

const valuesGreenway = allValues.filter((x) => x.maxFacilit == "Greenway");
const valuesProtected = allValues.filter((x) => x.maxFacilit == protectedName);

const namesProtected = valuesProtected
  // .concat(valuesGreenway)
  .map((x) => x.protectionId);

export const MapViewPublic = () => {
  const [displayed, setDisplayed] = React.useState(defaultDisplay);
  const [zoom, setZoom] = React.useState(startZoom);
  const [currentLocation, setCurrentLocation] = React.useState(positionStart);
  const [activeProperties, setActiveProperties] = React.useState(undefined);
  const [laneTypes, setLaneTypes] = React.useState(namesProtected);

  const selectLaneTypes = (
    <Select
      multiple
      fullWidth
      value={laneTypes}
      onChange={(event) => setLaneTypes(event.target.value)}
    >
      {allValues.map((properties) => {
        return (
          <MenuItem
            value={properties.protectionId}
            key={properties.protectionId}
          >
            {properties.protectionName}
          </MenuItem>
        );
      })}
    </Select>
  );

  const addToBikeLanesToggle = (newVal) => {
    if (laneTypes.includes(newVal)) {
      setLaneTypes(laneTypes.filter((x) => x != newVal));
    } else {
      setLaneTypes([...laneTypes, newVal]);
    }
  };

  const loadButton = (
    <Grid xs={12}>
      <Button
        variant="contained"
        size="large"
        onClick={() => setDisplayed(true)}
        style={{
          position: "relative",
          top: "-300px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10000, // Ensure the button is on top of the image
        }}
      >
        <Typography variant="h2">Load Map (Warning: 10MB)</Typography>
      </Button>
    </Grid>
  );

  const mapProperties = {
    laneTypes,
  };
  const valsProtected = allValues.filter((x) => x.maxFacilit == protectedName);
  const valsOther = allValues.filter((x) => x.maxFacilit != protectedName);

  const dataLayer = displayed ? (
    <MapDataContainer
      laneTypes={laneTypes}
      labels={labels}
      setActiveProperties={setActiveProperties}
    />
  ) : null;

  const streetViewButton =
    activeProperties != undefined &&
    Object.keys(activeProperties).includes("urlStreetView") ? (
      <Grid xs={12}>
        <Button target="_blank" href={activeProperties.urlStreetView}>
          Look at Google StreetView (opens new tab)
        </Button>
      </Grid>
    ) : null;

  const description =
    activeProperties != undefined ? (
      <Grid container>
        <Grid xs={4}>Segment: {activeProperties.segmentid}</Grid>
        <Grid xs={8}>
          Streets:{" "}
          {activeProperties.fromstreet + " to " + activeProperties.tostreet}
        </Grid>
        {streetViewButton}
      </Grid>
    ) : null;

  const mapContainer = (
    <MapContainer
      key={JSON.stringify(mapProperties)}
      center={currentLocation}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100vh", width: "100%", maxHeight: "500px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.7}
      />
      {dataLayer}

      <MyComponent setZoom={setZoom} setCurrentLocation={setCurrentLocation} />
    </MapContainer>
  );

  return (
    <Grid
      container
      rowSpacing={4}
      colspacing={1}
      maxWidth={"sm"}
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh", margin: "0 auto" }}
    >
      <Grid container sx={{ marginTop: "10px" }} rowSpacing={2}>
        <Typography variant="h2">{texts.sections.mapViewPublic}</Typography>
        <Grid xs={12}>
          <Typography variant="h4">{texts.legendNames.title}</Typography>
        </Grid>
        <Grid xs={12} sx={{ borderTop: "1px solid grey" }}>
          <Typography variant="h4" textAlign="center">
            {texts.legendNames.protection}
          </Typography>
        </Grid>
        <Grid xs={12}>
          <LegendView
            legendData={valsProtected}
            valToggle={addToBikeLanesToggle}
            laneTypes={laneTypes}
          />
        </Grid>
        <hr />
        <Grid xs={12} sx={{ borderTop: "1px solid grey" }}>
          <LegendView
            legendData={valsOther}
            valToggle={addToBikeLanesToggle}
            laneTypes={laneTypes}
          />
        </Grid>
        {/* <Grid xs={6}>
          <Grid xs={12}>
            <Typography variant="h4" textAlign="center">
              {texts.legendNames.protection}
            </Typography>
            <LegendView
              legendData={valsProtected}
              valToggle={addToBikeLanesToggle}
              laneTypes={laneTypes}
            />
          </Grid>
        </Grid>
        <Grid xs={6}>
          <Grid xs={12}>
            <Grid>
              <Typography variant="h4" textAlign="center">
                {texts.legendNames.other}
              </Typography>
            </Grid>
            <LegendView
              legendData={valsOther}
              valToggle={addToBikeLanesToggle}
              laneTypes={laneTypes}
            />
          </Grid>
        </Grid> */}
      </Grid>
      <Grid
        xs={12}
        onClick={() => {
          if (!displayed) {
            setDisplayed(true);
          }
        }}
      >
        {mapContainer}
      </Grid>
      <Grid xs={12}>{displayed ? null : loadButton}</Grid>
      <Grid xs={12}>{description}</Grid>
    </Grid>
  );
};
