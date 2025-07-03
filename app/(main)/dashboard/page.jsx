"use client";
import useSWR, { SWRConfig } from "swr";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import DashboardView from "./_component/dashboard-view";

// Custom localStorage cache provider for SWR
function localStorageProvider() {
  // When initializing, we restore the data from localStorage into a map
  const map = new Map(JSON.parse(localStorage.getItem("swr-industry-insights-cache") || "[]"));
  // Before unloading the app, we write back all the data into localStorage
  window.addEventListener("beforeunload", () => {
    const data = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("swr-industry-insights-cache", data);
  });
  return map;
}

const fetcher = (url) => fetch(url).then((res) => res.json());

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const router = useRouter();

  // Fetch onboarding status
  const { data: onboarding, isLoading: onboardingLoading } = useSWR(
    "/api/user-onboarding-status",
    fetcher
  );

  // Fetch dashboard data only if onboarded
  const { data, error, isLoading } = useSWR(
    onboarding && onboarding.isOnboarded ? "/api/industry-insights" : null,
    fetcher
  );

  // Redirect if not onboarded
  React.useEffect(() => {
    if (onboarding && !onboarding.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [onboarding, router]);

  // Only create the provider once
  const providerRef = useRef();
  if (!providerRef.current) {
    providerRef.current = localStorageProvider;
  }

  if (onboardingLoading || (onboarding && onboarding.isOnboarded && isLoading))
    return <div>Loading...</div>;
  if (error) return <div>Error loading insights.</div>;
  if (!data) return null;

  const { insights, user, careerRoadmap } = data;

  return (
    <SWRConfig value={{ fetcher, provider: providerRef.current }}>
      <div className="container mx-auto">
        <DashboardView
          insights={insights}
          user={user}
          careerRoadmap={careerRoadmap}
        />
      </div>
    </SWRConfig>
  );
}
