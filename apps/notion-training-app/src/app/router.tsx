import { BrowserRouter, Route, Routes } from "react-router-dom";

import TrainingLogDetail from "../pages/TrainingLogDetail";
import TrainingLogs from "../pages/TrainingLogs";
import HomePage from "../pages/home/HomePage";

export function RootRouter() {
  return (
    <BrowserRouter basename="/notion-training-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training-logs" element={<TrainingLogs />} />
        <Route path="/training-logs/:id" element={<TrainingLogDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
