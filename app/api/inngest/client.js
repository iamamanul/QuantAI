import { Inngest } from "inngest";

export const inngest = new Inngest({ 
  id: "career-coach",
  signingKey: process.env.INNGEST_SIGNING_KEY,
  signingKeyFallback: process.env.INNGEST_SIGNING_KEY_FALLBACK,
  eventKey: process.env.INNGEST_EVENT_KEY,
  baseUrl: process.env.INNGEST_BASE_URL || 'https://api.inngest.com/',
  env: 'main', // Explicitly set environment
  baseUrl: process.env.NODE_ENV === 'production' 
    ? "https://your-app-name.vercel.app" 
    : undefined,
});