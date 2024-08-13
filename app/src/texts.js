import { Block } from "@mui/icons-material";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import React from "react";

const projectDescription = `
Helping you find the safest route, since 2024.
`;

const menuTexts = {
  about: "About",
};

const summaryLabels = {
  boro: "Boro",
  maxFacilit: "Lane",
  numProperties: "Total lane segments",
  numLabels: "Labels",
  numMatches: "Labelled",
  percent: "Labelled:",
};

const comingUp = {
  coverage: {
    name: "Coverage",
    description: "Increasing coverage towards 100%",
    icon: <CheckCircleOutlineIcon />,
  },
  blocked: {
    name: "Blocked",
    description: "Predict how likely the lane is blocked by cars",
    icon: <BlockIcon />,
  },
};

const shareLabelled = 15;

const projectSee = `NYC has lots of bike lanes, 
and the best ones are protected. 
But how are they in practice? We are labelling how protected they are.
Per official map, the lanes below are both protected.
I trust you decide which one you're rather be on.
`;

const technicalDetail = `
We review bike lanes using a combination of Satellite images 
and Google Street View. We label each lane segment
based on (1) how protectected it is, (2)
whether it's blocked by cars or construction
, (3) whether the lane has green color.
`;

const technicalDetail2 = `
This is work in progress. Feedback is crucial.

What features would you want?
`;

const notes = `
Just released (August 12, 2024). We've got
        around ${shareLabelled}% of protected lanes labelled and are working towards
        classifying all lanes.`;

export const texts = {
  email: "goldammer.christian@gmail.com",
  projectName: "Real Bike Maps of NYC",
  projectDescription: projectDescription,
  projectSee: projectSee,
  menuTexts: menuTexts,
  sections: {
    whyHeader: "Why",
    detailsHeader: "Technical details",
    technicalDetail: technicalDetail,
    technicalDetail2: technicalDetail2,
    comingUpHeader: "Coming later in 2024:",
    mapHeader: "Initial Results",
    exampleImagesHeader: "Examples for protected lanes:",
    mapViewPublic: `Results (${shareLabelled}% of protected lanes labelled)`,
  },
  filterNames: {
    byProtection: "Filter by Lane Type",
  },
  legendNames: {
    protection: '"Protected" lanes (green=best, red=worst)',
    other: "Other Lanes",
    title: "Note: Click color on legend to toggle",
  },
  summaryLabels: summaryLabels,
  summaryView: { header: "Summary" },
  exampleImageAccordion: "Show Example Images",
  comingUp: comingUp,
  notes: notes,
};
