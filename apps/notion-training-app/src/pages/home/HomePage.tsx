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
import fetcher from "../../lib/fetch";
import useSWR from "swr";

type NewestTrainingLog = {
  createdTime: string;
  bodyWeight: number;
  memo: string;
  exerciseCount: number;
  totalWeight: number;
};

type NewestTrainingLogResponse = {
  data: NewestTrainingLog | null;
};

const TrainingLogDetail = () => {
  const {
    data: newestLogData,
    error,
    isLoading,
  } = useSWR<NewestTrainingLogResponse>(
    "http://localhost:3000/api/notion-training-app/training-logs/newest",
    fetcher,
  );

  const newestLog = newestLogData?.data;
  const statusMessage = error
    ? "最新ログの取得に失敗しました"
    : isLoading
      ? "読み込み中..."
      : null;

  if (statusMessage) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
            {statusMessage}
          </section>
        </div>
      </main>
    );
  }

  if (!newestLog) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
            ログがありません
          </section>
        </div>
      </main>
    );
  }

  const summaryItems = [
    { label: "種目数", value: `${newestLog.exerciseCount}` },
    { label: "体重", value: `${newestLog.bodyWeight}kg` },
    { label: "総重量", value: `${newestLog.totalWeight.toLocaleString()}kg` },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DailyLogsHeader
          trainingLog={newestLog}
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
