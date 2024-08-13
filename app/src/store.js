import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import settingsReducer from "./reducers/settingsReducer";
import { getSegmentsFromDB } from "./helpers/location";
import mapStateReducer, {
  updateSegments,
  labelSegment,
} from "./reducers/mapStateReducer";

const listenerMiddleware = createListenerMiddleware();

const reducer = {
  settings: settingsReducer,
  mapState: mapStateReducer,
};

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware().prepend(listenerMiddleware.middleware);

export const store = configureStore({
  reducer: reducer,
  middleware: middleware,
});

export const asyncWait = async (ms) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const fetchDataForStartup = async (store) => {
  store.dispatch(updateSegments());

  const objectsInDB = getSegmentsFromDB();
  Object.values(objectsInDB).forEach((segment) => {
    store.dispatch(labelSegment(segment));
  });
};
