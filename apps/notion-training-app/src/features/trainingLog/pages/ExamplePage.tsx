import { ExampleCard } from "../components/TrainingLogCard";

export function ExamplePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <a className="text-sm text-muted-foreground" href="/">
        Portfolio Portal
      </a>
      <div className="mt-6">
        <ExampleCard />
      </div>
    </main>
  );
}
