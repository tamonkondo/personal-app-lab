import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import TaskListPage from "../pages/tasks/TaskListPage";
import ProjectsPage from "../pages/projects/ProjectsPage";

export function RootRouter() {
  return (
    <BrowserRouter basename="/notion-todo-pomodoro-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
