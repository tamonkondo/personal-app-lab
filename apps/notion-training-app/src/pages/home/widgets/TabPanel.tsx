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

const exerciseDetails = [
  {
    id: "exercise-1",
    name: "ベンチプレス",
    part: "胸",
    maxWeight: "92.5kg",
    volume: "3,450kg",
    isPr: true,
    sets: [
      { set: 1, weight: "80kg", reps: 8, memo: "ウォームアップ" },
      { set: 2, weight: "87.5kg", reps: 6, memo: "余裕あり" },
      { set: 3, weight: "92.5kg", reps: 3, memo: "PR" },
      { set: 4, weight: "85kg", reps: 7, memo: "フォーム重視" },
    ],
  },
  {
    id: "exercise-2",
    name: "インクラインダンベルプレス",
    part: "胸",
    maxWeight: "30kg",
    volume: "1,680kg",
    isPr: false,
    sets: [
      { set: 1, weight: "26kg", reps: 10, memo: "" },
      { set: 2, weight: "28kg", reps: 8, memo: "" },
      { set: 3, weight: "30kg", reps: 6, memo: "やや重い" },
    ],
  },
  {
    id: "exercise-3",
    name: "ケーブルフライ",
    part: "胸",
    maxWeight: "22.5kg",
    volume: "1,350kg",
    isPr: false,
    sets: [
      { set: 1, weight: "20kg", reps: 12, memo: "" },
      { set: 2, weight: "22.5kg", reps: 10, memo: "" },
      { set: 3, weight: "22.5kg", reps: 10, memo: "収縮意識" },
    ],
  },
  {
    id: "exercise-4",
    name: "トライセプスプレスダウン",
    part: "三頭",
    maxWeight: "35kg",
    volume: "1,940kg",
    isPr: false,
    sets: [
      { set: 1, weight: "30kg", reps: 12, memo: "" },
      { set: 2, weight: "32.5kg", reps: 10, memo: "" },
      { set: 3, weight: "35kg", reps: 8, memo: "" },
    ],
  },
];
import { TrainingLogSummaryResponse } from "@repo/types/notion-training-app/index";
const TabPanel = () => {
  const { data: trainingLogs, error, isLoading } = useSWR<TrainingLogSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/training-logs/`,
    fetcher,
  );
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading data</div>;
  }
  if (!trainingLogs || !trainingLogs.data) {
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
            {exerciseDetails.map((exercise) => (
              <ExerciseLogCard key={exercise.id} data={exercise} />
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabPanel;
