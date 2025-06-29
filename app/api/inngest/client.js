import { Inngest } from "inngest";

export const inngest = new Inngest({ 
  id: "career-coach", // This must match your Inngest app ID exactly
  signingKey: process.env.INNGEST_SIGNING_KEY,
  signingKeyFallback: process.env.INNGEST_SIGNING_KEY_FALLBACK, // Important for key rotation
  eventKey: process.env.INNGEST_EVENT_KEY,
});