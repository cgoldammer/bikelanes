import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { filter } from "d3";
import Grid from "@mui/material/Unstable_Grid2";
import { Button } from "@mui/material";
import { filterDictByFunctionOnValues } from "../helpers/helpers";
import { arrayToLocation, locationToArray } from "../helpers/location";

const segmentToDict = (segment) => {
  const { id, properties, labels, geometry } = segment;

  const oneDict = {
    id: id,
    ...labels,
    ...properties,
    ...arrayToLocation(geometry),
  };
  return oneDict;
};

const filterDictByKeys = (dict, keys) => {
  const newDict = {};
  keys.forEach((key) => {
    newDict[key] = dict[key];
  });

  return newDict;
};

const valsToCsv = (vals) => {
  const firstRow = vals[0];
  const fields = Object.keys(firstRow);
  const headerLine = Object.keys(firstRow).join(",");

  const csv = vals.map((row) => {
    return fields.map((col) => row[col]).join(",");
  });
  const allRows = [headerLine, ...csv];
  return allRows.join("\n");
};

export const TableStored = () => {
  const segments = useSelector((state) => state.mapState.segments);

  if (Object.keys(segments).length === 0) {
    return <div>No segments</div>;
  }

  const segmentsLabelled = filterDictByFunctionOnValues(
    segments,
    (segment) => segment.labels != undefined
  );

  if (Object.keys(segmentsLabelled).length === 0) {
    return <div>No segments labelled</div>;
  }

  const vals = Object.values(segmentsLabelled).map(segmentToDict);

  const columns = [
    { field: "tf_facilit", headerName: "TF", width: 120 },
    { field: "ft_facilit", headerName: "FT", width: 120 },
    { field: "mainType", headerName: "Main", width: 100 },
    { field: "protectionType", headerName: "Protection", width: 100 },
    { field: "hasColor", headerName: "Color", width: 50 },
    { field: "certainty", headerName: "Certainty", width: 100 },
    { field: "notes", headerName: "Notes", width: 100 },
  ];

  const downloadDataJson = () => {
    const blob = new Blob([JSON.stringify(vals)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
  };

  const downloadDataCsv = () => {
    const blob = new Blob([valsToCsv(vals)], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
  };

  return (
    <Grid>
      <Grid xs={12}>
        <Button onClick={downloadDataJson}>Download</Button>
      </Grid>
      <DataGrid
        rows={vals}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row.id}
      />
    </Grid>
  );
};
