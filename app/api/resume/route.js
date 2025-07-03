import { getResume } from "@/actions/resume";

export async function GET(req) {
  const data = await getResume();
  return Response.json(data);
} 