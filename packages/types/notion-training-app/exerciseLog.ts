import type { PaginatedResponse } from "../index";
import type { ExerciseSetBase } from "./exerciseSet";

export type ExerciseLogWithSetsItemResponse = {
  exerciseLogId: string;
  exerciseId: string;
  createdTime: string;
  rest: number;
  trainingName: string;
  sets: ExerciseSetBase[];
  notionUrl: string;
};

export type ExerciseLogWithSetsResponse =
  PaginatedResponse<ExerciseLogWithSetsItemResponse>;
