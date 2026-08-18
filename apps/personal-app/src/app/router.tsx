import { BrowserRouter, Route, Routes } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";
import HomePage from "../pages/HomePage";
import ExerciseDetail from "../pages/training/ExerciseDetail/ExerciseDetail";
import ExerciseEdit from "../pages/training/ExerciseEdit";
import ExerciseList from "../pages/training/ExerciseList";
import ExerciseNew from "../pages/training/ExerciseNew";
import TrainingHome from "../pages/training/TrainingHome";
import TrainingLogDetail from "../pages/training/TrainingLogDetail";
import TrainingLogEdit from "../pages/training/TrainingLogEdit";
import TrainingLogList from "../pages/training/TrainingLogList";
import TrainingLogNew from "../pages/training/TrainingLogNew";
import FocusPage from "../pages/todo/FocusPage";
import ProjectsPage from "../pages/todo/ProjectsPage";
import TaskListPage from "../pages/todo/TaskListPage";
import { AppLayout } from "./AppLayout";

export function RootRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />

      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* トレーニング記録 */}
          <Route path="/training" element={<TrainingHome />} />
          <Route path="/training/logs" element={<TrainingLogList />} />
          <Route path="/training/logs/new" element={<TrainingLogNew />} />
          <Route
            path="/training/logs/:trainingId"
            element={<TrainingLogDetail />}
          />
          <Route
            path="/training/logs/:trainingId/edit"
            element={<TrainingLogEdit />}
          />
          <Route path="/training/exercises" element={<ExerciseList />} />
          <Route path="/training/exercises/new" element={<ExerciseNew />} />
          <Route
            path="/training/exercises/:exerciseId"
            element={<ExerciseDetail />}
          />
          <Route
            path="/training/exercises/:exerciseId/edit"
            element={<ExerciseEdit />}
          />

          {/* Todo / ポモドーロ */}
          <Route path="/todo" element={<FocusPage />} />
          <Route path="/todo/tasks" element={<TaskListPage />} />
          <Route path="/todo/projects" element={<ProjectsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
