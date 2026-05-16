import { BrowserRouter } from "react-router-dom";

import { App } from "../App";

export function RootRouter() {
  return (
    <BrowserRouter basename="/app2">
      <App />
    </BrowserRouter>
  );
}
