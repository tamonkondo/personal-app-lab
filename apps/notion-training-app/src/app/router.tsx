import { BrowserRouter, Route, Routes } from "react-router-dom";

import ExerciseDetail from "../pages/ExerciseDetail/ExerciseDetail";
import ExerciseList from "../pages/ExerciseList";
import ExerciseNew from "../pages/ExerciseNew";
import TrainingLogDetail from "../pages/TrainingLogDetail";
import TrainingLogList from "../pages/TrainingLogList";
import TrainingLogNew from "../pages/TrainingLogNew";
import HomePage from "../pages/home/HomePage";
import ScrollToTop from "../components/ScrollToTop";

export function RootRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training-logs" element={<TrainingLogList />} />
        <Route path="/training-logs/new" element={<TrainingLogNew />} />
        <Route
          path="/training-logs/:trainingId"
          element={<TrainingLogDetail />}
        />
        <Route path="/exercises" element={<ExerciseList />} />
        <Route path="/exercises/new" element={<ExerciseNew />} />
        <Route path="/exercises/:exerciseId" element={<ExerciseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
