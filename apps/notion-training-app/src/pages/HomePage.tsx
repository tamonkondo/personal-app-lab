import { useEffect } from "react";
import useSWR from "swr";
import fetcher from "../lib/fetch";

const HomePage = () => {
  const { data } = useSWR(
    `${import.meta.env.VITE_API_URL}/training-logs`,
    fetcher,
  );
  useEffect(() => {
    // Your effect logic here
  }, []);

  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
};

export default HomePage;
