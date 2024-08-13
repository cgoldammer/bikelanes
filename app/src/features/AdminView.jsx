import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setViewsVisible } from "../reducers/settingsReducer";
import { runMode, RUNMODE_MOCK } from "../helpers/helpers";
import { BorderedBox } from "../helpers/helpersUI";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import {
  wipeLocalStorage,
  storeSegments,
  createSegments,
  removeFromLocalStorage,
  getSegmentsFromDB,
  getRoutes,
  getIdForStreet,
} from "../helpers/location";
import { routesCleaned } from "../helpers/locationLarge";
import { labelSegment } from "../reducers/mapStateReducer";
import Grid from "@mui/material/Unstable_Grid2";
import { getGeojsonFiltered } from "../selectors";

export const AdminView = () => {
  const [segmentsInDb, setSegmentsInDb] = useState(getSegmentsFromDB());
  const dispatch = useDispatch();
  const viewsVisible = useSelector((state) => state.settings.viewsVisible);
  const geojson = useSelector(getGeojsonFiltered);
  const segments = useSelector((state) => state.mapState.segments);

  const numsInDb = Object.keys(segmentsInDb).length;

  const idsInRoutes = geojson.features.map((feature) =>
    getIdForStreet(feature.properties)
  );
  const uniqueIds = [...new Set(idsInRoutes)];

  const keyParameters = {
    runMode: process.env.RUNMODE,
    "Labels in DB": numsInDb,
    "Routes total": routesCleaned.features.length,
    "Routes after filter": geojson.features.length,
    "Unique t/f street after filter": uniqueIds.length,
    Features: JSON.stringify(Object.keys(routesCleaned.features[0].properties)),
    "Number of Segments":
      segments == undefined ? 0 : Object.keys(segments).length,
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, index) => {
    const draggedIndex = event.dataTransfer.getData("text/plain");
    const updatedViewsVisible = [...viewsVisible];
    const [draggedItem] = updatedViewsVisible.splice(draggedIndex, 1);
    updatedViewsVisible.splice(index, 0, draggedItem);
    dispatch(setViewsVisible(updatedViewsVisible));
  };

  const style = {
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    backgroundColor: "#f0f0f0",
  };

  const reorderViews = (
    <div>
      <List
        onDragOver={handleDragOver}
        style={{ display: "flex", flexDirection: "row" }}
      >
        {viewsVisible.map((view, index) => (
          <ListItem
            style={style}
            key={view}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDrop={(event) => handleDrop(event, index)}
          >
            <ListItemText primary={view} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  const showKeyParameters = Object.keys(keyParameters).map((key) => (
    <React.Fragment key={key}>
      <Grid xs={3}>{key}</Grid>
      <Grid xs={9}>{keyParameters[key]}</Grid>
    </React.Fragment>
  ));

  const updateStateFromDb = () => {
    const objectsInDB = getSegmentsFromDB();
    Object.values(objectsInDB).forEach((segment) => {
      dispatch(labelSegment(segment));
    });
  };

  const showDbSegments = () => {
    const objectsInDB = getSegmentsFromDB();
    setSegmentsInDb(objectsInDB);
  };
  return (
    <BorderedBox sx={{ margin: "10px" }}>
      <Grid container spacing={2} alignItems="center">
        {reorderViews}
      </Grid>
      <Grid container spacing={2} alignItems="center">
        {showKeyParameters}
      </Grid>
      <Grid container>
        <Grid xs={4}>
          <Button onClick={showDbSegments}>Update DB state</Button>
        </Grid>
        <Grid xs={4}>
          <Button onClick={updateStateFromDb}>Update state from DB</Button>
        </Grid>
        <Grid xs={4}>
          <Button onClick={() => removeFromLocalStorage("segment")}>
            Delete DB segments
          </Button>
        </Grid>
      </Grid>
    </BorderedBox>
  );
};

// buttons
//   createSegments
// , removeStoredSegments
// , exportStoredSegments
