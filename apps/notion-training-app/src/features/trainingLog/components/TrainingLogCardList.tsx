import fetcher from "../../../lib/fetch";
import { TrainingLogSummaryResponse } from "@repo/types/notion-training-app";
import { TrainingLogCard } from "./TrainingLogCard";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@repo/ui/components/ui/button";
import AlertCard from "../../../components/AlertCard";
import * as Sentry from "@sentry/react";
import useSWRInfinite from "swr/infinite";
import { formatDate } from "@repo/utils";
import { useCallback } from "react";

const TrainingLogCardList = ({ enabled }: { enabled: boolean }) => {
  if (!enabled) return null;
  const [searchParams, setSearchParams] = useSearchParams();
  const tlSort = searchParams.get("tlSort");
  const tlStartDate = searchParams.get("tlStartDate");
  const tlEndDate = searchParams.get("tlEndDate");
  const tlPage = Number(searchParams.get("tlPage") || 1);
  const getKey = useCallback(
    (
      pageIndex: number,
      previousPageData: TrainingLogSummaryResponse | null,
    ) => {
      if (previousPageData && !previousPageData.data.length) return null; // reached the end
      if (pageIndex === 0)
        return `${import.meta.env.VITE_API_URL}/training-logs/?limit=5&startDate=${tlStartDate ? formatDate(new Date(tlStartDate), "hyphen") : ""}&endDate=${tlEndDate ? formatDate(new Date(tlEndDate), "hyphen") : ""}&sort=${tlSort || ""}`; // first page
      if (!previousPageData?.meta.next_cursor) return null; // reached the end
      return `${import.meta.env.VITE_API_URL}/training-logs/?cursor=${previousPageData?.meta.next_cursor}&limit=5&startDate=${tlStartDate ? formatDate(new Date(tlStartDate), "hyphen") : ""}&endDate=${tlEndDate ? formatDate(new Date(tlEndDate), "hyphen") : ""}&sort=${tlSort || ""}`; // SWR key
    },
    [tlStartDate, tlEndDate, tlSort],
  );
  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<TrainingLogSummaryResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
    });
  for (let i = 0; i < Number(tlPage); i++) {
    if (size < i + 1) setSize(i + 1);
  }
  const handlePageChange = (newPage: number) => {
    setSize(newPage);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tlPage", String(newPage));
      return newParams;
    });
  };
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
  if (!data || !data[0]?.data)
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
  const allData = data.flatMap((page) => page.data);
  return (
    <>
      {/* フィルター機能 */}
      {/* フィルター機能 */}
      {allData.map((log) => (
        <TrainingLogCard key={log.id} data={log} />
      ))}
      <div className="grid place-items-center mt-4 gap-2">
        {isValidating && size > 0 && <Spinner />}
        {!isValidating && data && data[data.length - 1]?.meta.has_more && (
          <Button
            onClick={() => {
              handlePageChange(Number(tlPage) + 1);
            }}
          >
            さらに読み込む
          </Button>
        )}
      </div>
    </>
  );
};

export default TrainingLogCardList;
