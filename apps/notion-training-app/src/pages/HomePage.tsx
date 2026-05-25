import { useEffect } from "react";
import useSWR from "swr";
import fetcher from "../lib/fetch";
import { Button } from "@repo/ui";

const HomePage = () => {
  const { data } = useSWR(
    `${import.meta.env.VITE_API_URL}/training-logs`,
    fetcher,
  );
  useEffect(() => {
    // Your effect logic here
  }, []);

  return (
    <main className="p-4">
      {/* {data ? JSON.stringify(data) : "Loading..."} */}
      <div className="mt-4">
        <Button
          variant={"destructive"}
          className="mt-4"
          onClick={() => alert("Button clicked!")}
        >
          新しいトレーニング記録を作成
        </Button>
        <Button className="mt-4" onClick={() => console.log("Button clicked!")}>
          Click Me
        </Button>
      </div>
    </main>
  );
};

export default HomePage;
