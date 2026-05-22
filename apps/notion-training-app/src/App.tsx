import { Route, Routes } from "react-router-dom";

import { ExamplePage } from "./features/example/pages/ExamplePage";
import HomePage from "./pages/HomePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
