import { getIndustryInsights } from "@/actions/dashboard";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") || "gemini";
  const data = await getIndustryInsights(provider);
  return Response.json(data);
} 