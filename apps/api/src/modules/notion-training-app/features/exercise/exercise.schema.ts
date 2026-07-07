import { EXERCISE_RM_TYPES } from "@repo/types/notion-training-app";
import z from "zod";

export const exerciseRmTypesSchema = z
  .preprocess((value) => value ?? null, z.enum(EXERCISE_RM_TYPES).nullable())
  .catch(null);
