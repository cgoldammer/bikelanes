import React, { useState } from "react";
import {
  Select,
  MenuItem,
  Typography,
  Button,
  RadioGroup,
  Slider,
  Radio,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { addToDb, deleteFromDb, linkToGoogleMaps } from "../helpers/location";
import { labelSegment, deleteLabel } from "../reducers/mapStateReducer";
import { useDispatch } from "react-redux";
import Grid from "@mui/material/Unstable_Grid2";

const protectionTypes = [
  "other",
  "parking",
  "whiteLine",
  "plastic",
  "concrete",
  "padding",
];

const mainTypes = ["protected", "standard", "sharrow", "parkway", "none"];

const colsRadio = ["color", "blockedByCar", "blockedByOther", "construction"];

const radioChoiceOptions = ["unknown", "yes", "no"];

const colsText = ["notes", "urlStreetView", "dateStreetView"];

export const LabelView = (props) => {
  const { id, segment } = props;
  if (segment == undefined) {
    return <div />;
  }
  const { geometry, labels } = segment;

  const dispatch = useDispatch();

  const colsTextDefaults = {};
  for (const col of colsText) {
    colsTextDefaults[col] = labels == undefined ? "" : labels[col];
  }

  const choiceDefaults = {};
  for (const col of colsRadio) {
    choiceDefaults[col] =
      labels == undefined ? radioChoiceOptions[0] : labels[col];
  }

  const mainTypeDefault = labels == undefined ? "none" : labels.mainType;
  const protectionTypeDefault =
    labels == undefined ? "other" : labels.protectionType;

  const [mainType, setMainType] = useState(mainTypeDefault);
  const [protectionType, setProtectionType] = useState(protectionTypeDefault);
  const [radioChoices, setRadioChoices] = useState(choiceDefaults);
  const setRadioChoiceByCol = (col, value) => {
    setRadioChoices({ ...radioChoices, [col]: value });
  };
  const [certainty, setCertainty] = useState(100);
  const [texts, setTexts] = useState(colsTextDefaults);

  const setTextsByCol = (col, value) => {
    setTexts({ ...texts, [col]: value });
  };
  const onClick = () => {
    const addedValues = {
      mainType,
      protectionType,
      certainty,
      ...texts,
      ...radioChoices,
    };
    const fullData = { ...segment, labels: addedValues };
    addToDb(id, fullData);
    dispatch(labelSegment(fullData));
  };
  const selectMainType = (
    <Select
      value={mainType}
      onChange={(event) => setMainType(event.target.value)}
    >
      {mainTypes.map((type) => {
        return (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        );
      })}
    </Select>
  );

  const getRadioGroup = (col) => {
    return (
      <React.Fragment key={col}>
        <Grid xs={4}>{col}</Grid>
        <Grid xs={8}>
          <RadioGroup
            row
            value={radioChoices[col]}
            onChange={(event) => setRadioChoiceByCol(col, event.target.value)}
          >
            <FormControlLabel
              value="unknown"
              control={<Radio />}
              label="Unknown"
            />
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>
      </React.Fragment>
    );
  };

  const certaintySlider = (
    <Slider
      value={certainty}
      onChange={(event) => setCertainty(event.target.value)}
      min={0}
      max={100}
      step={1}
    />
  );

  const getTextField = (col) => {
    return (
      <React.Fragment key={col}>
        <Grid xs={4}>{col}</Grid>
        <Grid xs={8}>
          <TextField
            fullWidth
            value={texts[col]}
            onChange={(event) => setTextsByCol(col, event.target.value)}
          />
        </Grid>
      </React.Fragment>
    );
  };
  const selectProtectionType = (
    <Select
      value={protectionType}
      onChange={(event) => setProtectionType(event.target.value)}
    >
      {protectionTypes.map((type) => {
        return (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        );
      })}
    </Select>
  );

  if (segment == undefined) {
    return <div />;
  }

  return (
    <Grid container rowSpacing={2}>
      <Grid xs={4}>Label</Grid>
      <Grid xs={8}>{id}</Grid>
      <Grid xs={4}>
        <Typography>Main Type:</Typography>
      </Grid>
      <Grid xs={8}>{selectMainType}</Grid>
      <Grid xs={4}>
        <Typography>Protection Type:</Typography>
      </Grid>
      <Grid xs={8}>{selectProtectionType}</Grid>
      {colsRadio.map((col) => getRadioGroup(col))}
      <Grid xs={4}>Certainty</Grid>
      <Grid xs={8}>{certaintySlider}</Grid>
      {colsText.map((col) => getTextField(col))}
      <Grid xs={4}>
        <Typography>
          Location:{" "}
          {JSON.stringify(geometry.map((x) => parseFloat(x.toFixed(5))))}
        </Typography>
      </Grid>
      <Grid xs={8}>{linkToGoogleMaps(geometry)}</Grid>

      <Grid xs={6}>
        <Button fullWidth size="large" variant="outlined" onClick={onClick}>
          Save / Update
        </Button>
      </Grid>
      <Grid xs={6}>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          onClick={() => {
            dispatch(deleteLabel(id));
            deleteFromDb(id);
          }}
        >
          Delete
        </Button>
      </Grid>
    </Grid>
  );
};
