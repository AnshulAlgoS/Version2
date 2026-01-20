const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;

export interface AIProcessResponse {
  response: string;
  dailyPlanConfirmed?: boolean;
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
    const recentHistory = currentProfile.chatHistory 
      ? currentProfile.chatHistory.slice(-5).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
      : "No recent history";

    const systemPrompt = `You are an intelligent career dashboard assistant.
    
    Current Date: ${new Date().toLocaleDateString('en-CA')}
    Current Profile Context:
    ${JSON.stringify(currentProfile, null, 2)}
    
    Recent Conversation:
    ${recentHistory}

    Instructions:
    1. Check 'dailyPlanStatus' in the context.
       - If 'dailyPlanStatus.date' matches Current Date AND 'dailyPlanStatus.isConfirmed' is true:
         - The plan is LOCKED. Do NOT generate 'todoUpdates'.
         - If user tries to add tasks, politely say "Your daily plan is set for today. You can manually add tasks if needed."
    
    2. Analyze the user's input for:
       - Semester changes (e.g., "semester 3 is over")
       - Achievements (e.g., "won hackathon")
       - Goals/Plans (e.g., "grinding dsa")
       - Daily Tasks (ONLY if plan is NOT locked):
         - CRITICAL: Extract EXACT intent. Do NOT hallucinate.
         - If user says "linked list", do NOT say "arrays".
         - Format: short and actionable (max 6-8 words).
         - CATEGORY RULES: Use ONLY: "dsa", "project", "learning", "other".
         - Examples:
           - "dsa linked list" -> { "text": "Solve 2 Linked List Problems", "category": "dsa" }
       - Confirmation:
         - If user says "looks good", "yes", "confirm" regarding the plan:
           - Return "dailyPlanConfirmed": true.
           - DO NOT generate 'todoUpdates' unless the user explicitly asks to ADD/CHANGE tasks in the same message.
           - If confirming PREVIOUSLY proposed tasks, just lock the plan.
           - Respond: "Great! Plan locked for today."

    3. Return JSON:
    {
      "response": "User-facing message",
      "dailyPlanConfirmed": boolean,
      "profileUpdates": { "semester": number, "achievements": [], "bio": "..." },
      "todoUpdates": [{ "text": "...", "category": "dsa" }],
      "progressUpdates": { "semesterProgress": number }
    }
    
    IMPORTANT: Return ONLY the JSON. No markdown formatting.`;

