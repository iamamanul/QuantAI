"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";
import { useState, useEffect, useRef } from "react";

function ProviderToggle({ provider, setProvider }) {
  return (
    <div className="flex items-center justify-center gap-8 py-6">
      {/* Gemini Button */}
      <button
        className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-md border-2 transition-all duration-200
          ${provider === "gemini"
            ? "bg-gradient-to-br from-blue-400 to-purple-400 border-blue-500 scale-105 ring-2 ring-blue-300"
            : "bg-white border-gray-200 hover:bg-blue-50 hover:scale-105"}
        `}
        onClick={() => setProvider("gemini")}
      >
        <span className="mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#7B61FF"/>
            <ellipse cx="24" cy="24" rx="14" ry="8" fill="#fff" fillOpacity="0.9"/>
            <ellipse cx="24" cy="24" rx="8" ry="14" fill="#fff" fillOpacity="0.7"/>
            <circle cx="24" cy="24" r="6" fill="#7B61FF" fillOpacity="0.8"/>
          </svg>
        </span>
        <span className={`text-xs font-semibold tracking-wide ${provider === "gemini" ? "text-blue-900" : "text-gray-500"}`}>Gemini</span>
      </button>
      {/* Groq Button */}
      <button
        className={`flex flex-col items-center px-6 py-4 rounded-2xl shadow-md border-2 transition-all duration-200
          ${provider === "groq"
            ? "bg-gradient-to-br from-fuchsia-500 to-orange-400 border-fuchsia-600 scale-105 ring-2 ring-fuchsia-300"
            : "bg-white border-gray-200 hover:bg-fuchsia-50 hover:scale-105"}
        `}
        onClick={() => setProvider("groq")}
      >
        <span className="mb-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="40" height="40" rx="12" fill="#FF4A4A"/>
            <path d="M16 32L32 16M16 16L32 32" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </span>
        <span className={`text-xs font-semibold tracking-wide ${provider === "groq" ? "text-fuchsia-900" : "text-gray-500"}`}>Groq</span>
      </button>
    </div>
  );
}

export default function MockInterviewPage() {
  const [provider, setProvider] = useState("gemini");
  const isClient = typeof window !== "undefined";

  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem("quiz-provider");
      if (saved) setProvider(saved);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("quiz-provider", provider);
    }
  }, [provider, isClient]);

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-6xl font-bold gradient-title">Mock Interview</h1>
          <p className="text-muted-foreground">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </div>

      <ProviderToggle provider={provider} setProvider={setProvider} />
      <Quiz provider={provider} />
    </div>
  );
}
