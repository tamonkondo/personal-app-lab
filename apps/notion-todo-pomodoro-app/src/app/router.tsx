import { BrowserRouter } from "react-router-dom";

import { App } from "../App";

export function RootRouter() {
  return (
    <BrowserRouter basename="/notion-todo-pomodoro">
      <App />
    </BrowserRouter>
  );
}
