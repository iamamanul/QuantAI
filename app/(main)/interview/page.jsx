"use client";
import useSWR, { SWRConfig } from "swr";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { useRef, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function InterviewPrepPage() {
  const [isClient, setIsClient] = useState(false);
  const providerRef = useRef();

  useEffect(() => {
    setIsClient(true);
    if (!providerRef.current) {
      providerRef.current = function localStorageProvider() {
        const map = new Map(JSON.parse(localStorage.getItem("swr-assessments-cache") || "[]"));
        window.addEventListener("beforeunload", () => {
          const data = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem("swr-assessments-cache", data);
        });
        return map;
      };
    }
  }, []);

  if (!isClient) return null;

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <InterviewContent />
    </SWRConfig>
  );
}

function InterviewContent() {
  const { data: assessments, error, isLoading } = useSWR("/api/assessments");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading assessments.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
