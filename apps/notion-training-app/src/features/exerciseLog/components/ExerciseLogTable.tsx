import { ExerciseSet } from "@repo/types/notion-training-app";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { formatDate } from "@repo/utils";

interface Props {
  data: ExerciseSet[];
}
const ExerciseLogTable = ({ data }: Props) => {
  return (
    <>
      {" "}
      <>
        <p>Rest:2分</p>
        <p>Date: {data[0]?.createdTime && formatDate(data[0]?.createdTime)}</p>
        <Table className="overflow-hidden rounded-2xl border">
          <TableHeader className=" bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-500 uppercase sm:px-6">
            <TableRow>
              <TableHead>Set</TableHead>
              <TableHead>重量</TableHead>
              <TableHead>回数</TableHead>
              <TableHead className="">メモ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y border-2 rounded-2xl">
            {data.map((set, index) => (
              <TableRow
                key={`${set.exerciseId}-${set.id}`}
                className=" border-t px-4 py-3 text-sm uppercase sm:px-6"
              >
                <TableCell className="font-semibold">{index + 1}</TableCell>
                <TableCell>{set.kg}</TableCell>
                <TableCell>{set.rep}回</TableCell>
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

export default ExerciseLogTable;
