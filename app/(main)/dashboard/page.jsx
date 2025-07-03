"use client";
import useSWR, { SWRConfig, mutate } from "swr";
import DashboardView from "./_component/dashboard-view";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

function ProviderToggle({ provider, setProvider, cacheExists }) {
  return (
    <div className="flex items-center justify-center gap-3 py-3 w-full">
      {/* Gemini Button */}
      <button
        className={`flex flex-col items-center px-3 py-2 rounded-xl shadow border transition-all duration-200 text-xs
          ${provider === "gemini"
            ? "bg-gradient-to-br from-blue-400 to-purple-400 border-blue-500 scale-105 ring-2 ring-blue-300"
            : "bg-white border-gray-200 hover:bg-blue-50 hover:scale-105"}
        `}
        style={{ minWidth: 56 }}
        onClick={() => {
          if (cacheExists && provider !== "gemini") {
            toast.info("You already have the latest insights. To refresh, please try again tomorrow.");
            return;
          }
          setProvider("gemini");
        }}
      >
        {/* Gemini SVG Icon */}
        <span className="mb-1">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#7B61FF"/>
            <ellipse cx="24" cy="24" rx="14" ry="8" fill="#fff" fillOpacity="0.9"/>
            <ellipse cx="24" cy="24" rx="8" ry="14" fill="#fff" fillOpacity="0.7"/>
            <circle cx="24" cy="24" r="6" fill="#7B61FF" fillOpacity="0.8"/>
          </svg>
        </span>
        <span className={`font-semibold tracking-wide ${provider === "gemini" ? "text-blue-900" : "text-gray-500"}`}>Gemini</span>
      </button>
      {/* Groq Button */}
      <button
        className={`flex flex-col items-center px-3 py-2 rounded-xl shadow border transition-all duration-200 text-xs
          ${provider === "groq"
            ? "bg-gradient-to-br from-fuchsia-500 to-orange-400 border-fuchsia-600 scale-105 ring-2 ring-fuchsia-300"
            : "bg-white border-gray-200 hover:bg-fuchsia-50 hover:scale-105"}
        `}
        style={{ minWidth: 56 }}
        onClick={() => {
          if (cacheExists && provider !== "groq") {
            toast.info("You already have the latest insights. To refresh, please try again tomorrow.");
            return;
          }
          setProvider("groq");
        }}
      >
        {/* Groq SVG Icon */}
        <span className="mb-1">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="40" height="40" rx="12" fill="#FF4A4A"/>
            <path d="M16 32L32 16M16 16L32 32" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </span>
        <span className={`font-semibold tracking-wide ${provider === "groq" ? "text-fuchsia-900" : "text-gray-500"}`}>Groq</span>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [provider, setProvider] = useState("gemini");

  useEffect(() => {
    setIsClient(true);
    // Load provider from localStorage
    const saved = localStorage.getItem("industry-insights-provider");
    if (saved) setProvider(saved);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("industry-insights-provider", provider);
    }
  }, [provider, isClient]);

  if (!isClient) return null;

  // Use a stable SWR key that includes the provider
  const swrKey = `/api/industry-insights?provider=${provider}`;

  return (
    <SWRConfig value={{ fetcher }}>
      <div className="flex flex-col items-center w-full mb-2">
        <ProviderToggle provider={provider} setProvider={setProvider} cacheExists={false} />
      </div>
      <IndustryInsightsContent swrKey={swrKey} />
    </SWRConfig>
  );
}

function IndustryInsightsContent({ swrKey }) {
  const router = useRouter();
  const { data: onboarding, isLoading: onboardingLoading } = useSWR(
    "/api/user-onboarding-status"
  );
  const { data, error, isLoading } = useSWR(
    onboarding && onboarding.isOnboarded ? swrKey : null
  );
  const lastGoodData = useRef(null);

  // Store last good data
  useEffect(() => {
    if (data && !data.error) {
      lastGoodData.current = data;
    }
  }, [data]);

  useEffect(() => {
    if (onboarding && !onboarding.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [onboarding, router]);

  if (onboardingLoading || (onboarding && onboarding.isOnboarded && isLoading))
    return <div>Loading...</div>;

  // If error or no data, but we have lastGoodData, just show the dashboard (no message, no yellow background)
  if ((error || !data) && lastGoodData.current) {
    const { insights, user, careerRoadmap } = lastGoodData.current;
    return (
      <div className="container mx-auto">
        <DashboardView
          insights={insights}
          user={user}
          careerRoadmap={careerRoadmap}
        />
      </div>
    );
  }

  if (error) return <div>Error loading insights.</div>;
  if (!data) return null;

  if (data.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-400 rounded-xl shadow-lg p-8 my-8">
        <span className="text-5xl mb-4">🚦</span>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Gemini API Limit Reached</h2>
        <p className="text-lg text-red-600 mb-2">{data.error}</p>
        <p className="text-base text-muted-foreground">You can try again tomorrow, or upgrade your Gemini API plan for more requests.</p>
      </div>
    );
  }

  const { insights, user, careerRoadmap } = data;

  return (
    <div className="container mx-auto">
      <DashboardView
        insights={insights}
        user={user}
        careerRoadmap={careerRoadmap}
      />
    </div>
  );
}
