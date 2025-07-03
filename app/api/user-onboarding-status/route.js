import { getUserOnboardingStatus } from "@/actions/user";

export async function GET(req) {
  const data = await getUserOnboardingStatus();
  return Response.json(data);
} 