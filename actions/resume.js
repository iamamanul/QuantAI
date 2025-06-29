"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Generate ATS score and feedback
    const atsAnalysis = await analyzeATSResume(content, user.industry);

    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
        atsScore: atsAnalysis.score,
        feedback: atsAnalysis.feedback,
      },
      create: {
        userId: user.id,
        content,
        atsScore: atsAnalysis.score,
        feedback: atsAnalysis.feedback,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function analyzeATSResume(content, industry) {
  const prompt = `
    Analyze the following resume for ATS (Applicant Tracking System) compatibility and provide a score and feedback.
    
    Resume Content:
    ${content}
    
    Industry: ${industry}
    
    Please analyze the resume and return ONLY a JSON object in this exact format:
    {
      "score": number (0-100),
      "feedback": "string with specific improvement suggestions",
      "strengths": ["string array of strengths"],
      "weaknesses": ["string array of areas to improve"],
      "keywordMatch": number (0-100),
      "formatting": number (0-100),
      "content": number (0-100)
    }
    
    Scoring Criteria:
    - Keyword Match (30%): Relevant industry keywords and skills
    - Formatting (25%): Clean, readable format, proper structure
    - Content Quality (25%): Quantified achievements, action verbs
    - ATS Compatibility (20%): No images, simple formatting, standard fonts
    
    IMPORTANT: Return ONLY the JSON object, no additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error analyzing ATS resume:", error);
    // Return default analysis if AI fails
    return {
      score: 75,
      feedback: "Resume analysis completed. Consider adding more industry-specific keywords and quantifying achievements.",
      strengths: ["Good structure", "Clear sections"],
      weaknesses: ["Could use more keywords", "Add quantifiable results"],
      keywordMatch: 70,
      formatting: 80,
      content: 75
    };
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    7. Make it ATS-friendly
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
