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
import TrainingLogCardList from "../../../features/trainingLog/components/TrainingLogCardList";
import ExerciseLogCardList from "../../../features/exerciseLog/components/ExerciseLogCardList";
const TabPanel = () => {
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
            <TrainingLogCardList />
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
            <ExerciseLogCardList />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabPanel;
