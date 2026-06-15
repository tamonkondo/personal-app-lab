import { Badge, Button, Card, CardContent } from "@repo/ui";
import * as Sentry from "@sentry/react";
import useSWR from "swr";
import fetcher from "../../../lib/fetch";
import DailyLogsHeaderSkeleton from "./DailyLogsHeaderSkeleton";
import { formatDate } from "@repo/utils";
import { Link } from "react-router-dom";
import { NewestTrainingLogSummaryResponse } from "@repo/types/notion-training-app";

const DailyLogsHeader = () => {
  const {
    data: newestLogData,
    error,
    isLoading,
  } = useSWR<NewestTrainingLogSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/training-logs/newest`,
    fetcher,
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
    Sentry.logger.error("エラーが発生しました:", error);

    return (
      <DailyLogsHeaderSkeleton statusMessage={"最新ログの取得に失敗しました"} />
    );
  }
  if (!newestLog) {
    return <DailyLogsHeaderSkeleton statusMessage="ログがありません" />;
  }

  return (
    <header className="grid gap-6">
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                Latest Log
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {formatDate(newestLog.createdTime)}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                {newestLog.memo}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to={`/training-logs/${newestLog.id}`}>
              <Button className="w-full sm:w-auto">詳細</Button>
            </Link>
          </div>
        </div>
      </section>
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
