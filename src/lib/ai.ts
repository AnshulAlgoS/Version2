import OpenAI from "openai";

const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/nvidia/v1`;
  }
  return "https://integrate.api.nvidia.com/v1";
};

const client = new OpenAI({
  apiKey: apiKey || "dummy-key",
  baseURL: getBaseUrl(),
  dangerouslyAllowBrowser: true
});

export interface AIProcessResponse {
  response: string;
  profileUpdates?: {
    semester?: number;
    achievements?: string[];
    bio?: string;
  };
  todoUpdates?: {
    text: string;
    category: "dsa" | "project" | "learning" | "other";
  }[];
  progressUpdates?: {
    semesterProgress?: number;
  };
}

export const processUserChat = async (
  message: string,
  currentProfile: any
): Promise<AIProcessResponse> => {
  try {
    const systemPrompt = `You are an intelligent career dashboard assistant. Your goal is to analyze the user's message and extract actionable updates for their profile, calendar, and progress.
    
    Current Profile Context:
    ${JSON.stringify(currentProfile, null, 2)}

    Instructions:
    1. Analyze the user's input for:
       - Semester changes (e.g., "semester 3 is over", "starting sem 4")
       - Achievements (e.g., "won hackathon", "finalist")
       - Goals/Plans (e.g., "grinding dsa", "learning react")
       - Daily Tasks (e.g., "will do X today")
       - Resume/Career Questions: Check 'comparisons' in the context. If the user asks about resume feedback, refer to their latest match score, missing skills, and feedback.
    2. If the user mentions a new semester, update 'semester' and reset 'semesterProgress' to 0.
    3. If the user mentions achievements, append them to 'achievements'.
    4. If the user mentions plans for *today* or *soon*, create 'todoUpdates'.
    5. Always provide a conversational 'response' to the user.
       - If they talk about their resume, reference their specific missing skills from the 'comparisons' data.
       - If they have 'aspirations' in their profile (e.g., "Focus on DSA"), encourage them or suggest tasks related to those aspirations.
       - If they are starting a new day, be encouraging.
    6. Return ONLY a valid JSON object with the following structure:
    {
      "response": "User-facing message",
      "profileUpdates": { "semester": number, "achievements": ["new achievement"], "bio": "updated bio" },
      "todoUpdates": [{ "text": "Task description", "category": "dsa" }],
      "progressUpdates": { "semesterProgress": number }
    }
    
    IMPORTANT: Return ONLY the JSON. No markdown formatting.`;

    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    
    // Clean content (remove <think> tags if present)
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();
    
    try {
      return JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI JSON response", e);
      return { response: "I processed your request but had trouble updating the dashboard automatically. Could you say that again?" };
    }

  } catch (error) {
    console.error("Error processing user chat:", error);
    return { response: "I'm having trouble connecting to my brain right now. Please try again later." };
  }
};

export const generateQuestions = async (role: string) => {
  try {
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: "You are a friendly but professional NPC Interviewer in a career game. Your goal is to ask 1 insightful, specific, and open-ended question to a user with the role of '" + role + "' to help them showcase their best achievements. The question should be conversational and encouraging. Do not include any internal monologue or thinking process in the output. Return ONLY the question text." },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });
    const content = completion.choices[0]?.message?.content || "";
    // Robustly remove <think> tags, even if unclosed or malformed
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    // Fallback: if <think> exists but no closing tag (rare with high tokens), remove everything from <think> onwards
    if (cleanContent.includes("<think>")) {
      cleanContent = cleanContent.split("<think>")[0].trim();
    }
    
    // If the content is empty after cleaning (model only output thoughts), return default
    if (!cleanContent) return "What are the key projects or achievements you are most proud of in this role?";
    
    // Remove any surrounding quotes if present
    return cleanContent.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error generating question:", error);
    return "What are the key projects you have worked on?";
  }
};

export interface ComparisonResult {
  score: number;
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  verdict: string;
  detailedAnalysis?: string;
}

export const compareResumeWithJD = async (
  resumeText: string,
  jdText: string,
  userContext?: string,
  customInstructions?: string
): Promise<ComparisonResult> => {
  if (!apiKey || apiKey === "dummy-key") {
    console.error("Missing VITE_NVIDIA_API_KEY");
    throw new Error("API Key is missing. Please check your .env file.");
  }

  try {
    const systemPrompt = `You are an expert Applicant Tracking System (ATS) and Career Coach.  
    Compare the provided Resume against the Job Description (JD) or Target Resume. 
    
    ${userContext ? `ADDITIONAL USER CONTEXT (Use this to understand the candidate's true potential. If a skill is in this context but NOT in the resume, suggest adding it to the resume):
    ${userContext}` : ""}

    ${customInstructions ? `USER'S SPECIAL INSTRUCTIONS (CRITICAL: You MUST prioritize these instructions in your analysis):
    ${customInstructions}` : ""}
    
    Output STRICT JSON with this structure:
    {
      "score": number (0-100 based on keyword match and relevance),
      "missingSkills": string[] (Top 5 critical missing hard/soft skills),
      "strengths": string[] (Top 3 matching areas),
      "improvements": string[] (3 specific, actionable bullet points to improve the resume for this role. If the user has the skill in their Context but not Resume, explicitly say "Add [Skill] from your profile to your resume"),
      "verdict": string (Short 3-5 word punchy verdict like "Strong Candidate", "Needs Work", "Perfect Match"),
      "detailedAnalysis": string (A comprehensive, paragraph-style explanation of the analysis. Explain WHY specific skills are missing, HOW the resume compares to the target, and specifically address any user instructions provided. Be encouraging but honest.)
    }
    
    Do NOT include markdown formatting or explanation outside the JSON.`;

    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `RESUME:\n${resumeText}\n\nTARGET RESUME / JOB DESCRIPTION:\n${jdText}` }
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error comparing resume:", error);
    return {
      score: 0,
      missingSkills: ["Error analyzing"],
      strengths: [],
      improvements: ["Please try again later."],
      verdict: "System Error"
    };
  }
};

export const expandProfileWithAI = async (
  input: string, 
  type: "current" | "target", 
  contextAnswers?: { question: string, answer: string }[]
) => {
  let systemPrompt = "";
  let userContent = input;

  if (type === "current") {
    systemPrompt = "You are a career profile expert. Analyze the user's current role and their answers to interview questions. Generate a CONCISE professional profile summary (max 150 words). Format it with:\n- A brief 1-sentence opening summary\n- A bulleted list of 3-4 Key Strengths (using **Bold** for headers)\n- A short closing sentence on their potential.\nReturn ONLY the formatted summary.";
    if (contextAnswers) {
      userContent += "\n\nAdditional Context:\n" + contextAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n");
    }
  } else {
    systemPrompt = "You are a career strategist. Analyze the user's target role and their specific goals. Generate a CONCISE target role analysis (max 150 words). Format it with:\n- A bulleted list of 3-4 Key Requirements (using **Bold** for headers)\n- A bulleted list of 3-4 Necessary Skills\n- 1 sentence on Typical Achievements.\nReturn ONLY the formatted analysis.";
     if (contextAnswers) {
      userContent += "\n\nAdditional Context:\n" + contextAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n");
    }
  }

  try {
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || "";
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();
    
    return cleanContent || "Unable to generate AI profile. Please try again.";
  } catch (error) {
    console.error("Error expanding profile with AI:", error);
    return `Unable to generate AI profile at this time. (Error: ${error instanceof Error ? error.message : "Unknown"})`;
  }
};
