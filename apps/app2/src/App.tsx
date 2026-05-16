import { Route, Routes } from "react-router-dom";

import { ExamplePage } from "./features/example/pages/ExamplePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ExamplePage />} />
    </Routes>
  );
}
