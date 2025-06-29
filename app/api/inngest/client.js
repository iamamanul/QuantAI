import { Inngest } from "inngest";

export const inngest = new Inngest({ 
  id: "career-coach", // This must match your Inngest app ID exactly
  signingKey: process.env.INNGEST_SIGNING_KEY,
  eventKey: process.env.INNGEST_EVENT_KEY,
});