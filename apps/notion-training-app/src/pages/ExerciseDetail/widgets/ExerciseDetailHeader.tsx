import { Button, Card, CardContent, Spinner } from "@repo/ui";
import { formatDate } from "@repo/utils";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ExerciseDetail } from "@repo/types/notion-training-app";

interface Props {
  data: ExerciseDetail;
}
const ExerciseDetailHeader = ({ data }: Props) => {
  const summaryItems = useMemo(
    () => [
      {
        label: "現在MAX重量",
        value: `${data?.currentMaxWeight}kg`,
      },
      {
        label: "目標重量",
        value: `${data?.maxGoalWeight ?? 0}kg`,
      },
      {
        label: "トータルセット記録回数",
        value: `${data?.totalSetsCount ?? 0}`,
      },
      {
        label: "総重量",
        value: `${data?.totalTrainingVolumeWeight ?? 0}kg`,
      },
    ],
    [data],
  );
  return (
    <>
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-300">
              Latest {formatDate(data.latestTrainingDate, "slash")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {data.exerciseName}
            </h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/exercise-logs">
              <Button
                variant="outline"
                className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                一覧へ戻る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="mt-2 text-xl font-bold md:text-2xl">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
};

export default ExerciseDetailHeader;
