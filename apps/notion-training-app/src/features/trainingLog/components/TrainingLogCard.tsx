/**
 * 必要なデータ
 * - 日付
 * - 体重
 * - トレーニング種目(3種目まで表示)
 * - メモ
 * - 遷移ボタン
 * */
import { TrainingLogResponse } from "@repo/types/notion-training-app";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { formatDate } from "@repo/utils/index";
interface Props {
  data: TrainingLogResponse;
}
export function TrainingLogCard({ data }: Props) {
  return (
    <article
      key={data.id}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">
              {formatDate(data.createdTime)}
            </h2>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          詳細
        </Button>
      </div>

      <Table className="mt-5 overflow-hidden rounded-2xl border">
        <TableHeader className=" bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-500 uppercase sm:px-6">
          <TableRow>
            <TableHead>種目</TableHead>
            <TableHead>最大重量</TableHead>
            <TableHead>セット数</TableHead>
            <TableHead className="">メモ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y border-2 rounded-2xl">
          {data.exercises.map((exercise) => (
            <TableRow
              key={`${data.id}-${exercise.name}`}
              className=" border-t px-4 py-3 text-sm uppercase sm:px-6"
            >
              <TableCell className="font-semibold">{exercise.name}</TableCell>
              <TableCell>{exercise.todayMaxWeight}</TableCell>
              <TableCell>{exercise.sets}回</TableCell>
              <TableCell className="hidden text-zinc-500 sm:block">
                {exercise.memo || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </article>
  );
}
