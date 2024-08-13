import { getRoutes } from "../helpers/location";
import {
  getBestLabel,
  mergeDataGeoJson,
  colsToAdd,
} from "../helpers/summarize";
import { routesCleaned } from "./locationLarge";
import { filterDictByKeys } from "../helpers/helpers";

const testCoordinates = [
  [
    [0, 0],
    [1, 1],
  ],
];
const testLoc = {
  fromstreet: "a",
  tostreet: "b",
};

const testFeature = {
  properties: testLoc,
  geometry: {
    coordinates: testCoordinates,
  },
};

const testLoc2 = {
  fromstreet: "a",
  tostreet: "z",
};

const testFeature2 = {
  properties: testLoc2,
  geometry: {
    coordinates: testCoordinates,
  },
  certainty: 100,
};

const testRowGood = {
  ...testLoc,
  x: testCoordinates[0][0][0],
  y: testCoordinates[0][0][1],
  certainty: 100,
};

const testRowBadStreet = {
  fromstreet: "a",
  tostreet: "c",
  ...testRowGood,
};

const labelsByStreet = [testRowGood, testRowBadStreet];

const testRowBadLocation = {
  x: testCoordinates[0][0][0],
  y: testCoordinates[0][0][1] + 1,
  ...testRowGood,
};

const labelsByLocation = [testRowBadLocation, testRowGood];

describe("Test routes", () => {
  test("getRoutes works", () => {
    const num = 100;
    const routes = getRoutes(routesCleaned, true, num);
    expect(routes.features.length).toEqual(num);
  });

  test("getting best label works by street", () => {
    const { properties, geometry } = testFeature;
    const resultExpected = filterDictByKeys(testRowGood, colsToAdd);

    const result = getBestLabel(labelsByStreet, properties, geometry);
    expect(result).toEqual(resultExpected);
  });

  test("getting best label works by location", () => {
    const { properties, geometry } = testFeature;
    const resultExpected = filterDictByKeys(testRowGood, colsToAdd);
    const result = getBestLabel(labelsByLocation, properties, geometry);
    expect(result).toEqual(resultExpected);
  });

  test("merging works", () => {
    const testGeo = {
      features: [testFeature, testFeature2],
    };

    const resultExclude = mergeDataGeoJson(labelsByStreet, testGeo, true);
    expect(resultExclude.features.length).toEqual(1);

    const resultAll = mergeDataGeoJson(labelsByStreet, testGeo, false);
    expect(resultAll.features.length).toEqual(testGeo.features.length);
  });
});
