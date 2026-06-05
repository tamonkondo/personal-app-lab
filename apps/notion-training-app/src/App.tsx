import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import TrainingLogs from "./pages/TrainingLogs";
import TrainingLogDetail from "./pages/TrainingLogDetail";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/training-logs" element={<TrainingLogs />} />
      <Route path="/training-logs/:id" element={<TrainingLogDetail />} />
    </Routes>
  );
}
