import React from "react";
import { CenteredGrid } from "../helpers/helpersUI";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { texts } from "../texts";
import { Link as RouterLink } from "react-router-dom";

export const AboutView = () => {
  const emailLink = `mailto:${texts.email}`;
  const feedbackLink = `/feedback`;
  return (
    <Grid container>
      <Grid xs={12} sx={{ margin: "10px" }}>
        <Typography variant="h1">{texts.aboutHeader}</Typography>
      </Grid>
      <Grid xs={12} sx={{ margin: "10px" }}>
        <Typography variant="body1">{texts.aboutText}</Typography>
      </Grid>
      <Grid xs={12} sx={{ margin: "10px" }}>
        <Typography>
          {texts.createdBy}{" "}
          <a href={texts.homepage} target="_blank" rel="noopener noreferrer">
            {texts.myName}
          </a>
        </Typography>
      </Grid>
      <Grid xs={12} sx={{ margin: "10px" }}>
        <Typography component={RouterLink} to={feedbackLink}>
          {texts.feedback}
        </Typography>
      </Grid>
      <Grid xs={12} sx={{ margin: "10px" }}>
        <Typography>
          <a href={emailLink}>{texts.emailUsText}</a>
        </Typography>
      </Grid>
    </Grid>
  );
};
