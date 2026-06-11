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

const TrainingLogDetail = () => {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DailyLogsHeader />
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
