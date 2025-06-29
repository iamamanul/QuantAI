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

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
  serveHost: process.env.INNGEST_SERVE_HOST, // Add this
  servePath: "/api/inngest", // Add this
});