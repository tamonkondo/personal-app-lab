/**
 * 必要なAPI
 * - 最新のトレーニングログ1件を取得するAPI
 * - 1週間ごとのトレーニングログを取得するAPI
 * -
 * */

import DailyLogsHeader from "../../features/trainingLog/components/DailyLogsHeader";
import TabPanel from "./TabPanel";
import SidePanel from "./SidePanel";
import ControllPanel from "./ControllPanel";

const TrainingHome = () => {
  return (
    <>
      <DailyLogsHeader />
      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <TabPanel />
        <SidePanel>
          <ControllPanel />
        </SidePanel>
      </section>
    </>
  );
};

export default TrainingHome;
