import { inngest } from "./client";

export const generateIndustryInsights = inngest.createFunction(
  { id: "generate-industry-insights" },
  { event: "url/ingest.requested" }, // or whatever event you want to trigger on
  async ({ event, step }) => {
    // Your URL ingestion logic here
    console.log("Processing URL:", event.data.url);
    
    // Add your actual logic here
    return { success: true, message: "URL processed successfully" };
  }
);