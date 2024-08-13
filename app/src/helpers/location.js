import {
  groupDictByKey,
  inverseDict,
  getRandomSample,
  filterDictByFunctionOnValues,
  listToDictWithFunction,
  filterDictByKeys,
} from "./helpers";

export const locationDiff = (a, b) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

export const arrayToLocation = (arr) => {
  if (arr == undefined) {
    return undefined;
  }
  return { x: arr[1], y: arr[0] };
};

export const locationToArray = (location) => {
  if (location == undefined) {
    return undefined;
  }
  return [location.y, location.x];
};

export const toFixedLocation = (location, digits) => {
  return { x: location.x.toFixed(digits), y: location.y.toFixed(digits) };
};

export const filterGeoJson = (geoJson, filterFunc) => {
  const features = geoJson.features;
  const filteredFeatures = features.filter((feature) => {
    return filterFunc(feature.properties);
  });
  return { ...geoJson, features: filteredFeatures };
};

export const addressEqual = (a, b) => {
  return a.toLowerCase() == b.toLowerCase();
};

export const transformGeoProperties = (transformer) => (geoJson) => {
  const features = geoJson.features;
  const transformedFeatures = features.map((feature) => {
    const transformedProperties = transformer(feature.properties);
    return { ...feature, properties: transformedProperties };
  });
  return { ...geoJson, features: transformedFeatures };
};

const idStub = "segment__";

const getStorageId = (id) => {
  return idStub + id;
};

const removeStub = (key) => {
  return key.slice(idStub.length);
};

export const getFromDb = (id) => {
  const values = localStorage.getItem(getStorageId(id)) || undefined;
  if (values == undefined) {
    return undefined;
  }
  return JSON.parse(values);
};

export const addToDb = (id, segmentLabelled) => {
  localStorage.setItem(getStorageId(id), JSON.stringify(segmentLabelled));
  return id;
};

export const deleteFromDb = (id) => {
  localStorage.removeItem(getStorageId(id));
};

const geomLengthOfArr = (arr) => {
  var totalLength = 0;
  for (let i = 0; i < arr.length; i++) {
    const start = arrayToLocation(arr[i][0]);
    const end = arrayToLocation(arr[i][1]);
    totalLength += locationDiff(start, end);
  }
  return totalLength;
};

const getPointAtShare = (arr, share) => {
  const geomLength = geomLengthOfArr(arr);
  const targetLength = geomLength * share;
  let currentLength = 0;
  for (let i = 0; i < arr.length; i++) {
    const start = arrayToLocation(arr[i][0]);
    const end = arrayToLocation(arr[i][1]);
    const length = locationDiff(start, end);
    if (currentLength + length >= targetLength) {
      const shareLeft = targetLength - currentLength;
      const x = (end.x - start.x) * (shareLeft / length) + start.x;
      const y = (end.y - start.y) * (shareLeft / length) + start.y;
      return locationToArray({ x: x, y: y });
    }
    currentLength += length;
  }
  return undefined;
};

const featureToSegments = (feature) => {
  const coordinatesArr = feature.geometry.coordinates;
  const geomLength = geomLengthOfArr(coordinatesArr);
  const properties = feature.properties;

  const splitLength = 0.01;

  const sharesPerLength = Math.round(geomLength / splitLength, 0) + 1;
  const shares = Array.from(
    { length: sharesPerLength },
    (_, i) => i / sharesPerLength
  );

  const segments = shares.map((share) => {
    const point = getPointAtShare(coordinatesArr, share);

    return {
      id: properties.id + " || " + (share * 100).toFixed(0),
      properties: properties,
      geometry: point,
    };
  });
  return segments;
};

export const removeFromLocalStorage = (stubStart) => {
  // Remove everything starting with stubStart
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(stubStart)) {
      localStorage.removeItem(key);
    }
  });
};

export const getIdForStreet = (properties) =>
  properties.fromstreet + " / " + properties.tostreet;

