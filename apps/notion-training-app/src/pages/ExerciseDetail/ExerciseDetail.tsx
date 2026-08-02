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
import { useExerciseDetailParams } from "../../features/exercise/hooks/useExerciseDetailParams";
import { useMemo } from "react";
import {
  EXERCISE_GUIDE_LINE_REPS,
  type ExerciseGuideLineRep,
  type ExerciseTrendPeriod,
} from "@repo/types/notion-training-app/exercise";
import ExerciseDetailHeader from "../../features/exercise/components/ExerciseDetailHeader";
import ExerciseTrendChart from "../../features/exercise/components/ExerciseTrendChart";
import { useExerciseDetail } from "../../features/exercise/hooks/useExerciseDetail";
import { useExerciseTrends } from "../../features/exercise/hooks/useExerciseTrends";
import AlertCard from "../../components/AlertCard";
import ExerciseDetailMain from "../../features/exercise/components/ExerciseDetailMain";
import DetailSkeleton from "../../components/DetailPageSkeleton";
import { Spinner } from "@repo/ui";

const ExerciseLogDetail = () => {
  const { trendPeriod, exerciseGuideLineRep, setSearchParamsWithReset } =
    useExerciseDetailParams();
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
  const effectivePeriod = trendPeriod ?? "4w";
  const { trends, isLoading: isTrendsLoading } = useExerciseTrends(
    exerciseId,
    effectivePeriod,
  );
  // トレンドの実データから「伸び」と「平均セット数」を計算する
  const trendItems = useMemo(() => {
    const periodLabel =
      EXERCISE_TREND_PERIOD_OPTIONS.find(
        (option) => option.value === effectivePeriod,
      )?.label ?? "";
    const points = trends?.points ?? [];
    const first = points[0];
    const last = points[points.length - 1];
    const gain = first && last ? last.maxWeight - first.maxWeight : null;
    const averageSets =
      points.length > 0
        ? points.reduce((acc, point) => acc + point.setsCount, 0) /
          points.length
        : null;
    return [
      {
        label: `直近${periodLabel}の伸び`,
        value:
          gain === null ? "-" : `${gain >= 0 ? "+" : ""}${gain.toFixed(1)}kg`,
        tone:
          gain !== null && gain > 0 ? "text-emerald-700" : "text-zinc-950",
      },
      {
        label: "平均セット数",
        value: averageSets === null ? "-" : `${averageSets.toFixed(1)} set`,
        tone: "text-zinc-950",
      },
    ];
  }, [effectivePeriod, trends]);
  const rmTypes = exerciseDetailData?.rmTypes;
  const currentMaxWeight = exerciseDetailData?.currentMaxWeight;
  const guideLineSet = useMemo(() => {
    const rep = exerciseGuideLineRep ? exerciseGuideLineRep : "5";
    let multiplier: number =
      rmTypes === "upperBody" ? 40 : rmTypes === "lowerBody" ? 33.3 : 40;
    const calcRes = (rep: string, percent: number) =>
      Math.floor(
        (Math.floor(
          (currentMaxWeight! + 5) * (1 + Number(rep) / multiplier) * 100,
        ) /
          100) *
          percent,
      );
    switch (rep) {
      case "5":
        return `${calcRes("5", 0.8)}kg✕5rep`;
      case "10":
        return `${calcRes("10", 0.7)}kg✕10rep`;
      case "15":
        return `${calcRes("15", 0.6)}kg✕15rep`;
      case "20":
        return `${calcRes("20", 0.5)}kg✕20rep`;
      default:
        return `${calcRes("5", 0.8)}kg✕5rep`;
    }
  }, [exerciseGuideLineRep, rmTypes, currentMaxWeight]);

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
          <Link to="/exercises/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );

  return (
    <>
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
                <span className="text-sm inline-block mt-3">
                  次回セット目安
                </span>
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                  <div className="grid gap-2 rounded-md h-9 border bg-zinc-50 p-2  ">
                    <span className="text-sm">{guideLineSet}</span>
                  </div>
                  <Select
                    value={exerciseGuideLineRep || "5"}
                    onValueChange={(value) => {
                      setSearchParamsWithReset({
                        exerciseGuideLineRep: value as ExerciseGuideLineRep,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_GUIDE_LINE_REPS.map((rep) => (
                        <SelectItem value={rep} key={rep}>
                          {rep}rep
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isTrendsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <ExerciseTrendChart
                    points={trends?.points ?? []}
                    goalWeight={trends?.maxGoalWeight ?? 0}
                  />
                )}
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
    </>
  );
};

export default ExerciseLogDetail;
