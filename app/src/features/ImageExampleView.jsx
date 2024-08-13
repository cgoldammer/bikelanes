import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Unstable_Grid2";
import { allValues } from "../helpers/location";
import { Typography } from "@mui/material";
import { texts } from "../texts";
import { Image } from "../helpers/helpersUI";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { KeyOutlined } from "@mui/icons-material";

export const FeaturesView = ({ featureDict }) => {
  const getListItem = (key) => {
    const value = featureDict[key];
    return (
      <ListItem key={key}>
        <ListItemText primary={value.name} />
      </ListItem>
    );
  };

  return <List>{Object.keys(featureDict).map(getListItem)}</List>;
};

export const getImageUrl = (stub) => "images/" + stub + ".jpg";

export const ImageExampleView = () => {
  const fieldsWithImages = allValues.filter((x) => x.exampleImage != undefined);

  const getRow = (properties) => {
    return (
      <Grid xs={12} sm={6} key={properties.protectionName}>
        <Grid xs={12} textAlign="center">
          <Typography variant="h4">{properties.protectionName}</Typography>
        </Grid>
        <Grid xs={12} textAlign="center">
          <Image
            component="img"
            src={getImageUrl(properties.exampleImage)}
            width="250px"
            height="150px"
          />
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2}>
      {fieldsWithImages.map(getRow)}
    </Grid>
  );
};
