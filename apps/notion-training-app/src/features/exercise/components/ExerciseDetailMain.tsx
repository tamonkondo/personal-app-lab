import { Card, CardContent } from "@repo/ui";
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
      <CardContent className="pt-6">
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
