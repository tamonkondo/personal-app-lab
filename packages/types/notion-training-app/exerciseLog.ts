import type { ExerciseSetBase } from "./exerciseSet";

export type ExerciseLogWithSetsItemResponse = {
  exerciseId: string;
  createdTime: string;
  rest: number;
  trainingName: string;
  sets: ExerciseSetBase[];
  notionUrl: string;
};
