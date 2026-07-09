import { z } from "zod";
import {
  EXERCISE_GUIDE_LINE_REPS,
  EXERCISE_TREND_PERIODS,
} from "@repo/types/notion-training-app";

const exercisesSets = z.object({
  kg: z.string(),
  rep: z.string(),
  memo: z.string(),
});
const exercisesSchema = z.object({
  exerciseId: z.string(),
  rest: z.number(),
  memo: z.string(),
  sets: z.array(exercisesSets),
});

export const createTrainingLogSchema = z.object({
  date: z.string(),
  bodyWeight: z.number(),
  memo: z.string(),
  exercises: z.array(exercisesSchema),
});

export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;

export const exerciseDetailParamsSchema = z.object({
  trendPeriod: z.enum(EXERCISE_TREND_PERIODS).nullable().catch(null),
  exerciseGuideLineRep: z.enum(EXERCISE_GUIDE_LINE_REPS).nullable().catch(null),
});

export type ExerciseDetailParams = z.infer<typeof exerciseDetailParamsSchema>;
