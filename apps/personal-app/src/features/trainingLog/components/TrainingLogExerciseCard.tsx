import type { TrainingLogDetail } from "@repo/types/notion-training-app";
import { Badge, Button } from "@repo/ui";
import ExerciseSetTable from "../../exercise/components/ExerciseSetTable";

type TrainingLogExercise = TrainingLogDetail["exercises"][number];

type Props = {
  data: TrainingLogExercise;
};

const getExerciseVolume = (exercise: TrainingLogExercise) =>
  exercise.exerciseSets.sets.reduce((sum, set) => sum + set.kg * set.rep, 0);

export function TrainingLogExerciseCard({ data }: Props) {
  const exerciseVolume = getExerciseVolume(data);
  const exerciseId = data.exerciseSets.exerciseId;

  return (
    <article
      key={data.id}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">
              {data.trainingName || "種目名未設定"}
            </h2>
            {data.musclesTypes.length > 0 ? (
              <Badge variant="secondary">{data.musclesTypes.join(", ")}</Badge>
            ) : null}
            {data.isPr ? (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                PR更新
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">
            最大重量 {data.currentMaxWeight}kg / 目標重量 {data.maxGoalWeight}kg
            / 総重量 {exerciseVolume.toLocaleString()}kg
          </p>
        </div>
        {exerciseId ? (
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            種目詳細
          </Button>
        ) : null}
      </div>

      <div className="mt-5">
        {data.exerciseSets.sets.length > 0 ? (
          <ExerciseSetTable data={data.exerciseSets} />
        ) : (
          <p className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">
            セット記録がありません。
          </p>
        )}
      </div>
    </article>
  );
}

export { getExerciseVolume };
