/**
 * 必要なAPI
 * - 最新のトレーニングログ1件を取得するAPI
 * - 1週間ごとのトレーニングログを取得するAPI
 * -
 * */

import DailyLogsHeader from "./widgets/DailyLogsHeader";
import TabPanel from "./widgets/TabPanel";
import SidePanel from "./widgets/SidePanel";
import ControllPanel from "./widgets/ControllPanel";
const trainingLog = {
  id: "log-1",
  date: "2026/06/01",
  day: "月",
  title: "胸・三頭",
  status: "完了",
  duration: 68,
  exerciseCount: 5,
  sets: 18,
  volume: "8,420kg",
  memo: "ベンチプレスでPR更新。全体的に調子良し。次回はインクライン種目を先に入れても良さそう。",
};

const summaryItems = [
  { label: "時間", value: `${trainingLog.duration}分` },
  { label: "種目数", value: `${trainingLog.exerciseCount}` },
  { label: "セット数", value: `${trainingLog.sets}` },
  { label: "総重量", value: trainingLog.volume },
];

const TrainingLogDetail = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DailyLogsHeader
          trainingLog={trainingLog}
          summaryItems={summaryItems}
        />

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <TabPanel />
          <SidePanel>
            <ControllPanel />
          </SidePanel>
        </section>
      </div>
    </main>
  );
};

export default TrainingLogDetail;
