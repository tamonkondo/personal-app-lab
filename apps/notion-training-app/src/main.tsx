import React from "react";
import ReactDOM from "react-dom/client";

import { RootRouter } from "./app/router";
import "./index.css";
import "./lib/sentry"; // Sentryの初期化を行う

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
);
