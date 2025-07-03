import { getAssessments } from "@/actions/interview";

export async function GET(req) {
  const data = await getAssessments();
  return Response.json(data);
} 