    const data = await safeChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      { 
        temperature: 0.2, 
        max_tokens: 1024, 
        response_format: { type: "json_object" } 
      }
    );

    const content = data.choices[0]?.message?.content || "{}";
    
    // Clean content (remove <think> tags if present)
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();
    
    try {
      const parsed = JSON.parse(cleanContent);
      
      // Sanitize categories to ensure they match valid types
      if (parsed.todoUpdates && Array.isArray(parsed.todoUpdates)) {
        const validCategories = ["dsa", "project", "learning", "other"];
        parsed.todoUpdates = parsed.todoUpdates.map((todo: any) => {
          let category = todo.category?.toLowerCase() || "other";
          
          // Heuristic correction if category is wrong or generic
          if (!validCategories.includes(category)) {
             // Try to infer from text
             const text = todo.text.toLowerCase();
             if (text.includes("dsa") || text.includes("leetcode") || text.includes("problem") || text.includes("linked list") || text.includes("array")) category = "dsa";
             else if (text.includes("project") || text.includes("hackathon") || text.includes("build") || text.includes("implement")) category = "project";
             else if (text.includes("study") || text.includes("learn") || text.includes("watch") || text.includes("read")) category = "learning";
             else category = "other";
          }
          
          return {
            ...todo,
            category
          };
        });
      }

      return parsed;
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
    const data = await safeChatCompletion(
      [
        { role: "system", content: "You are a friendly but professional NPC Interviewer in a career game. Your goal is to ask 1 insightful, specific, and open-ended question to a user with the role of '" + role + "' to help them showcase their best achievements. The question should be conversational and encouraging. Do not include any internal monologue or thinking process in the output. Return ONLY the question text." },
      ],
      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      { temperature: 0.7, max_tokens: 1024 }
    );
    const content = data.choices[0]?.message?.content || "";
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
    const systemPrompt = `You are an Elite Technical Recruiter and Career Strategist.
     
     TASK: Perform a deep, personalized comparison between the "Candidate" and the "Target".
     
     1. **IDENTIFY THE TARGET PERSONA**: 
        - If the Target text is a Resume, extract the Name (e.g., "John Doe") and treat them as the "Role Model".
        - If the Target text is a JD, refer to it as "The Ideal Candidate" or the specific Role Title.
     
     2. **HOLISTIC COMPARISON (Technical + Non-Technical)**:
        - Do NOT focus only on keywords (e.g., "Missing React").
        - Compare **Experience Level**: (e.g., "John has led large-scale migrations, while you are focused on feature implementation.")
        - Compare **Soft Skills & Leadership**: (e.g., "The target emphasizes 'mentorship', 'stakeholder management', and 'strategic planning'. Your resume is too focused on individual contribution.")
        - Compare **Impact Scale**: (e.g., "Users: 1M vs 100", "Revenue: $1M vs $0").

     ${userContext ? `ADDITIONAL CANDIDATE CONTEXT (Use this to bridge gaps):
     ${userContext}` : ""}

     ${customInstructions ? `USER'S SPECIAL REQUEST:
     ${customInstructions}` : ""}
     
     Output STRICT JSON with this structure:
     {
       "score": number (0-100. Be strict.),
       "missingSkills": string[] (Top 5 critical missing Hard OR Soft skills),
       "strengths": string[] (Top 3 matching areas),
       "improvements": string[] (3-5 SPECIFIC actions. E.g., "Rewrite the 'Project X' bullet to highlight Leadership like [Target Name] does."),
       "verdict": string (Short 3-5 word punchy verdict),
       "detailedAnalysis": string (Structure this as a "Tactical Mission Report". BE EXTREMELY DETAILED AND VERBOSE. Cover every aspect.
          
          ### 🆚 Head-to-Head: You vs. [Target Name/Role]
          [Provide a paragraph comparing the two profiles at a high level. Who is the senior? Who is the specialist? What is the vibe difference?]

          ### 📉 Experience & Maturity Gap
          [Deep dive into the 'Weight' of the experience. Does the target solve harder problems? Do they use more advanced architectural patterns? Explain in detail.]

          ### 🧠 Beyond the Code (Soft Skills & Culture)
          [Analyze the 'Human' side. Leadership, communication, ownership, mentorship. Quote specific lines from the target if possible.]

          ### 🛠 Tech Stack & Tooling Delta
          [Go beyond just listing tools. How do they USE the tools? (e.g., 'They use Kubernetes for orchestration, you just use Docker for containers').]

          ### 🚀 Strategic Action Plan
          [A comprehensive step-by-step guide to closing the gap. Not just 'learn X', but 'Build a project that demonstrates Y'.]
       )
     }
     
     Do NOT include markdown formatting or explanation outside the JSON.`;

    const data = await safeChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `RESUME:\n${resumeText}\n\nTARGET RESUME / JOB DESCRIPTION:\n${jdText}` }
      ],
      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      { 
        temperature: 0.2, 
        max_tokens: 2048, 
        response_format: { type: "json_object" } 
      }
    );

    const content = data.choices[0]?.message?.content || "{}";
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

const safeChatCompletion = async (messages: any[], model: string, options: any = {}) => {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.5,
    max_tokens: options.max_tokens ?? 1024,
    top_p: options.top_p,
    response_format: options.response_format
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // 1. Try relative path (uses Vite proxy)
  try {
    const response = await fetch('/api/nvidia/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("Proxy request failed, falling back to direct API", e);
  }

  // 2. Fallback to direct URL
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  return await response.json();
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
    const data = await safeChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      { temperature: 0.6, top_p: 0.95 }
    );

    const content = data.choices[0]?.message?.content || "";
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();
    
    return cleanContent || "Unable to generate AI profile. Please try again.";
  } catch (error) {
    console.error("Error expanding profile with AI:", error);
    return `Unable to generate AI profile at this time. (Error: ${error instanceof Error ? error.message : "Unknown"})`;
  }
};

export const generateDailyPlan = async (userProfile: any) => {
  try {
    const systemPrompt = `You are a personalized AI Career Coach.
    Based on the user's profile, generate a focused daily plan.
    
    User Context:
    - Current Role: ${userProfile.currentRole || "Student"}
    - Target Role: ${userProfile.targetRole || "Software Engineer"}
    - Semester: ${userProfile.semester || 1}
    - Skills: ${userProfile.skills?.join(", ") || "General"}
    - Aspirations: ${userProfile.aspirations?.join(", ") || "Growth"}

    Output STRICT JSON ONLY:
    {
      "dailyFocus": "A short, motivating 1-sentence focus for today.",
      "todos": [
        { "text": "Specific actionable task 1 (max 6 words)", "category": "dsa" },
        { "text": "Specific actionable task 2 (max 6 words)", "category": "project" },
        { "text": "Specific actionable task 3 (max 6 words)", "category": "learning" }
      ],
      "coachMessage": "A short, encouraging tip from a friendly AI coach."
    }`;

    const data = await safeChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate my daily plan." }
      ],
      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      { 
        temperature: 0.7, 
        max_tokens: 1024, 
        response_format: { type: "json_object" } 
      }
    );

    const content = data.choices[0]?.message?.content || "{}";
    let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanContent.includes("<think>")) cleanContent = cleanContent.split("<think>")[0].trim();
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error generating daily plan:", error);
    return null;
  }
};
