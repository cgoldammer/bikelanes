import React from "react";
import { App } from "./App.jsx";
import { store, fetchDataForStartup } from "./store";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { isJestRun } from "./helpers/helpers";
import { ThemeProvider } from "@mui/material";
import { theme } from "./helpers/helpersUI";

const isJest = isJestRun();
const isMock = process.env.RUNMODE === "devMock";

const root = createRoot(document.getElementById("root"));

const displayApp = () => {
  const app = (
    <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
  root.render(app);
};

const startApp = async () => {
  await fetchDataForStartup(store);
  displayApp();
};

startApp();
