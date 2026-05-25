"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// It relies on process.env.GEMINI_API_KEY being set
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("Missing or invalid GEMINI_API_KEY. Please add your key to .env.local.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateRoadmapAI(dreamJob: string, candidateSkills: string[]) {
  try {
    const ai = getAIClient();
    const prompt = `
    You are an expert career advisor. The candidate wants to become a "${dreamJob}".
    Their current skills are: ${candidateSkills.length > 0 ? candidateSkills.join(", ") : "None specified"}.
    
    Generate a concise, 4-phase career roadmap to help them achieve this goal. 
    Return the response ONLY as a raw JSON object with the following structure:
    {
      "skills": ["List", "of", "4 to 6", "core target skills"],
      "phases": [
        {
          "title": "Phase 1: Title",
          "duration": "Month 1 - 2",
          "details": ["Task 1", "Task 2", "Task 3"],
          "courses": ["Course Recommendation 1", "Course Recommendation 2"]
        },
        // exactly 4 phases total
      ]
    }
    
    Do not include markdown formatting like \`\`\`json. Just output the raw JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || "{}";
    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Error (Roadmap):", error);
    throw error;
  }
}

export async function generateJobRecommendationReasoningAI(candidateSkills: string[], jobTitle: string, jobSkills: string[]) {
  try {
    const ai = getAIClient();
    const prompt = `
    You are a professional HR assistant.
    Candidate Skills: ${candidateSkills.join(", ")}
    Job Title: ${jobTitle}
    Job Required Skills: ${jobSkills.join(", ")}
    
    Write a 1-2 sentence compelling reasoning explaining why the candidate is a good fit for this job.
    Be specific about which of their skills map well to the role, or what gap they need to fill.
    Tone: Encouraging, professional, concise.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Good fit based on your profile.";
  } catch (error) {
    console.error("Gemini Error (Reasoning):", error);
    return "Good fit based on your profile.";
  }
}

export async function generateBookmarkInsightAI(jobTitle: string, jobSkills: string[]) {
  try {
    const ai = getAIClient();
    const prompt = `
    The user just bookmarked a job for "${jobTitle}" which requires the following skills: ${jobSkills.join(", ")}.
    Provide a very concise, 2-3 sentence strategic tip on how they can tailor their resume or prepare for an interview for this specific role. 
    Make it actionable.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Tailor your resume to highlight relevant experiences for this role.";
  } catch (error) {
    console.error("Gemini Error (Bookmark):", error);
    return "Tailor your resume to highlight relevant experiences for this role.";
  }
}

export async function generateTrackerNextStepsAI(jobTitle: string, status: string) {
  try {
    const ai = getAIClient();
    const prompt = `
    The user applied for "${jobTitle}" and their current status is "${status}".
    Provide a concise, 1-2 sentence "AI Next Step" advice.
    For example, if status is "Applied", suggest reaching out to a recruiter. If "Interview", suggest practicing specific behavioral questions, etc.
    Make it highly actionable.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "Keep an eye on your email for updates from the employer.";
  } catch (error) {
    console.error("Gemini Error (Tracker):", error);
    return "Keep an eye on your email for updates from the employer.";
  }
}
