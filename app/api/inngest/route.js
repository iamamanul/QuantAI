// import { serve } from "inngest/next";

// import { inngest } from "@/lib/inngest/client";
// import { generateIndustryInsights } from "@/lib/inngest/function";

// export const { GET, POST, PUT } = serve({
//   client: inngest,
//   functions: [generateIndustryInsights],
// });


import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/function";

// Debug environment variables
console.log("=== INNGEST DEBUG ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("INNGEST_EVENT_KEY exists:", !!process.env.INNGEST_EVENT_KEY);
console.log("INNGEST_SIGNING_KEY exists:", !!process.env.INNGEST_SIGNING_KEY);
console.log("Event key length:", process.env.INNGEST_EVENT_KEY?.length);
console.log("Signing key length:", process.env.INNGEST_SIGNING_KEY?.length);
console.log("Event key preview:", process.env.INNGEST_EVENT_KEY?.substring(0, 20) + "...");
console.log("Signing key preview:", process.env.INNGEST_SIGNING_KEY?.substring(0, 20) + "...");
console.log("==================");

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
});