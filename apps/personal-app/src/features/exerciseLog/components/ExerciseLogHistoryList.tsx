import { Button, Spinner } from "@repo/ui";
import { Link } from "react-router-dom";
import AlertCard from "../../../components/AlertCard";
import { useExerciseLogsInfinite } from "../hooks/useExerciseLogsInfinite";
import { ExerciseLogHistoryCard } from "./ExerciseLogHistoryCard";

type Props = {
  exerciseId?: string;
  exerciseLogsPage: number;
  onExerciseLogsPageChange: (page: number) => void;
};

export function ExerciseLogHistoryList({
  exerciseId,
  exerciseLogsPage,
  onExerciseLogsPageChange,
}: Props) {
  const {
    error,
    exerciseLogs,
    hasMore,
    isLoading,
    isValidating,
    mutate,
    setSize,
    size,
  } = useExerciseLogsInfinite({
    exerciseId,
    page: exerciseLogsPage,
  });

  const handlePageChange = (newPage: number) => {
    setSize(newPage);
    onExerciseLogsPageChange(newPage);
  };

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="種目別ログのデータを取得できませんでした。時間をおいて再度お試しください。"
        action={<Button onClick={() => mutate()}>再読み込み</Button>}
      />
    );
  }

  if (!exerciseLogs.length) {
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="この種目のトレーニング記録が存在しません。新しい記録を追加してください。"
        action={
          <Link to="/exercise/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        {exerciseLogs.map((exerciseLog) => (
          <ExerciseLogHistoryCard
            key={exerciseLog.exerciseLogId}
            data={exerciseLog}
          />
        ))}
      </div>
      <div className="mt-4 grid place-items-center gap-2">
        {isValidating && size > 0 ? <Spinner /> : null}
        {!isValidating && hasMore ? (
          <Button
            onClick={() => {
              handlePageChange(Number(exerciseLogsPage) + 1);
            }}
          >
            さらに読み込む
          </Button>
        ) : null}
      </div>
    </>
  );
}
