import { ExerciseTrendPeriod } from "@repo/types/notion-training-app";

export const EXERCISE_TREND_PERIOD_OPTIONS: {
  value: ExerciseTrendPeriod;
  label: string;
}[] = [
  { value: "1w", label: "1週間" },

  { value: "2w", label: "2週間" },

  { value: "4w", label: "4週間" },

  { value: "6m", label: "半年" },

  { value: "1y", label: "1年" },

  { value: "all", label: "全期間" },
];
