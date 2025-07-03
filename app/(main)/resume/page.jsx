"use client";
import useSWR from "swr";
import ResumeBuilder from "./_components/resume-builder";

const fetcher = (url) => fetch(url).then((res) => res.json());

export const dynamic = "force-dynamic";

export default function ResumePage() {
  const { data, error, isLoading } = useSWR("/api/resume", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading resume.</div>;

  return (
    <div className="py-6">
      <ResumeBuilder initialContent={data?.content} />
    </div>
  );
}
