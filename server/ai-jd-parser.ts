import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function parseJDWithAI(text: string): Promise<any> {
  const openai = getOpenAIClient();
  if (!openai) {
    console.warn("[AI JD Parser] OPENAI_API_KEY is not set. Skipping AI parsing.");
    return null;
  }

  try {
    const jdText = text || "";
    console.log("[AI JD Parser] Processing JD, length:", jdText.length);
    
    // Trim to 10,000 characters
    const trimmedText = jdText.length > 10000 ? jdText.substring(0, 10000) : jdText;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional HR assistant and JD parsing specialist.
          Your task is to extract structured information from the provided Job Description (JD).
          
          CRITICAL RULES:
          * Return ONLY valid JSON
          * Do NOT include explanations
          * Do NOT hallucinate data
          * If a value is not present, return null
          
          OUTPUT STRUCTURE:
          {
            "position": "Job title or role name",
            "primarySkills": "Comma-separated list of core mandatory skills",
            "secondarySkills": "Comma-separated list of preferred or secondary skills",
            "knowledgeOnly": "Comma-separated list of tools/domains where only basic knowledge is required",
            "experience": "Brief summary of experience required (e.g., 5-8 years)",
            "location": "Job location or Remote/Hybrid"
          }`
        },
        {
          role: "user",
          content: `JOB DESCRIPTION TEXT:\n\"\"\"\n${trimmedText}\n\"\"\"`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    console.log("[AI JD Parser] Successfully parsed JD info.");
    return parsed;
  } catch (error: any) {
    console.error("[AI JD Parser] AI Call failed:", error.message || error);
    return null;
  }
}

function readJdFieldFromText(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  const value = match?.[1]?.trim();
  return value ? value.replace(/\s{2,}/g, " ").slice(0, 500) : null;
}

/** Regex fallback when AI parsing is unavailable or returns empty fields. */
export function extractBasicJdFieldsFromText(jdText: string) {
  const text = jdText || "";
  const position =
    readJdFieldFromText(text, /(?:position|role|job title|title)\s*[:\-]\s*([^\n]+)/i) ||
    readJdFieldFromText(text, /(?:looking for|seeking|hiring)\s*[:\-]?\s*([^\n]+)/i);

  const primarySkills =
    readJdFieldFromText(text, /(?:primary|mandatory|required|core)\s+skills?\s*[:\-]\s*([^\n]+)/i) ||
    readJdFieldFromText(text, /(?:must have|must-have)\s*[:\-]?\s*([^\n]+)/i);

  const secondarySkills =
    readJdFieldFromText(text, /(?:secondary|preferred|nice to have|good to have)\s+skills?\s*[:\-]\s*([^\n]+)/i);

  const knowledgeOnly =
    readJdFieldFromText(text, /(?:knowledge only|tools?|technologies?)\s*[:\-]\s*([^\n]+)/i);

  return {
    position,
    primarySkills,
    secondarySkills,
    knowledgeOnly,
    experience: readJdFieldFromText(text, /(?:experience|years of experience)\s*[:\-]\s*([^\n]+)/i),
    location: readJdFieldFromText(text, /(?:location|work location|job location)\s*[:\-]\s*([^\n]+)/i),
  };
}
