"use client";
import { useEffect, useRef, useState } from "react";

export const dynamic = "force-dynamic";

export default function ResumePage() {
  const [isClient, setIsClient] = useState(false);
  const [SWRConfig, setSWRConfig] = useState(null);
  const [useSWR, setUseSWR] = useState(null);
  const [ResumeBuilder, setResumeBuilder] = useState(null);
  const providerRef = useRef();

  useEffect(() => {
    setIsClient(true);
    import("swr").then((mod) => {
      setSWRConfig(() => mod.SWRConfig);
      setUseSWR(() => mod.default);
    });
    import("./_components/resume-builder").then((mod) => {
      setResumeBuilder(() => mod.default);
    });
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

  if (!isClient || !SWRConfig || !useSWR || !ResumeBuilder) return null;

  const fetcher = (url) => fetch(url).then((res) => res.json());

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

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <ResumeContent />
    </SWRConfig>
  );
}
