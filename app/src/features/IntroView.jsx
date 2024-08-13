import React from "react";
import Typography from "@mui/material/Typography";
import { texts } from "../texts";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2";
import { ImageExampleView, getImageUrl } from "./ImageExampleView";
import { Image } from "../helpers/helpersUI";
import { MapViewPublic } from "./MapViewPublic";
import { Paper } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";

const FeatureCard = (props) => {
  const { name, description, iconElement } = props;

  return (
    <Card sx={{ width: "100%", maxWidth: 500, margin: "10px" }}>
      <CardContent>
        <Grid container alignItems="center">
          <Grid xs={2}>{iconElement}</Grid>
          <Grid xs={10}>
            <Typography gutterBottom variant="h5" component="div">
              {name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const Footer = () => {
  return (
    <Grid container sx={{ width: "100%", borderTop: `1px solid grey` }}>
      <Grid xs={12}>
        <Typography textAlign={"center"}>
          &copy; 2024, Chris Goldammer:{" "}
          <a href={"mailto:" + texts.email}>email</a> {" // "}
          <a target="_blank" href="https://chrisgoldammer.com">
            homepage
          </a>{" "}
          {" // "}
          <a href="https://github.com/cgoldammer/bikelanes">github repo</a>
        </Typography>
      </Grid>
    </Grid>
  );
};

export const IntroView = () => (
  <Grid
    container
    columnSpacing={2}
    rowSpacing={2}
    maxWidth={"sm"}
    justifyContent="center"
    alignItems="center"
    style={{ minHeight: "100vh", margin: "0 auto" }}
  >
    <Grid xs={12}>
      <Typography variant="h1" role="title" style={{ textAlign: "justify" }}>
        {texts.projectName}
      </Typography>
      <Typography variant="h4" style={{ color: "red" }}>
        {texts.notes}
      </Typography>
    </Grid>
    <Grid xs={12}>
      <Typography variant="h4" style={{ color: "red" }}>
        This is time intensive, and I want your feedback so I can label the
        right way. Send me an <a href={"mailto:" + texts.email}>email</a> with
        your thoughts!
      </Typography>
    </Grid>
    <Grid xs={12}>
      <Typography variant="h4" textAlign="justify">
        {texts.projectDescription}
      </Typography>
    </Grid>
    <Grid xs={12}>
      <Typography style={{ textAlign: "justify" }}>
        {texts.projectSee}
      </Typography>
    </Grid>
    <Grid container>
      <Grid xs={12} sm={6}>
        <Grid xs={12} textAlign="center">
          <Image
            component="img"
            src={getImageUrl("protection_separation")}
            width="200px"
            height="150px"
          />
        </Grid>
        <Grid xs={12} textAlign="center">
          <Typography variant="h4">{"=> Separated"}</Typography>
        </Grid>
      </Grid>

      <Grid xs={12} sm={6}>
        <Grid xs={12} textAlign="center">
          <Image
            component="img"
            src={getImageUrl("protection_white_line")}
            width="200px"
            height="150px"
          />
        </Grid>
        <Grid xs={12} textAlign="center">
          <Typography variant="h4">{"=> Paint"}</Typography>
        </Grid>
      </Grid>
    </Grid>

    <Grid xs={12}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h3">{texts.sections.detailsHeader}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {" "}
          <Grid container rowSpacing={4}>
            <Grid xs={12} rowSpacing={4}>
              <Typography textAlign="justify">
                {texts.sections.technicalDetail}
              </Typography>
              <Typography textAlign="justify">
                {texts.sections.technicalDetail2}
              </Typography>
              <Typography>
                {" "}
                See earlier{" "}
                <a
                  target="_blank"
                  href="https://cgoldammer.github.io/bikelanes/report"
                >
                  analysis (from 2023)
                </a>{" "}
                for a more quantitative approach.
              </Typography>
            </Grid>
          </Grid>
          <Box textAlign="center" justifyContent={"center"}>
            <Button
              variant="outlined"
              href="mailto:goldammer.christian@gmail.com"
              sx={{ marginTop: "10px" }}
            >
              <Typography variant="h3">Email me</Typography>
            </Button>
          </Box>
          <Grid>
            <Grid xs={12}>
              <Typography variant="h4">
                {texts.sections.comingUpHeader}
              </Typography>
            </Grid>
            <Grid xs={12}>
              {Object.keys(texts.comingUp).map((key) => {
                return (
                  <FeatureCard
                    key={key}
                    name={texts.comingUp[key].name}
                    iconElement={texts.comingUp[key].icon}
                    description={texts.comingUp[key].description}
                  />
                );
              })}
            </Grid>
            <Grid xs={12}>
              <Typography
                variant="h3"
                sx={{ marginTop: "10px", marginBottom: "10px" }}
              >
                {texts.sections.exampleImagesHeader}
              </Typography>
            </Grid>
            <Grid xs={12}>
              <ImageExampleView />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
    <MapViewPublic />

    <Footer />
  </Grid>
);
