import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "@repo/ui";
import { formatDate } from "@repo/utils";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import AlertCard from "../components/AlertCard";
import { getExerciseVolume } from "../features/trainingLog/components/TrainingLogExerciseCard";
import { TrainingLogExerciseList } from "../features/trainingLog/components/TrainingLogExerciseList";
import { useTrainingLogDetail } from "../features/trainingLog/hooks/useTrainingLogDetail";
import BODY_PARTS from "../constants/parts";

const TrainingLogDetail = () => {
  const { trainingId } = useParams();
  const { error, isLoading, mutate, trainingLogDetail } =
    useTrainingLogDetail(trainingId);

  const summaryItems = useMemo(
    () =>
      trainingLogDetail
        ? [
            {
              label: "種目数",
              value: `${trainingLogDetail.totalExerciseCount}`,
            },
            { label: "セット数", value: `${trainingLogDetail.totalSetsCount}` },
            {
              label: "総重量",
              value: `${trainingLogDetail.totalTrainingVolumeWeight.toLocaleString()}kg`,
            },
            {
              label: "体重",
              value: trainingLogDetail.bodyWeight
                ? `${trainingLogDetail.bodyWeight}kg`
                : "未設定",
            },
          ]
        : [],
    [trainingLogDetail],
  );
  const prExercises = useMemo(
    () =>
      trainingLogDetail?.exercises.filter((exercise) => exercise.isPr) ?? [],
    [trainingLogDetail],
  );
  const bodyPartsNames = (): string[] | undefined =>
    trainingLogDetail?.bodyParts
      .map(
        (part) => BODY_PARTS.find((bodyPart) => bodyPart.value === part)?.label,
      )
      .filter((label): label is string => !!label);

  const highestVolumeExercise = useMemo(() => {
    if (!trainingLogDetail?.exercises.length) return null;

    return trainingLogDetail.exercises.reduce((highest, exercise) =>
      getExerciseVolume(exercise) > getExerciseVolume(highest)
        ? exercise
        : highest,
    );
  }, [trainingLogDetail]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <AlertCard
        title="データの取得に失敗しました"
        message="トレーニングログのデータを取得できませんでした。時間をおいて再度お試しください。"
        action={<Button onClick={() => mutate()}>再読み込み</Button>}
      />
    );
  }

  if (!trainingLogDetail) {
    return (
      <AlertCard
        title="データが一件も存在しません"
        message="トレーニングログのデータが存在しません。新しい記録を追加してください。"
        action={
          <Link to="/training-logs/new">
            <Button>新しい記録を追加</Button>
          </Link>
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">
                {formatDate(trainingLogDetail.createdTime, "slash")}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {bodyPartsNames()?.join("・") || "トレーニングログ"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                {trainingLogDetail.memo || "メモはありません。"}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/training-logs">
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  一覧へ戻る
                </Button>
              </Link>
              <Button className="w-full sm:w-auto">編集する</Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className="mt-2 text-xl font-bold md:text-2xl">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>種目別セット記録</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  各種目ごとの重量、回数、メモを確認できます。
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                編集
              </Button>
            </CardHeader>
            <CardContent>
              <TrainingLogExerciseList
                exercises={trainingLogDetail.exercises}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>この日のハイライト</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  記録から自動で見たいポイントをまとめます。
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-yellow-800">
                    PR更新
                  </p>
                  <p className="mt-1 text-sm text-yellow-800">
                    {prExercises.length > 0
                      ? `${prExercises.map((exercise) => exercise.trainingName).join("、")} でPR更新しました。`
                      : "PR更新なし"}
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">最多ボリューム</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {highestVolumeExercise
                      ? `${highestVolumeExercise.trainingName}が ${getExerciseVolume(highestVolumeExercise).toLocaleString()}kg で最大でした。`
                      : "記録された種目がありません。"}
                  </p>
                </div>
                <div className="rounded-2xl border bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">メモ</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {trainingLogDetail.memo || "メモはありません。"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">同じ内容で記録作成</Button>
                <Button variant="outline" className="w-full">
                  メモを編集
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                >
                  記録を削除
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrainingLogDetail;
