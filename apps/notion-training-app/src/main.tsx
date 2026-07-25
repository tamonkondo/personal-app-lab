import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { ErrorBoundary } from "@repo/ui";

import { RootRouter } from "./app/router";
import "./index.css";
import "./lib/sentry"; // Sentryの初期化を行う

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary onError={(error) => Sentry.captureException(error)}>
      <RootRouter />
    </ErrorBoundary>
  </React.StrictMode>,
);