export const getSegmentsFromDB = () => {
  const keys = Object.keys(localStorage);
  const segments = {};
  keys.forEach((key) => {
    if (key.startsWith(idStub)) {
      const id = removeStub(key);
      segments[id] = getFromDb(id);
    }
  });
  return segments;
};

export const laneTypeValues = {
  Greenway: 10,
  "Protected Path": 10,
  Standard: 5,
  Sharrows: 2,
};

export const boros = {
  manhattan: 1,
  bronx: 2,
  brooklyn: 3,
  queens: 4,
  statenIsland: 5,
};

export const getBoroName = (boroNumber) => inverseDict(boros)[boroNumber];

export const relColor = (share) => {
  const colorStart = [255, 0, 0];
  const colorEnd = [0, 255, 0];
  const x = colorStart[0] * share + colorEnd[0] * (1 - share);
  const y = colorStart[1] * share + colorEnd[1] * (1 - share);
  const z = colorStart[2] * share + colorEnd[2] * (1 - share);
  return `rgb(${x}, ${y}, ${z})`;
};

const getValue = (pathType) => {
  if (laneTypeValues[pathType]) {
    return laneTypeValues[pathType];
  }
  return 0;
};

export const getColor = (pathType) => {
  if (pathType != null && Object.keys(laneTypeValues).includes(pathType)) {
    if (laneTypeValues[pathType]) {
      return relColor(1 - laneTypeValues[pathType] / 10);
    }
  }
  return "yellow";
};

export const getColorExtended = (properties) => {
  const hasValue =
    Object.keys(properties).includes("protectionValue") &&
    properties.protectionValue != undefined;
  const hasColor = Object.keys(properties).includes("protectionColorFallback");

  if (hasValue) {
    const value = properties.protectionValue;
    return relColor(1 - value / 10);
  }

  if (hasColor) {
    return properties.protectionColorFallback;
  }

  return "white";
};

export const getMaxVal = (properties) => {
  const valTf = properties.tf_facilit;
  const valFt = properties.ft_facilit;

  const numTf = getValue(valTf);
  const numFt = getValue(valFt);

  // Return the string with the higher num
  if (numTf > numFt) {
    return valTf;
  }
  return valFt;
};

export const colorGreenway = "#8BC34A";
const colorFallback = "white";
export const protectedName = "Protected Path";
export const valsProtectectedTypes = [
  {
    maxFacilit: protectedName,
    protectionType: "padding",
    name: "Separate",
    value: 8,
    image: "protection_separation",
  },
  {
    maxFacilit: protectedName,
    protectionType: "parking",
    name: "Parking",
    value: 6,
    image: "protection_parking_2",
  },

  {
    maxFacilit: protectedName,
    protectionType: "concrete",
    name: "Concrete",
    value: 5,
  },
  {
    maxFacilit: protectedName,
    protectionType: "plastic",
    name: "Plastic",
    value: 4,
  },
  {
    maxFacilit: protectedName,
    protectionType: "whiteLine",
    name: "Paint",
    value: 2,
    image: "protection_white_line",
  },
  {
    maxFacilit: protectedName,
    protectionType: "other",
    name: "None",
    value: 0,
  },
  {
    maxFacilit: protectedName,
    name: "Unlabeled",
    color: "#D3D3D3",
  },
  { maxFacilit: "Standard", name: "Standard", color: "yellow" },
  {
    maxFacilit: "Greenway",
    name: "Greenway",
    color: colorGreenway,
    image: "parkway",
  },
];

export const getProtectionId = (maxFacilit, protectionType) => {
  return JSON.stringify({ maxFacilit, protectionType });
};

export const protectedTypesDict = listToDictWithFunction(
  valsProtectectedTypes,
  (x) => getProtectionId(x.maxFacilit, x.protectionType)
);

export const valsFallback = {
  protectionId: "other",
  protectionName: "Other",
  protectionColorFallback: colorFallback,
};

