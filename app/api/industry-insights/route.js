import { getIndustryInsights } from "@/actions/dashboard";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") || "gemini";
  const forceRefresh = searchParams.get("forceRefresh") === "true";
  const data = await getIndustryInsights(provider, forceRefresh);
  return Response.json(data);
} 