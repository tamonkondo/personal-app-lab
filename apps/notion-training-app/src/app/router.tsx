import { BrowserRouter, Route, Routes } from "react-router-dom";

import ExerciseDetail from "../pages/ExerciseDetail";
import ExerciseList from "../pages/ExerciseList";
import TrainingLogDetail from "../pages/TrainingLogDetail";
import TrainingLogList from "../pages/TrainingLogList";
import HomePage from "../pages/home/HomePage";

export function RootRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training-logs" element={<TrainingLogList />} />
        <Route
          path="/training-logs/:trainingId"
          element={<TrainingLogDetail />}
        />
        <Route path="/exercises" element={<ExerciseList />} />
        <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
