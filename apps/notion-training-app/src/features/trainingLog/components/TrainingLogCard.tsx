/**
 * 必要なデータ
 * - 日付
 * - 体重
 * - トレーニング種目(3種目まで表示)
 * - メモ
 * - 遷移ボタン
 * */
import { TrainingLogSummary } from "@repo/types/notion-training-app";
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
import { Link } from "react-router-dom";
interface Props {
  data: TrainingLogSummary;
}
export function TrainingLogCard({ data }: Props) {
  return (
    <article
      key={data.id}
      className="min-w-0 rounded-2xl border bg-white p-3 md:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">
              {formatDate(data.createdTime)}
            </h2>
          </div>
        </div>
        <Link to={`/training-log/${data.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            詳細
          </Button>
        </Link>
      </div>

      <div className="mt-5 w-full overflow-x-auto rounded-2xl border">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-zinc-50 text-xs font-semibold text-zinc-500 uppercase">
            <TableRow>
              <TableHead className="w-[42%] whitespace-normal">種目</TableHead>
              <TableHead className="w-[26%]">最大重量</TableHead>
              <TableHead className="w-[32%]">セット数</TableHead>
              <TableHead className="hidden w-[32%] sm:table-cell">
                メモ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.exercises.map((exercise) => (
              <TableRow key={`${data.id}-${exercise.name}`} className="text-sm">
                <TableCell className="font-semibold whitespace-normal wrap-break-word">
                  {exercise.name}
                </TableCell>
                <TableCell className="lowercase">
                  {exercise.todayMaxWeight}kg
                </TableCell>
                <TableCell className="lowercase">{exercise.sets}rep</TableCell>
                <TableCell className="hidden text-zinc-500 whitespace-normal wrap-break-word sm:table-cell">
                  {exercise.memo || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </article>
  );
}
