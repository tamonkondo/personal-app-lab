import { ExerciseSummary } from "@repo/types/notion-training-app";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { Link } from "react-router-dom";

interface Props {
  data: ExerciseSummary;
}
export function ExerciseLogCard({ data }: Props) {
  return (
    <article
      key={data.id}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{data.trainingName}</h2>
            <Badge variant="secondary">{data.musclesTypes.join(", ")}</Badge>
            {data.isPr ? (
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                PR更新
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-zinc-500">最大重量 {data.maxGoalWeight}</p>
        </div>
        <Link to={`/exercise/${data.id}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            種目詳細
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="maxWeightLogs" className="mt-3">
        <TabsList className="bg-color-none h-auto gap-2 [&>button]:h-auto [&>button]:cursor-pointer">
          <TabsTrigger value="maxWeightLogs">
            MaxWeight Exercise Logs
          </TabsTrigger>
          <TabsTrigger value="latestExerciseLogs">
            Latest Exercise Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="maxWeightLogs">
          <p>Rest:1分</p>
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
              {data.maxWeightSets.map((set, index) => (
                <TableRow
                  key={`${data.id}-${set.id}`}
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
        </TabsContent>
        <TabsContent value="latestExerciseLogs">
          <p>Rest:2分</p>
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
              {data.latestSets.map((set, index) => (
                <TableRow
                  key={`${data.id}-${set.id}`}
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
        </TabsContent>
      </Tabs>
    </article>
  );
}
