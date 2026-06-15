import type { ExerciseSetItemResponse } from "./exerciseSet";

export type ExerciseLogWithSetsItemResponse = {
  exerciseId: string;
  createdTime: string;
  rest: number;
  trainingName: string;
  sets: ExerciseSetItemResponse[];
  notionUrl: string;
};
