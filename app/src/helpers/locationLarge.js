import bikeroutes from "../features/bikeroutes.json";
import { transformGeoProperties, formatProperties } from "./location";

export const routesCleaned =
  transformGeoProperties(formatProperties)(bikeroutes);
