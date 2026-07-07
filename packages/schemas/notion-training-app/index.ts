
export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;

export const exerciseDetailParamsSchema = z.object({
  trendPeriod: z.enum(EXERCISE_TREND_PERIODS).nullable().catch(null),
  exerciseGuideLineRep: z.enum(EXERCISE_GUIDE_LINE_REPS).nullable().catch(null),
});

export type ExerciseDetailParams = z.infer<typeof exerciseDetailParamsSchema>;
