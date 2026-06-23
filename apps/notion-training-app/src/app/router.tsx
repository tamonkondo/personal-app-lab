import { BrowserRouter, Route, Routes } from "react-router-dom";

import ExerciseLogDetail from "../pages/ExerciseLogDetail";
import ExerciseLogList from "../pages/ExerciseLogList";
import TrainingLogDetail from "../pages/TrainingLogDetail";
import TrainingLogList from "../pages/TrainingLogList";
import HomePage from "../pages/home/HomePage";

export function RootRouter() {
  return (
    <BrowserRouter basename="/notion-training-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training-logs" element={<TrainingLogList />} />
        <Route path="/training-logs/:id" element={<TrainingLogDetail />} />
        <Route path="/exercise-logs" element={<ExerciseLogList />} />
        <Route path="/exercise-logs/:id" element={<ExerciseLogDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
