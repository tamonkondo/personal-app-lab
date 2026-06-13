import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui";
import { TrainingLogCard } from "../../../features/trainingLog/components/TrainingLogCard";
import { ExerciseLogCard } from "../../../features/exerciseLog/components/ExerciseLogCard";
import fetcher from "../../../lib/fetch";
import useSWR from "swr";

import {
  ExerciseSummaryResponse,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app/index";
const TabPanel = () => {
  const {
    data: exerciseSummary,
    error: fetchExerciseSummaryError,
    isLoading: fetchExerciseSummaryLoading,
  } = useSWR<ExerciseSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/exercise/summary/`,
    fetcher,
  );
  const {
    data: trainingLogs,
    error: fetchTrainingLogsError,
    isLoading: fetchTrainingLogsLoading,
  } = useSWR<TrainingLogSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/training-logs/`,
    fetcher,
  );
  if (fetchExerciseSummaryLoading || fetchTrainingLogsLoading) {
    return <div>Loading...</div>;
  }
  if (fetchExerciseSummaryError || fetchTrainingLogsError) {
    return <div>Error loading data</div>;
  }
  if (
    !trainingLogs ||
    !trainingLogs.data ||
    !exerciseSummary ||
    !exerciseSummary.data
  ) {
    return <div>No data available</div>;
  }
  console.log("Fetched training logs:", trainingLogs.data);
  return (
    <Tabs defaultValue="trainingLogs">
      <TabsList className="px-3 py-6  h-auto gap-2 [&>button]:h-auto [&>button]:cursor-pointer">
        <TabsTrigger value="trainingLogs">Training Logs</TabsTrigger>
        <TabsTrigger value="exerciseLogs">Exercise Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="trainingLogs">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Training Logs</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                各種目ごとの重量、回数、メモを確認できます。
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {trainingLogs.data.map((log) => (
              <TrainingLogCard key={log.id} data={log} />
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="exerciseLogs">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Exercise Logs</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">
                各種目ごとの重量、回数、メモを確認できます。
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {exerciseSummary.data.map((exercise) => (
              <ExerciseLogCard key={exercise.id} data={exercise} />
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabPanel;
