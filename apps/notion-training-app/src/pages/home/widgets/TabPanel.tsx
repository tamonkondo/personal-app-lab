import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import TrainingLogCardList from "../../../features/trainingLog/components/TrainingLogCardList";
import ExerciseLogCardList from "../../../features/exerciseLog/components/ExerciseLogCardList";
import TabPanelCard from "./TabPanelCard";
const TabPanel = () => {
  return (
    <Tabs defaultValue="trainingLogs">
      <TabsList className="px-3 py-6  h-auto gap-2 [&>button]:h-auto [&>button]:cursor-pointer">
        <TabsTrigger value="trainingLogs">Training Logs</TabsTrigger>
        <TabsTrigger value="exerciseLogs">Exercise Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="trainingLogs">
        <TabPanelCard
          title="Training Logs"
          description="過去のトレーニング記録を確認できます。"
          content={<TrainingLogCardList />}
        />
      </TabsContent>
      <TabsContent value="exerciseLogs">
        <TabPanelCard
          title="Exercise Logs"
          description="各種目ごとの重量、回数、メモを確認できます。"
          content={<ExerciseLogCardList />}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabPanel;
