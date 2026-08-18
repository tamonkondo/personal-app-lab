import { Card, CardContent } from "@repo/ui";
import * as Sentry from "@sentry/react";
import useSWR from "swr";
import { TRAINING_API_BASE, fetcher } from "../../../lib/fetch";
import DailyLogsHeaderSkeleton from "./DailyLogsHeaderSkeleton";
import { formatDate } from "@repo/utils";
import type { NewestTrainingLogResponse } from "@repo/types/notion-training-app";
import PageHero, { HeroLinkButton } from "../../../components/PageHero";

const DailyLogsHeader = () => {
  const {
    data: newestLogData,
    error,
    isLoading,
  } = useSWR<NewestTrainingLogResponse>(
    `${TRAINING_API_BASE}/training-logs/newest`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10_000,
    },
  );
  const newestLog = newestLogData?.data || null;
  const summaryItems = newestLog
    ? [
        { label: "種目数", value: `${newestLog.exerciseCount}` },
        { label: "体重", value: `${newestLog.bodyWeight}kg` },
        {
          label: "総重量",
          value: `${newestLog.totalWeight.toLocaleString()}kg`,
        },
      ]
    : [];

  if (isLoading) {
    return <DailyLogsHeaderSkeleton statusMessage={"読み込み中..."} />;
  }
  if (error) {
    // ここでエラーログをSentryなどに送信するロジックがいるかもしれない
    Sentry.captureException(error);

    return (
      <DailyLogsHeaderSkeleton statusMessage={"最新ログの取得に失敗しました"} />
    );
  }
  if (!newestLog) {
    return <DailyLogsHeaderSkeleton statusMessage="ログがありません" />;
  }

  return (
    <header className="grid gap-6">
      <PageHero
        badge="Latest Log"
        title={formatDate(newestLog.createdTime)}
        description={newestLog.memo}
        actions={
          <HeroLinkButton to={`/training/logs/${newestLog.id}`}>
            詳細
          </HeroLinkButton>
        }
      />
      <section className="grid gap-4 grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 xl:p-5">
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="mt-2 text-xl md:text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </header>
  );
};

export default DailyLogsHeader;
