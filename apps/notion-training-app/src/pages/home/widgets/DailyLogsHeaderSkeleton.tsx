import { Card, CardContent } from "@repo/ui/components/ui/card";

interface Props {
  statusMessage: string;
}
const summaryItems = [
  { label: "種目数", value: "-" },
  { label: "体重", value: "- kg" },
  { label: "総重量", value: "- kg" },
];

const DailyLogsHeaderSkeleton = ({ statusMessage }: Props) => {
  return (
    <>
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm lg:p-8">
        {statusMessage}
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

export default DailyLogsHeaderSkeleton;
