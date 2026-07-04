import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Link, Navigate, useParams } from "react-router-dom";
import { EXERCISE_TREND_PERIOD_OPTIONS } from "../../features/exercise/constants/constants";
import { useExerciseTrendsParams } from "../../features/exercise/hooks/useExerciseTrendsParams";
import { useMemo } from "react";
import { ExerciseTrendPeriod } from "@repo/types/notion-training-app/exercise";
import ExerciseDetailHeader from "./widgets/ExerciseDetailHeader";
import { useExerciseDetail } from "../../features/exercise/hooks/useExerciseDetail";
import AlertCard from "../../components/AlertCard";
import ExerciseDetailMain from "./widgets/ExerciseDetailMain";
import DetailSkeleton from "../../components/DetailPageSkeleton";

const ExerciseLogDetail = () => {
  const { trendPeriod, setSearchParamsWithReset } = useExerciseTrendsParams();
  const { exerciseId } = useParams();
  if (!exerciseId) return <Navigate replace to="/" />;

  const {
    error: exerciseDetailError,
    exerciseDetail: exerciseDetailData,
    isLoading,
    mutate: mutateExerciseDetail,
  } = useExerciseDetail(exerciseId);
  const goalProgress =
    exerciseDetailData && exerciseDetailData.maxGoalWeight > 0
      ? Math.min(
          Math.round(
            (exerciseDetailData.currentMaxWeight /
              exerciseDetailData.maxGoalWeight) *
              100,
          ),
          100,
        )
      : 0;
  const trendItems = useMemo(
    () => [
      {
        label: `直近${EXERCISE_TREND_PERIOD_OPTIONS.find((option) => option.value === trendPeriod)?.label}の伸び`,
        value: "+5kg",
        tone: "text-emerald-700",
      },
      { label: "平均セット数", value: "4.0 set", tone: "text-zinc-950" },
      { label: "次回目安", value: "90kg x 5", tone: "text-zinc-950" },
    ],
    [trendPeriod],
  );

  if (isLoading) return <DetailSkeleton />;
  if (exerciseDetailError) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニング種目のデータを取得できませんでした。時間をおいて再度お試しください。"
        action={
          <Button onClick={() => mutateExerciseDetail()}>再読み込み</Button>
        }
      />
    );
  }
  if (!exerciseDetailData)
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="トレーニング種目のデータが存在しません。新しい記録を追加してください。"
        action={
          <Link to="/exercise/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ExerciseDetailHeader data={exerciseDetailData} />
        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <ExerciseDetailMain id={exerciseId} />
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>目標進捗</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  目標重量まであと{" "}
                  {Math.max(
                    exerciseDetailData.maxGoalWeight -
                      exerciseDetailData.currentMaxWeight,
                    0,
                  ).toFixed(1)}
                  kg です。
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Progress</span>
                  <span className="font-semibold">{goalProgress}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近の傾向</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={trendPeriod || ""}
                  onValueChange={(value: ExerciseTrendPeriod) => {
                    setSearchParamsWithReset({
                      trendPeriod: value,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="期間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TREND_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {trendItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border bg-zinc-50 p-4"
                  >
                    <span className="text-sm text-zinc-500">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.tone}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">この種目で記録作成</Button>
                <Link to={`/exercises/${exerciseId}/edit`}>
                  <Button variant="outline" className="w-full">
                    目標重量を更新
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                >
                  種目ログを削除
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExerciseLogDetail;
