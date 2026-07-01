import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { ExerciseLogHistoryList } from "../../../features/exerciseLog/components/ExerciseLogHistoryList";
import { useExerciseLogsParams } from "../../../features/exerciseLog/hooks/useExerciseLogsParams";

interface Props {
  id: string;
}
const ExerciseDetailMain = ({ id }: Props) => {
  const {
    exerciseLogsPage,
    setSearchParamsWithReset: setExerciseLogsSearchParamsWithReset,
  } = useExerciseLogsParams();
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>種目別ログ</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            ベストセット、セット履歴、PR履歴を確認できます。
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          セットを追加
        </Button>
      </CardHeader>
      <CardContent>
        <ExerciseLogHistoryList
          exerciseId={id}
          exerciseLogsPage={exerciseLogsPage}
          onExerciseLogsPageChange={(page) => {
            setExerciseLogsSearchParamsWithReset({
              exerciseLogsPage: String(page),
            });
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ExerciseDetailMain;
