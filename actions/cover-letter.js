"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function improveJobDescription(jobDescription) {
  const prompt = `
    Improve the following job description to make it more clear, professional, and comprehensive for AI cover letter generation.
    
    Original Job Description:
    ${jobDescription}
    
    Please enhance it by:
    1. Clarifying vague requirements
    2. Adding missing details about responsibilities
    3. Making it more structured and readable
    4. Highlighting key skills and qualifications
    5. Adding context about the role and company expectations
    
    Return ONLY the improved job description without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const improvedDescription = result.response.text().trim();
    return improvedDescription;
  } catch (error) {
    console.error("Error improving job description:", error);
    throw new Error("Failed to improve job description");
  }
}

async function fetchGroqCoverLetter(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in the environment.");
  }
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
    const errText = await response.text();
    throw new Error("Groq API failed: " + errText);
  }
  const data = await response.json();
  let text = data.choices?.[0]?.message?.content || "";
  text = text.replace(/```(?:markdown)?\n?/g, "").trim();
  return text;
}

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.
    
    Personal Information:
    - Name: ${data.fullName}
    - Email: ${data.email}
    - Phone: ${data.phone}
    - Address: ${data.address}
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    8. Make it ATS-friendly with clear structure
    9. Include the candidate's personal information in the header
    
    Format the letter in professional markdown with proper spacing and structure.
    Start with the candidate's contact information at the top, followed by the date, company address, and then the letter content.
  `;

  try {
    let content;
    try {
      const result = await model.generateContent(prompt);
      content = result.response.text().trim();
    } catch (error) {
      console.error("Gemini failed to generate cover letter:", error);
      if (
        error.status === 429 ||
        (error.statusText && error.statusText.includes("Too Many Requests")) ||
        (error.message && error.message.includes("Too Many Requests"))
      ) {
        // Fallback to Groq
        try {
          content = await fetchGroqCoverLetter(prompt);
        } catch (groqErr) {
          console.error("Groq also failed to generate cover letter:", groqErr);
          throw new Error("Both Gemini and Groq failed to generate the cover letter. Please try again later.");
        }
      } else {
        throw error;
      }
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}
