import { getIndustryInsights } from "@/actions/dashboard";

export async function GET(req) {
  const data = await getIndustryInsights();
  return Response.json(data);
} 