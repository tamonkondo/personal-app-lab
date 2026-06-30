import { ExerciseSummaryCard } from "../../exercise/components/ExerciseSummaryCard";
import { Button, Spinner } from "@repo/ui";
import AlertCard from "../../../components/AlertCard";
import { Link } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { useExerciseSummaryParams } from "../hooks/useExerciseSummaryParams";
import { useExerciseSummaryInfinite } from "../hooks/useExerciseSummaryInfinite";

const ExerciseSummaryList = ({ enabled }: { enabled: boolean }) => {
  if (!enabled) return null;
  const {
    elPage,
    elSort,
    elStartDate,
    elEndDate,
    elBodyParts,
    setSearchParamsWithReset,
  } = useExerciseSummaryParams();
  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useExerciseSummaryInfinite({
      params: { elPage, elSort, elStartDate, elEndDate, elBodyParts },
      page: elPage,
    });
  const handlePageChange = (newPage: number) => {
    setSize(newPage);
    setSearchParamsWithReset({ elPage: String(newPage) });
  };
  if (isLoading) return <Spinner />;
  if (error) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニング種目のデータを取得できませんでした。時間をおいて再度お試しください。"
        action={<Button onClick={() => mutate()}>再読み込み</Button>}
      />
    );
  }
  if (!data || !data[0]?.data.length)
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="トレーニング種目のデータが存在しません。新しい記録を追加してください。"
        action={
          <Link to="/exercise/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );
  const allData = data.flatMap((page) => page.data);
  return (
    <>
      {allData.map((exercise) => (
        <ExerciseSummaryCard key={exercise.id} data={exercise} />
      ))}
      <div className="grid place-items-center mt-4 gap-2">
        {isValidating && size > 0 && <Spinner />}
        {!isValidating && data && data[data.length - 1]?.meta.has_more && (
          <Button
            onClick={() => {
              handlePageChange(Number(elPage) + 1);
            }}
          >
            さらに読み込む
          </Button>
        )}
      </div>
    </>
  );
};

export default ExerciseSummaryList;
