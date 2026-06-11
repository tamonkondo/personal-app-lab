import { Badge, Button, Card, CardContent } from "@repo/ui";

interface Props {
  trainingLog: {
    createdTime: string;
    memo: string;
  };
  summaryItems: { label: string; value: string }[];
}

const DailyLogsHeader = ({ trainingLog, summaryItems }: Props) => {
  return (
    <>
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/10">
                Latest Log
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {trainingLog.createdTime}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                {trainingLog.memo}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" variant="outline">
              編集する
            </Button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-3 xl:p-5">
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
};

export default DailyLogsHeader;
