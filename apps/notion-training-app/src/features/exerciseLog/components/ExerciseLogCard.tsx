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
import { formatDate } from "@repo/utils";
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
              <>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  PR更新
                </Badge>
                <Button size="sm">Create New Goal</Button>
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <p className="text-sm text-zinc-500">
              Goal Weight:{data.maxGoalWeight.toFixed(0)}kg
            </p>
            <p className="text-sm text-zinc-500">
              Current Max Weight:{data.currentMaxWeight.toFixed(0)}kg
            </p>
            {!data.isPr && data.currentMaxWeight < data.maxGoalWeight ? (
              <p className="text-sm text-green-500">
                Only {(data.maxGoalWeight - data.currentMaxWeight).toFixed(0)}{" "}
                kg to go!!
              </p>
            ) : null}
          </div>
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
          {data.maxWeightSets.length > 0 ? (
            <>
              <p>Rest:1分</p>
              <p>
                Date:{" "}
                {data.maxWeightSets[0]?.createdTime &&
                  formatDate(data.maxWeightSets[0]?.createdTime)}
              </p>
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
                      <TableCell className="font-semibold">
                        {index + 1}
                      </TableCell>
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
          ) : (
            <p>No max weight logs available.</p>
          )}
        </TabsContent>
        <TabsContent value="latestExerciseLogs">
          {data.latestSets.length > 0 ? (
            <>
              <p>Rest:2分</p>
              <p>
                Date:{" "}
                {data.latestSets[0]?.createdTime &&
                  formatDate(data.latestSets[0]?.createdTime)}
              </p>
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
                      <TableCell className="font-semibold">
                        {index + 1}
                      </TableCell>
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
          ) : (
            <p>No latest exercise logs available.</p>
          )}
        </TabsContent>
      </Tabs>
    </article>
  );
}
