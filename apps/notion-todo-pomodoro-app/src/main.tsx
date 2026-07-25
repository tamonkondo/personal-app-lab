import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "@repo/ui";

import { RootRouter } from "./app/router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RootRouter />
    </ErrorBoundary>
  </React.StrictMode>,
);
