"use client";
import useSWR, { SWRConfig } from "swr";
import DashboardView from "./_component/dashboard-view";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const providerRef = useRef();

  useEffect(() => {
    setIsClient(true);
    if (!providerRef.current) {
      providerRef.current = function localStorageProvider() {
        const map = new Map(JSON.parse(localStorage.getItem("swr-industry-insights-cache") || "[]"));
        window.addEventListener("beforeunload", () => {
          const data = JSON.stringify(Array.from(map.entries()));
          localStorage.setItem("swr-industry-insights-cache", data);
        });
        return map;
      };
    }
  }, []);

  if (!isClient) return null;

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <IndustryInsightsContent />
    </SWRConfig>
  );
}

function IndustryInsightsContent() {
  const router = useRouter();
  const { data: onboarding, isLoading: onboardingLoading } = useSWR(
    "/api/user-onboarding-status"
  );
  const { data, error, isLoading } = useSWR(
    onboarding && onboarding.isOnboarded ? "/api/industry-insights" : null
  );

  useEffect(() => {
    if (onboarding && !onboarding.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [onboarding, router]);

  if (onboardingLoading || (onboarding && onboarding.isOnboarded && isLoading))
    return <div>Loading...</div>;
  if (error) return <div>Error loading insights.</div>;
  if (!data) return null;

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
