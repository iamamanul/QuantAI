import { getCoverLetters } from "@/actions/cover-letter";

export async function GET(req) {
  const data = await getCoverLetters();
  return Response.json(data);
} 