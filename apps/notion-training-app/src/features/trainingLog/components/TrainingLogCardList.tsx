import fetcher from "../../../lib/fetch";
import { TrainingLogSummaryResponse } from "@repo/types/notion-training-app";
import useSWR from "swr";
import { TrainingLogCard } from "./TrainingLogCard";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Link } from "react-router-dom";
import { Button } from "@repo/ui/components/ui/button";
import AlertCard from "../../../components/AlertCard";
import * as Sentry from "@sentry/react";
const TrainingLogCardList = ({ enabled }: { enabled: boolean }) => {
  const { data, error, isLoading, mutate } = useSWR<TrainingLogSummaryResponse>(
    enabled ? `${import.meta.env.VITE_API_URL}/training-logs/` : null,
    fetcher,
  );
  if (isLoading) return <Spinner />;
  if (error) {
    Sentry.captureException(error);
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニング記録のデータを取得できませんでした。時間をおいて再度お試しください。"
        action={<Button onClick={() => mutate()}>再読み込み</Button>}
      />
    );
  }
  if (!data || !data.data)
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="トレーニング記録のデータが存在しません。新しい記録を追加してください。"
        action={
          <Link to="/exercise/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );
  return (
    <>
      {data.data.map((log) => (
        <TrainingLogCard key={log.id} data={log} />
      ))}
    </>
  );
};

export default TrainingLogCardList;
