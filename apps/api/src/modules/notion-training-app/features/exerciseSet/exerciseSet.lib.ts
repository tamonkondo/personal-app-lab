import { ExerciseSetBase } from "@repo/types/notion-training-app";

export const parseExerciseSetsText = (
  value: string | null | undefined,
  exerciseLogId: string = "",
): ExerciseSetBase[] => {
  if (!value) return [];
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(";;")
    .map((row) => row.replace(/^,/, "").trim())
    .filter(Boolean)
    .map((row) => {
      const [kg, rep, memo, _ , maxWeight, id, pageName] = row.split("|");
      return {
        exerciseId: exerciseLogId,
        id,
        kg: Number(kg) || 0,
        rep: Number(rep) || 0,
        memo: memo || "",
        maxWeight: Number(maxWeight) || 0,
        notionUrl: `https://app.notion.com/p/${pageName}-${id}`,
      };
    });
};
