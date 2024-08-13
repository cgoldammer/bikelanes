import { styled } from "@mui/system";
import { createTheme } from "@mui/material";
import { Box, Button } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import { grey } from "@mui/material/colors";

import PropTypes from "prop-types";

export const CenteredGrid = ({
  children,
  justifyContent = "center",
  alignItems = "center",
  ...otherProps
}) => {
  return (
    <Grid
      container
      justifyContent={justifyContent}
      alignItems={alignItems}
      {...otherProps}
    >
      {children}
    </Grid>
  );
};

CenteredGrid.propTypes = {
  justifyContent: PropTypes.oneOf([
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
    "space-evenly",
  ]),
  alignItems: PropTypes.oneOf([
    "flex-start",
    "center",
    "flex-end",
    "stretch",
    "baseline",
  ]),
  children: PropTypes.node,
};

export const boxFormat = {
  display: "grid",
  boxShadow: 2,
  marginTop: 2,
  marginBottom: 2,
  padding: 2,
  ":hover": {
    cursor: "pointer",
  },
};

export const mixColorsHex = (colorHex1, colorHex2, share1) => {
  const share2 = 1 - share1;
  const color1 = parseInt(colorHex1.slice(1), 16);
  const color2 = parseInt(colorHex2.slice(1), 16);
  const r1 = (color1 >> 16) & 255;
  const g1 = (color1 >> 8) & 255;
  const b1 = color1 & 255;
  const r2 = (color2 >> 16) & 255;
  const g2 = (color2 >> 8) & 255;
  const b2 = color2 & 255;
  const r = Math.round(r1 * share1 + r2 * share2);
  const g = Math.round(g1 * share1 + g2 * share2);
  const b = Math.round(b1 * share1 + b2 * share2);
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};

export const boxImgFormat = {
  width: 100,
  height: 100,
  borderRight: 1,
  borderColor: grey[50],
};

const font = "Lora, serif";

const baseColors = {
  white: "#FFFFFF",
  black: "#000000",
  yellow: "#FFFF00",
  // very very light yellow
  background: "#FFFFFC",
};

export const theme = createTheme({
  status: {
    danger: "#0040ff",
  },
  typography: {
    fontFamily: [font].join(","),
    fontWeightMedium: 800,
    fontWeightRegular: 500,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 800,
    },
    h2: {
      fontSize: "1.9rem",
      fontWeight: 800,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 800,
    },
    h4: {
      fontSize: "1.1rem",
      fontWeight: 600,
    },
  },
  components: {
    // Name of the component
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#000000",
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#E0C2FF",
      light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#47008F",
    },
    background: {
      default: baseColors.background,
    },
  },
});

export const styleImage = {
  borderWidth: "5px",
  borderRadius: "20px",
  boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
  opacity: 1.0,
  objectFit: "cover",
  backgroundSize: "cover",
};
export const Image = styled(Box)(styleImage);

const styleBorder = {
  borderWidth: "5px",
  borderRadius: "0px",
  boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
  opacity: 0.5,
  border: "5px solid grey", // Add a strong red border
  padding: "20px",
};

export const BorderedBox = styled(Box)(styleBorder);

export const NewButton = styled(Button)({
  backgroundColor: "red",
});

// Create sx settings that create an item
// that is a box with a soft rounded border that fades
// into the background
export const sxForItem = {
  borderWidth: "5px",
  borderRadius: "20px",
  boxShadow: "0 10px 10px rgba(0,0,0,0.2)",
  opacity: 1,
  width: "100%",
};
