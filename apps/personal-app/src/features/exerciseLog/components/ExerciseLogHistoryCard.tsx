import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";
import { Badge, Button } from "@repo/ui";
import { formatDate } from "@repo/utils";
import ExerciseSetTable from "../../exercise/components/ExerciseSetTable";

type Props = {
  data: ExerciseLogWithSetsItemResponse;
};

export function ExerciseLogHistoryCard({ data }: Props) {
  const bestSet = data.sets.reduce((maxSet, currentSet) => {
    return currentSet.maxWeight > maxSet.maxWeight ? currentSet : maxSet;
  }, data.sets[0]);
  const totalVolume = data.sets.reduce((sum, set) => sum + set.kg * set.rep, 0);
  const isPr = bestSet ? bestSet.maxWeight === 100 : false;

  return (
    <article
      key={data.exerciseLogId}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {data.createdTime ? (
              <Badge variant="secondary">
                {formatDate(data.createdTime, "slash")}
              </Badge>
            ) : null}
            {isPr ? (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                PR更新
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">
            Best{" "}
            {bestSet
              ? `${bestSet.kg}kg x ${bestSet.rep} / 1RM ${bestSet.maxWeight}kg`
              : "-"}{" "}
            / Volume {totalVolume.toLocaleString()}kg / Rest{" "}
            {data.rest ? `${data.rest}分` : "未設定"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          編集
        </Button>
      </div>

      <div className="mt-5">
        {data.sets.length > 0 ? (
          <ExerciseSetTable data={data} />
        ) : (
          <p className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">
            セット記録がありません。
          </p>
        )}
      </div>
    </article>
  );
}
