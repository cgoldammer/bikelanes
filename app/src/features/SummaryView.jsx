import React from "react";
import data from "../data/data.json";
import {
  getRoutes,
  getMaxVal,
  boros,
  getBoroName,
  laneFilter,
} from "../helpers/location";
import { routesCleaned } from "../helpers/locationLarge";
import {
  mergeDataGeoJson,
  featureHasLabel,
  propertyHasLabel,
} from "../helpers/summarize";
import { getRandomSample, groupDictByKey } from "../helpers/helpers";
import { DataGrid } from "@mui/x-data-grid";
import { texts } from "../texts";
import Grid from "@mui/material/Unstable_Grid2";
import { KeyOutlined } from "@mui/icons-material";
import { Typography } from "@mui/material";

const labels = data;

const routes = getRoutes(routesCleaned, false, 0, laneFilter);
const merged = mergeDataGeoJson(labels, routes, false);

const getPropertyKey = (properties) => {
  const maxFacilit = getMaxVal(properties);
  const vals = { boro: getBoroName(properties.boro), maxFacilit };
  return JSON.stringify(vals);
};

const getLength = (properties) => {
  return properties
    .map((property) => parseFloat(property.shape_leng))
    .reduce((a, b) => a + b, 0);
};

const groupedToTable = (groupedProperties, sampleNum = -1) => {
  const keys = Object.keys(groupedProperties);
  const rows = keys.map((key) => {
    const properties = groupedProperties[key];
    const propertiesSampled =
      sampleNum == -1 ? properties : getRandomSample(properties, sampleNum);
    const keyParsed = JSON.parse(key);
    return { id: key, ...keyParsed, ...getPerformance(propertiesSampled) };
  });
  return rows;
};

const getStats = (labels, properties) => {
  const res = {
    numLabels: labels.length,
  };
  return { ...res, ...getPerformance(properties) };
};

const labelsSimple = ["percent"];

const DictView = ({ dict, showDetails }) => {
  const keys = Object.keys(dict);
  const vals = keys.map((key) => {
    if (!texts.summaryLabels[key]) {
      return null;
    }
    if (!showDetails && !labelsSimple.includes(key)) {
      return null;
    }

    return (
      <React.Fragment>
        <Grid xs={12}>
          <Typography variant="h3" textAlign="center">
            {texts.summaryLabels[key]} {dict[key]}
          </Typography>
        </Grid>
      </React.Fragment>
    );
  });
  return <React.Fragment>{vals}</React.Fragment>;
};

export const DictViewFromData = ({ merged }) => {
  const mergedFeatures = merged.features;
  const mergedProperties = mergedFeatures.map((feature) => feature.properties);
  const stats = getStats(labels, mergedProperties);

  return <DictView dict={stats} />;
};

export const SummaryView = (props) => {
  const { merged } = props;
  const mergedFeatures = merged.features;
  const mergedProperties = mergedFeatures.map((feature) => feature.properties);

  const groupedProperties = groupDictByKey(mergedProperties, getPropertyKey);
  const stats = getStats(labels);
  const [showDetails, setShowDetails] = React.useState(false);

  const groupedTable = groupedToTable(groupedProperties);

  const columns = Object.keys(texts.summaryLabels).map((key) => {
    return { field: key, headerName: texts.summaryLabels[key], width: 150 };
  });

  const table = (
    <DataGrid
      rows={groupedTable}
      columns={columns}
      pageSize={10}
      rowsPerPageOptions={[10]}
      getRowId={(row) => row.id}
      initialState={{
        sorting: {
          sortModel: [
            { field: "boro", sort: "asc" },
            {
              field: "maxFacilit",
              sort: "asc",
            },
          ],
        },
      }}
    />
  );

  return (
    <Grid container>
      <Grid xs={12}>
        <Typography variant="h1">{texts.summaryView.header}</Typography>
      </Grid>
      <DictView dict={stats} showDetails={showDetails} />
      {showDetails ? table : null}
    </Grid>
  );
};
