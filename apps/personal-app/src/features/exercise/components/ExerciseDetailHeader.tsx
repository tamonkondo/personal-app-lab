import { Card, CardContent } from "@repo/ui";
import { formatDate } from "@repo/utils";
import { useMemo } from "react";
import { ExerciseDetail } from "@repo/types/notion-training-app";
import PageHero, { HeroLinkButton } from "../../../components/PageHero";

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
      <PageHero
        eyebrow={`Latest ${formatDate(data.latestTrainingDate, "slash")}`}
        title={data.exerciseName}
        actions={
          <HeroLinkButton to="/exercises" variant="outline">
            一覧へ戻る
          </HeroLinkButton>
        }
      />

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
