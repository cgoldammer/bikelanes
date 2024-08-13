import { MapContainer } from "react-leaflet/MapContainer";
import React, { useState, useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import { TileLayer } from "react-leaflet/TileLayer";
import Grid from "@mui/material/Unstable_Grid2";
import { GeoJSON, Marker, Popup } from "react-leaflet";
import data from "../data/data.json";
import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { Box } from "@mui/material";
import {
  getRoutesAsync,
  relColor,
  filterGeoJson,
  allValues,
  protectedName,
  transformGeoProperties,
  formatProperties,
  getColorExtended,
} from "../helpers/location";
import { mergeDataGeoJson } from "../helpers/summarize";
import { styleImage } from "../helpers/helpersUI";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Typography } from "@mui/material";
import { texts } from "../texts";
import { MapDataContainer } from "./MapDataContainer";

export const LegendView = (props) => {
  const { legendData, valToggle, laneTypes } = props;
  const isSelected = (properties) => {
    return laneTypes.includes(properties.protectionId);
  };
  const borderStyle = (properties) => {
    const color = getColorExtended(properties);
    return isSelected(properties)
      ? "0px 0px 0px 3px black inset"
      : "0px 0px 0px 1px grey inset";
  };
  return (
    <Grid container spacing={2}>
      {legendData.map((properties) => {
        return (
          <Grid xs={3} key={properties.protectionId}>
            <Grid
              xs={12}
              onClick={() => valToggle(properties.protectionId)}
              sx={{
                backgroundColor: getColorExtended(properties),
                boxShadow: borderStyle(properties),
                cursor: "pointer",
                fontWeight: "bold", // Add this line to make the text bold
              }}
            >
              <Typography textAlign="center" color="black">
                {properties.protectionName}
              </Typography>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};
