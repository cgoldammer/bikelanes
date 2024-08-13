import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material";
import { theme } from "./helpers/helpersUI.jsx";
import { IntroView } from "./features/IntroView.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { Grid2 } from "@mui/material/Unstable_Grid2";
import { Paper, Typography } from "@mui/material";

const root = createRoot(document.getElementById("root"));
const app = (
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <IntroView />
      </CssBaseline>
    </ThemeProvider>
  </React.StrictMode>
);
root.render(app);
