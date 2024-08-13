import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider, Container } from "@mui/material";

import { FooterView } from "./features/FooterView";

import { TopMenu } from "./features/MenuView";
import { IntroView } from "./features/IntroView";
import { AboutView } from "./features/AboutView";
import { AdminView } from "./features/AdminView";
import { useSelector } from "react-redux";
import { MapView, SearchView } from "./features/MapView";
import { useTheme } from "@mui/material/styles";
import { TableStored } from "./features/TableStored";
import { LabelView } from "./features/LabelView";
import { SummaryView } from "./features/SummaryView";
import { SearchViewPublic } from "./features/MapViewPublic";
import Grid2 from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";

const TestLabelView = () => {
  const segments = useSelector((state) => state.mapState.segments);
  if (Object.keys(segments).length === 0) {
    return <div>No segments</div>;
  }
  const id = Object.keys(segments)[0];
  return <LabelView id={id} segment={segments[id]} />;
};

const sections = (settings) => {
  const views = {
    // nav: TopMenu,
    // summary: SummaryView,
    intro: IntroView,
    // admin: AdminView,

    // map: SearchView,
    // footer: FooterView,
    // results: TableStored,
  };

  /* Only keep the views that are enabled in settings. */
  const viewsVisibleList = settings.viewsVisible;
  const viewsVisible = {};
  viewsVisibleList.forEach((view) => {
    if (views[view]) {
      viewsVisible[view] = views[view];
    }
  });
  return viewsVisible;
};

const sectionsDiv = (settings) => {
  const sectionViews = sections(settings);

  const sectionView = (section) => {
    const SectionComponent = sectionViews[section];
    return (
      <Grid
        key={section}
        xs={12}
        id={"section" + section}
        sx={{ margin: "10px 0px 10px 0px" }}
      >
        <SectionComponent />
      </Grid>
    );
  };

  return <Grid container>{Object.keys(sectionViews).map(sectionView)}</Grid>;
};

/* The main app, which pulls in all the other windows. */
export function App() {
  const settings = useSelector((state) => state.settings);
  const sectionsDivFull = sectionsDiv(settings);
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Container
          maxWidth="xl"
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Grid container justifyContent="center" alignItems="center">
            <Grid container justifyContent="center" alignItems="center" xs={12}>
              <Routes>
                <Route path="/" element={sectionsDivFull} />
                <Route path="/about" element={<AboutView />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </CssBaseline>
    </ThemeProvider>
  );
}
