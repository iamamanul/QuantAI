"use client";
import useSWR, { SWRConfig } from "swr";
import Link from "next/link";
import { Plus, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CoverLetterList from "./_components/cover-letter-list";
import { useRef, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CoverLetterPage() {
  const [isClient, setIsClient] = useState(false);
  const providerRef = useRef();

  useEffect(() => {
    setIsClient(true);
    if (!providerRef.current) {
      providerRef.current = function localStorageProvider() {
        const map = new Map(JSON.parse(localStorage.getItem("swr-cover-letters-cache") || "[]"));
        window.addEventListener("beforeunload", () => {
          const data = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem("swr-cover-letters-cache", data);
        });
        return map;
      };
    }
  }, []);

  if (!isClient) return null;

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <CoverLetterContent />
    </SWRConfig>
  );
}

function CoverLetterContent() {
  const { data: coverLetters, error, isLoading } = useSWR("/api/cover-letters");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading cover letters.</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-title">
                My Cover Letters
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered cover letters tailored to your applications
              </p>
            </div>
          </div>
        </div>
        <Link href="/ai-cover-letter/new">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-5 w-5 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Cover Letters</p>
              <p className="text-2xl font-bold text-blue-900">{coverLetters.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">AI Generated</p>
              <p className="text-2xl font-bold text-purple-900">
                {coverLetters.filter(letter => letter.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Ready to Use</p>
              <p className="text-2xl font-bold text-green-900">
                {coverLetters.filter(letter => letter.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Letters List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Cover Letters</h2>
          {coverLetters.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {coverLetters.length} {coverLetters.length === 1 ? 'letter' : 'letters'}
            </Badge>
          )}
        </div>
        <CoverLetterList coverLetters={coverLetters} />
      </div>
    </div>
  );
}
