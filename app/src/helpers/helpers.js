import { v4 as uuidv4 } from "uuid";

export const runMode = process.env.RUNMODE;
export const RUNMODE_DEV = "devLocal";
export const RUNMODE_MOCK = "devMock";
export const isDev = runMode == RUNMODE_DEV || runMode == RUNMODE_MOCK;

export const getRange = (max) => Array.from(Array(max), (n, index) => index);

export const getRandomSample = (arr, size) => {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }

  return shuffled.slice(0, size);
};

export const getRandomSampleDict = (dict, size) => {
  const keys = Object.keys(dict);
  const keysSample = getRandomSample(keys, size);
  return filterDictByKeys(dict, keysSample);
};

export const getRandomSampleShare = (arr, share) =>
  getRandomSample(arr, Math.floor(arr.length * share));

const valuesNotFoundInRight = (a, b) => a.filter((e) => !b.includes(e));

export const listElementsAreIdentical = (a, b) => {
  const valuesNotFound =
    a.length > b.length
      ? valuesNotFoundInRight(a, b)
      : valuesNotFoundInRight(b, a);
  return valuesNotFound.length == 0;
};

export const listToDictWithFunction = (xList, func) => {
  return xList.reduce((acc, x) => {
    acc[func(x)] = x;
    return acc;
  }, {});
};

export const listOfListToList = (listOfList) => {
  return listOfList.reduce((acc, x) => {
    acc.push(...x);
    return acc;
  }, []);
};
export const isJestRun = () => {
  return process.env.JEST_WORKER_ID !== undefined;
};

export const arrowStringToDict = (arrowString) => {
  const from = arrowString.slice(0, 2);
  const to = arrowString.slice(2, 4);
  return { from: from, to: to };
};

export const arrowDictToString = (arrowDict) => {
  return arrowDict.from + arrowDict.to;
};

export const filterDictByKeys = (dict, keys) => {
  return Object.keys(dict)
    .filter((key) => keys.includes(key))
    .reduce((obj, key) => {
      obj[key] = dict[key];
      return obj;
    }, {});
};

export const mapDictOnFunction = (dict, func) => {
  return Object.keys(dict).reduce((acc, key) => {
    acc[key] = func(dict[key]);
    return acc;
  }, {});
};

export const filterDictByFunctionOnValues = (dict, func) => {
  return Object.keys(dict)
    .filter((key) => func(dict[key]))
    .reduce((obj, key) => {
      obj[key] = dict[key];
      return obj;
    }, {});
};

export const groupDictByKey = (dict, keyGetter) => {
  return Object.values(dict).reduce((acc, value) => {
    const key = keyGetter(value);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(value);
    return acc;
  }, {});
};

export const inverseDict = (dict) => {
  return Object.entries(dict).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
};