export const protectionDataForProperties = (properties) => {
  const protId = getProtectionId(
    properties.maxFacilit,
    properties.protectionType
  );

  const isContained = Object.keys(protectedTypesDict).includes(protId);

  const valsAdded = isContained
    ? {
        maxFacilit: properties.maxFacilit,
        protectionId: protId,
        protectionName: protectedTypesDict[protId].name,
        protectionColorFallback: protectedTypesDict[protId].color,
        protectionValue: protectedTypesDict[protId].value,
        exampleImage: protectedTypesDict[protId].image,
      }
    : valsFallback;

  return { ...valsAdded };
};

export const allValues = Object.values(protectedTypesDict)
  .map(protectionDataForProperties)
  .concat([valsFallback]);

export const formatProperties = (properties) => {
  const first = {
    ...properties,
    id:
      properties.segmentid +
      " || " +
      properties.fromstreet +
      " / " +
      properties.tostreet,
    boro: parseInt(properties.boro),
    shape_leng: parseFloat(properties.shape_leng),
    maxFacilit: getMaxVal(properties),
  };
  return {
    ...first,
  };
};

export const filterBrooklyn = (properties) => properties.boro == boros.brooklyn;

const lanesSelected = ["Standard", "Protected Path"];
export const laneFilter = (properties) =>
  lanesSelected.includes(properties.tf_facilit) ||
  lanesSelected.includes(properties.ft_facilit);

export const filterAll = (properties) => true;

export const getRoutesAsync = async (
  sample = false,
  defaultSample = 100,
  filter = allFilter
) => {
  const filename = "data/bikeroutes.json";
  const bikeroutesLoaded = fetch(filename).then((response) => response.json());
  const routes = await bikeroutesLoaded;
  return getRoutes(routes, sample, defaultSample, filter);
};

export function getRoutes(
  routesStart,
  sample = false,
  defaultSample = 100,
  filter = filterAll
) {
  const formatted2 = filterGeoJson(routesStart, filter);
  const features = formatted2.features;
  const featuresSampled = sample
    ? getRandomSample(features, defaultSample)
    : features;
  const formatted = {
    ...formatted2,
    features: featuresSampled,
  };

  return formatted;
}

export const linkToGoogleMaps = (locationArr) => {
  const { y, x } = arrayToLocation(locationArr);

  return `https://www.google.com/maps/search/?api=1&query=${x},${y}`;
};

export const createSegments = (geoJson) => {
  const features = geoJson.features;
  const groupedFeatures = groupDictByKey(features, (feature) =>
    getIdForStreet(feature.properties)
  );

  const segments = {};
  Object.keys(groupedFeatures).forEach((key) => {
    const featuresInId = groupedFeatures[key];
    const featuresSampled = getRandomSample(featuresInId, 5);
    for (const feature of featuresSampled) {
      const segmentsInFeature = featureToSegments(feature);
      segmentsInFeature.forEach((segment) => {
        segments[segment.id] = segment;
      });
    }
  });
  return segments;
};

export const getSegmentsSample = (segments, numUnlabelled) => {
  const labelled = filterDictByFunctionOnValues(
    segments,
    (segment) => segment.labels != undefined
  );
  const unlabelled = filterDictByFunctionOnValues(
    segments,
    (segment) => segment.labels == undefined
  );

  const keys = Object.keys(unlabelled);
  const unlabelledSample = filterDictByKeys(
    unlabelled,
    keys.slice(0, numUnlabelled)
  );
  return { ...unlabelledSample, ...labelled };
};

export const getGeojsonFromFilters = (routesCleaned, filters) => {
  // const filteredFirst = filterGeoJson(formatted, filterBrooklyn);

  var filtered = routesCleaned;

  const filterBoro = (properties) => properties.boro == filters.boroFilter;
  filtered = filterGeoJson(filtered, filterBoro);

  const filterLaneType = filters.laneTypesFilter;
  if (filterLaneType.length == 0) {
    return filtered;
  }

  const filterFunc = (properties) => {
    const laneType = properties.maxFacilit;
    return filterLaneType.includes(laneType);
  };

  filtered = filterGeoJson(filtered, filterFunc);

  return filtered;
};
