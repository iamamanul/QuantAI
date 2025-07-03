"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz(provider = "gemini") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  async function fetchGroqQuiz() {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in the environment.");
      throw new Error("GROQ_API_KEY is not set in the environment.");
    }
    const groqPrompt = prompt;
    let response;
    try {
      console.log("Calling Groq API for quiz generation...");
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: groqPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });
    } catch (networkErr) {
      console.error("Network error calling Groq API:", networkErr);
      throw new Error("Network error calling Groq API: " + networkErr.message);
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API failed:", errText);
      throw new Error("Groq API failed: " + errText);
    }
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/```(?:json)?\n?/g, "").trim();
    // Pre-repair: fix lines that start with = or are missing a key
    text = text.replace(/\n\s*=\s*"/g, '\n      "question": "');
    // Also fix any line that starts with = (at start of string)
    text = text.replace(/^\s*=\s*"/gm, '  "question": "');
    let quiz;
    try {
      quiz = JSON.parse(text);
      console.log("Groq parsed quiz:", quiz);
    } catch (parseErr) {
      console.warn("Groq response was not valid JSON, attempting repair...");
      try {
        const repaired = jsonrepair(text);
        quiz = JSON.parse(repaired);
        console.log("Groq quiz parsed after repair:", quiz);
      } catch (repairErr) {
        console.error("Failed to repair Groq API response:", text, repairErr);
        throw new Error("Failed to parse or repair Groq API response: " + repairErr.message + "\nRaw response: " + text);
      }
    }
    // Safety: return only the questions array
    if (Array.isArray(quiz)) {
      return quiz;
    } else if (quiz && Array.isArray(quiz.questions)) {
      return quiz.questions;
    } else {
      console.error("Groq API response did not contain a questions array:", quiz);
      throw new Error("Groq API response did not contain a questions array.");
    }
  }

  try {
    if (provider === "groq") {
      console.log("Provider requested: Groq");
      const groqQuiz = await fetchGroqQuiz();
      console.log("Returning Groq quiz to frontend.");
      return groqQuiz;
    }
    // Try Gemini
    console.log("Provider requested: Gemini");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    let quiz;
    try {
      quiz = JSON.parse(cleanedText);
      console.log("Gemini parsed quiz:", quiz);
    } catch (parseErr) {
      console.error("Failed to parse Gemini API response:", cleanedText, parseErr);
      throw new Error("Failed to parse Gemini API response: " + parseErr.message + "\nRaw response: " + cleanedText);
    }
    if (Array.isArray(quiz)) {
      return quiz;
    } else if (quiz && Array.isArray(quiz.questions)) {
      return quiz.questions;
    } else {
      console.error("Gemini API response did not contain a questions array:", quiz);
      throw new Error("Gemini API response did not contain a questions array.");
    }
  } catch (error) {
    console.error("Gemini failed or error occurred:", error);
    // Only fallback to Groq if the original provider was Gemini
    if (
      provider === "gemini" &&
      (error.status === 429 || (error.statusText && error.statusText.includes("Too Many Requests")) || error.message)
    ) {
      try {
        const groqQuiz = await fetchGroqQuiz();
        console.log("Fallback to Groq succeeded. Returning Groq quiz to frontend.");
        return groqQuiz;
      } catch (groqErr) {
        console.error("Groq fallback also failed:", groqErr);
        throw new Error("Both Gemini and Groq API limits reached or failed. Please try again tomorrow or upgrade your plan.");
      }
    }
    throw error;
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
