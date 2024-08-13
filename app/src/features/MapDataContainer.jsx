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
  getColorExtended,
  filterGeoJson,
  allValues,
  protectedName,
  transformGeoProperties,
  formatProperties,
  filterBrooklyn,
  filterAll,
} from "../helpers/location";
import { mergeDataGeoJson } from "../helpers/summarize";
import { styleImage } from "../helpers/helpersUI";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Typography } from "@mui/material";
import { texts } from "../texts";

export const MapDataContainer = ({
  laneTypes,
  labels,
  setActiveProperties,
}) => {
  const [mergedFiltered, setRoutes] = useState(null);

  useEffect(() => {
    const fetchValue = async () => {
      try {
        const bikeroutes = await getRoutesAsync(false, -1, filterAll); // Call the async function
        const cleaned = transformGeoProperties(formatProperties)(bikeroutes);
        const merged = mergeDataGeoJson(labels, cleaned, false);

        const mergedFiltered =
          laneTypes.length == 0
            ? merged
            : filterGeoJson(merged, (properties) => {
                return (
                  Object.keys(properties).includes("protectionId") &&
                  laneTypes.includes(properties.protectionId)
                );
              });
        setRoutes(mergedFiltered); // Set the retrieved value in state
      } catch (error) {
        console.error("Failed to fetch value:", error);
      }
    };
    if (mergedFiltered == null) {
      fetchValue();
    }
  }, []);

  if (mergedFiltered == null) {
    return <div>Loading...</div>;
  }

  const geojsonLayer = (
    <GeoJSON
      data={mergedFiltered}
      style={(feature) => ({
        color: getColorExtended(feature.properties),
        weight: 3,
      })}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => {
            setActiveProperties(feature.properties);
          },
        });
      }}
    />
  );

  return geojsonLayer;
};
