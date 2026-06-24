import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { cn } from "@repo/ui/lib/utils";
import { formatDate } from "@repo/utils";

interface Props {
  data: ExerciseLogWithSetsItemResponse;
}
const ExerciseSetTable = ({ data }: Props) => {
  // setsのmaxWeightが一番大きいidを取得

  const maxWeightSet = data.sets.reduce((maxSet, currentSet) => {
    return currentSet.maxWeight > maxSet.maxWeight ? currentSet : maxSet;
  }, data.sets[0]);
  console.log("maxWeightSet", data);
  return (
    <>
      {" "}
      <>
        <p>Rest:{data.rest ? `${data.rest}分` : "未設定"}</p>
        <p>Date: {data.createdTime && formatDate(data.createdTime)}</p>
        <Table className="overflow-hidden rounded-2xl border">
          <TableHeader className=" bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-500 uppercase sm:px-6">
            <TableRow>
              <TableHead>Set</TableHead>
              <TableHead>重量</TableHead>
              <TableHead>回数</TableHead>
              <TableHead>1RM</TableHead>
              <TableHead className="">メモ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y border-2 rounded-2xl">
            {data.sets.map((set, index) => (
              <TableRow
                key={`${set.id}-${index}`}
                className={cn(" border-t px-4 py-3 text-sm uppercase sm:px-6", {
                  "bg-yellow-100": set.id === maxWeightSet.id,
                })}
              >
                <TableCell className="font-semibold">{index + 1}</TableCell>
                <TableCell className="lowercase">{set.kg}kg</TableCell>
                <TableCell className="lowercase">{set.rep}rep</TableCell>
                <TableCell className="lowercase">{set.maxWeight}kg</TableCell>
                <TableCell className="hidden text-zinc-500 sm:block">
                  {set.memo || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    </>
  );
};

export default ExerciseSetTable;
