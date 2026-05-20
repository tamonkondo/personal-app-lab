import notionClient from "@/integrations/notion/notion.client";

export async function fetchExerciseLogs(exerciseId: string) {
  const exercises = await notionClient.pages.retrieve({
    page_id: exerciseId,
    // filter_properties: [
    //   "trainingRecordRelation",
    //   "trainingNameFormula",
    //   "exerciseDetailLogsRelation",
    //   "rest",
    //   "memo",
    // ],
  });

  return exercises;
}
