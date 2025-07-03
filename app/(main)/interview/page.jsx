"use client";
import useSWR from "swr";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function InterviewPrepPage() {
  const { data: assessments, error, isLoading } = useSWR("/api/assessments", fetcher);

  if (isLoading) return <Skeleton className="h-96 w-full my-8" />;
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
