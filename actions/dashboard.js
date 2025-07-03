"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fallback: Groq API fetch
async function fetchGroqInsights(industry) {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    throw new Error("Groq API failed: " + (await response.text()));
  }
  const data = await response.json();
  // Extract the JSON from the response
  let text = data.choices?.[0]?.message?.content || "";
  text = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(text);
}

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    // If Gemini fails, fallback to Groq
    return await fetchGroqInsights(industry);
  }
};

export const generateCareerRoadmap = async (industry, userExperience, userSkills) => {
  const prompt = `
    Based on the following user profile, generate a personalized career roadmap in ONLY the following JSON format without any additional notes or explanations:
    
    Industry: ${industry}
    Years of Experience: ${userExperience}
    Current Skills: ${userSkills.join(', ')}
    
    Return ONLY this JSON format:
    {
      "currentLevel": "entry" | "mid" | "senior" | "expert",
      "careerPath": [
        {
          "title": "string",
          "duration": "string",
          "skills": ["string"],
          "description": "string"
        }
      ],
      "skillGaps": ["string"],
      "nextSteps": [
        {
          "action": "string",
          "priority": "high" | "medium" | "low",
          "description": "string"
        }
      ]
    }
    
    IMPORTANT GUIDELINES:
    - currentLevel should be determined by experience: entry (0-2 years), mid (2-5 years), senior (5-10 years), expert (10+ years)
    - careerPath should show 4 realistic progression steps starting from their current level
    - Each step should have realistic job titles for their industry
    - skills should be specific to each role
    - skillGaps should be the top 5 most important missing skills
    - nextSteps should be 3 actionable recommendations
    - Return ONLY the JSON, no additional text or formatting
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch Clerk user info
  let clerkUser = null;
  try {
    clerkUser = await currentUser();
  } catch (e) {
    clerkUser = null;
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // STRICT CACHE: Only call Gemini if no cached data exists
  if (!user.industryInsight) {
    try {
      const insights = await generateAIInsights(user.industry);
      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      const careerRoadmap = await generateCareerRoadmap(
        user.industry,
        user.experience || 0,
        user.skills || []
      );
      return {
        insights: industryInsight,
        user: {
          name: clerkUser?.firstName && clerkUser?.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser?.username || clerkUser?.emailAddress || "User",
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || undefined,
          skills: user.skills || [],
          experience: user.experience || 0,
          industry: user.industry || undefined,
        },
        careerRoadmap,
      };
    } catch (err) {
      if (err.status === 429 || (err.statusText && err.statusText.includes("Too Many Requests"))) {
        return {
          error: "You have reached the daily Gemini API limit for industry insights. Please try again tomorrow or upgrade your plan.",
        };
      }
      throw err;
    }
  }

  // Always use cached data if it exists
  const careerRoadmap = await generateCareerRoadmap(
    user.industry,
    user.experience || 0,
    user.skills || []
  );
  return {
    insights: user.industryInsight,
    user: {
      name: clerkUser?.firstName && clerkUser?.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser?.username || clerkUser?.emailAddress || "User",
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || undefined,
      skills: user.skills || [],
      experience: user.experience || 0,
      industry: user.industry || undefined,
    },
    careerRoadmap,
  };
}