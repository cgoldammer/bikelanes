import data from "../data/data.json";
import { protectionDataForProperties } from "../helpers/location";
import { filterDictByKeys } from "../helpers/helpers";

export const getIdStreet = (properties) => {
  return properties.fromstreet + " to " + properties.tostreet;
};

export const colsToAdd = [
  "urlStreetView",
  "certainty",
  "blockedByCar",
  "blockedByOther",
  "notes",
  "protectionType",
  "mainType",
  "x",
  "y",
];

const addDistanceToLabel = (coordinates, label) => {
  const { x, y } = label;
  const [x1, y1] = coordinates[0][0];
  const distance = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  return { ...label, distance };
};

const certaintyCutoff = 80;

export const getBestLabel = (labels, properties, geometry) => {
  const labelsMatchingStreet = labels.filter((label) => {
    const { fromstreet, tostreet } = label;
    return (
      fromstreet === properties.fromstreet &&
      tostreet === properties.tostreet &&
      label.certainty > certaintyCutoff
    );
  });

  if (labelsMatchingStreet.length == 0) {
    return undefined;
  }

  // Add the distance of label to the geometry
  const { coordinates } = geometry;

  const withDist = labelsMatchingStreet.map((label) =>
    addDistanceToLabel(coordinates, label)
  );

  // Sort by distance and return first
  withDist.sort((a, b) => a.distance - b.distance);
  const first = withDist[0];

  // Restrict to colsToAdd
  const restricted = filterDictByKeys(first, colsToAdd);

  return restricted;
};

const addBestLabelToFeature =
  (labels, excludeNonMatch = true) =>
  (feature) => {
    const { properties, geometry } = feature;
    const bestLabel = getBestLabel(labels, properties, geometry);
    if (bestLabel === undefined && excludeNonMatch) {
      return undefined;
    }
    const fullProperties = { ...properties, ...bestLabel };
    const protectionData = protectionDataForProperties(fullProperties);
    return {
      ...feature,
      properties: { ...fullProperties, ...protectionData },
    };
  };

export const mergeDataGeoJson = (labels, routes, excludeNonMatch = true) => {
  const features = routes.features.map(
    addBestLabelToFeature(labels, excludeNonMatch)
  );
  const featuresClean = features.filter((feature) => feature != undefined);
  return { ...routes, features: featuresClean };
};

export const propertyHasLabel = (properties) =>
  Object.keys(properties).includes("urlStreetView");

export const featureHasLabel = (feature) => {
  const { properties } = feature;
  return propertyHasLabel(properties);
};

const getLength = (properties) => {
  return properties
    .map((property) => parseFloat(property.shape_leng))
    .reduce((a, b) => a + b, 0);
};

const getPerformance = (properties) => {
  const numProperties = properties.length;
  const sumOfLenghts = getLength(properties);
  if (numProperties == 0) {
    return { numProperties, numMatches: 0, percent: "0%" };
  }
  const matches = properties.filter((property) => propertyHasLabel(property));
  const numMatches = matches.length;
  const matchSumOfLength = getLength(matches);

  const percent = ((numMatches / numProperties) * 100).toFixed(0) + "%";
  const percentLength =
    ((matchSumOfLength / sumOfLenghts) * 100).toFixed(0) + "%";
  return { numProperties, numMatches, percent, percentLength };
};

export const getStats = (labels, properties) => {
  const res = {
    numLabels: labels.length,
  };
  return { ...res, ...getPerformance(properties) };
};
