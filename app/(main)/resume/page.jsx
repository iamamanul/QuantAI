"use client";
import useSWR, { SWRConfig } from "swr";
import ResumeBuilder from "./_components/resume-builder";
import { useRef, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ResumePage() {
  const [isClient, setIsClient] = useState(false);
  const providerRef = useRef();

  useEffect(() => {
    setIsClient(true);
    if (!providerRef.current) {
      providerRef.current = function localStorageProvider() {
        const map = new Map(JSON.parse(localStorage.getItem("swr-resume-cache") || "[]"));
        window.addEventListener("beforeunload", () => {
          const data = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem("swr-resume-cache", data);
        });
        return map;
      };
    }
  }, []);

  if (!isClient) return null;

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <ResumeContent />
    </SWRConfig>
  );
}

function ResumeContent() {
  const { data, error, isLoading } = useSWR("/api/resume");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading resume.</div>;

  return (
    <div className="py-6">
      <ResumeBuilder initialContent={data?.content} />
    </div>
  );
}
