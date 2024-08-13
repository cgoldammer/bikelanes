import {
  protectedTypesDict,
  getProtectionId,
  protectionDataForProperties,
  colorGreenway,
  protectedName,
  allValues,
  createSegments,
  getIdForStreet,
} from "./location";

import { routesCleaned } from "./locationLarge";

describe("Key functions work", () => {
  test("Protected types", () => {
    const key = getProtectionId("Protected Path", "parking");
    expect(Object.keys(protectedTypesDict).includes(key)).toBe(true);
  });

  test("Adding greenway works", () => {
    const propStart = {
      maxFacilit: "Greenway",
    };
    const propsAfter = protectionDataForProperties(propStart);
    expect(propsAfter.protectionColorFallback).toEqual(colorGreenway);
  });
  test("Adding protected works", () => {
    const propStart = {
      maxFacilit: protectedName,
      protectionType: "concrete",
    };
    const valueExpected = 10;
    const propsAfter = protectionDataForProperties(propStart);
    expect(propsAfter.protectionValue).toEqual(valueExpected);
  });
  test("All values are good", () => {
    expect(allValues.length).toBeGreaterThan(0);
  });
});

describe("Segments work", () => {
  test("Segments cover all streets in the routes", () => {
    const routesCleanedSmall = {
      ...routesCleaned,
      features: routesCleaned.features.slice(0, 100),
    };
    const segments = createSegments(routesCleanedSmall);

    const idsInRoutes = routesCleanedSmall.features.map((feature) =>
      getIdForStreet(feature.properties)
    );
    const idsInSegments = Object.values(segments).map((segment) =>
      getIdForStreet(segment.properties)
    );
    const idsInRoutesSet = new Set(idsInRoutes);
    const idsInSegmentsSet = new Set(idsInSegments);
    expect(idsInRoutesSet).toEqual(idsInSegmentsSet);
  });
});
