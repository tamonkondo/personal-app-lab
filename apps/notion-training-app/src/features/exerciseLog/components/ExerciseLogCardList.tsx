import fetcher from "../../../lib/fetch";
import { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import useSWR from "swr";
import { ExerciseLogCard } from "./ExerciseLogCard";
import { Spinner } from "@repo/ui";
import AlertCard from "../../../components/AlertCard";

const ExerciseLogCardList = () => {
  const { data, error, isLoading } = useSWR<ExerciseSummaryResponse>(
    `${import.meta.env.VITE_API_URL}/exercise/summary/`,
    fetcher,
  );
  if (isLoading) return <Spinner />;
  if (error)
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニング記録のデータを取得できませんでした。時間をおいて再度お試しください。"
      />
    );
  if (!data || !data.data)
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニング記録のデータを取得できませんでした。時間をおいて再度お試しください。"
      />
    );
  return (
    <>
      {data.data.map((exercise) => (
        <ExerciseLogCard key={exercise.id} data={exercise} />
      ))}
    </>
  );
};

export default ExerciseLogCardList;
