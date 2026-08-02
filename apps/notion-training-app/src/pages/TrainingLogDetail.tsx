import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";
import { formatDate } from "@repo/utils";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertCard from "../components/AlertCard";
import { getExerciseVolume } from "../features/trainingLog/components/TrainingLogExerciseCard";
import { TrainingLogExerciseList } from "../features/trainingLog/components/TrainingLogExerciseList";
import { useTrainingLogDetail } from "../features/trainingLog/hooks/useTrainingLogDetail";
import { useTrainingLogMutations } from "../features/trainingLog/hooks/useTrainingLogMutations";
import BODY_PARTS from "../constants/parts";
import DetailSkeleton from "../components/DetailPageSkeleton";
import PageHero, { HeroLinkButton } from "../components/PageHero";

const TrainingLogDetail = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { error, isLoading, mutate, trainingLogDetail } =
    useTrainingLogDetail(trainingId);
  const { deleteTrainingLog, isSubmitting } = useTrainingLogMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!trainingId) return;
    setDeleteError(null);
    try {
      await deleteTrainingLog(trainingId);
      navigate("/training-logs");
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "削除に失敗しました",
      );
    }
  };

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

  if (isLoading) return <DetailSkeleton />;

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
    <>
      <PageHero
        eyebrow={formatDate(trainingLogDetail.createdTime, "slash")}
        title={bodyPartsNames()?.join("・") || "トレーニングログ"}
        description={trainingLogDetail.memo || "メモはありません。"}
        actions={
          <>
            <HeroLinkButton to="/training-logs" variant="outline">
              一覧へ戻る
            </HeroLinkButton>
            <HeroLinkButton to={`/training-logs/${trainingId}/edit`}>
              編集する
            </HeroLinkButton>
          </>
        }
      />

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
              <Link to={`/training-logs/${trainingId}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  編集
                </Button>
              </Link>
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
                <Button
                  className="w-full"
                  onClick={() =>
                    navigate("/training-logs/new", {
                      state: { template: trainingLogDetail },
                    })
                  }
                >
                  同じ内容で記録作成
                </Button>
                <Link to={`/training-logs/${trainingId}/edit`}>
                  <Button variant="outline" className="w-full">
                    記録を編集
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmOpen(true);
                  }}
                >
                  記録を削除
                </Button>
              </CardContent>
            </Card>
          </div>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記録を削除しますか？</DialogTitle>
            <DialogDescription>
              {formatDate(trainingLogDetail.createdTime, "slash")}{" "}
              の記録と、紐づく種目・セットをまとめて削除します。 Notion
              のゴミ箱から復元は可能ですが、この画面からは元に戻せません。
            </DialogDescription>
          </DialogHeader>

          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrainingLogDetail;
