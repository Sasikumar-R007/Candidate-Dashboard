import OpenAI from 'openai';
import { normalizeParsedSkills } from './parsed-field-format';
import { normalizeParsedEducation } from '@shared/education-format';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function parseResumeWithAI(
  text: string,
  timeoutMs: number = 30000,
): Promise<any> {
  const openai = getOpenAIClient();
  if (!openai) {
    console.warn("[AI Parser] OPENAI_API_KEY is not set. Skipping AI parsing.");
    return null;
  }

  try {
    const resumeText = text || "";

    // Trim to 10,000 characters to ensure fast processing
    const trimmedText = resumeText.length > 10000 ? resumeText.substring(0, 10000) : resumeText;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`OpenAI request timed out after ${Math.round(timeoutMs / 1000)} seconds`)),
        timeoutMs,
      ),
    );

    const apiCallPromise = openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a high-accuracy resume parsing AI used in a production SaaS system.
          Your job is to extract as much structured candidate information as possible from the given resume text.
          
          CRITICAL RULES:
          * Return ONLY valid JSON
          * Do NOT include explanations
          * Do NOT hallucinate or invent data
          * If a value is not present → return null
          * Normalize output wherever possible
          
          OUTPUT STRUCTURE:
          {
            "full_name": "",
            "emails": [],
            "phone_numbers": [],
            "location": "",
            "current_role": "",
            "total_experience": "",
            "skills": "",
            "education": [],
            "work_experience": [],
            "links": {
              "linkedin": null,
              "portfolio": null,
              "website": null
            },
            "additional_info": {
              "gender": null,
              "date_of_birth": null,
              "preferred_location": null,
              "notice_period": null,
              "current_company": "",
              "previous_company": "",
              "college": "",
              "course": "",
              "degree_level": "",
              "graduation_year": ""
            }
          }
          
          EXTRACTION GUIDELINES:
          * current_role → latest job title OR header title (Priority: Header Title)
          * total_experience → calculate from timeline (e.g., "4 years")
          * skills → plain comma-separated text only (e.g. "JavaScript, React, SQL") — NOT JSON, NOT curly braces
          * education → array of objects with degree, field_of_study, institution, year — NOT stringified JSON
          * degree_level → "Under Graduate" or "Post Graduate"`
        },
        {
          role: "user",
          content: `RESUME TEXT:\n\"\"\"\n${trimmedText}\n\"\"\"`
        }
      ]
    });

    const response: any = await Promise.race([apiCallPromise, timeoutPromise]);

    const content = response.choices[0].message.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    
    // Internal Normalization for backward compatibility
    parsed.designation = parsed.current_role;
    parsed.email = (parsed.emails && parsed.emails.length > 0) ? parsed.emails[0] : null;
    parsed.phone = (parsed.phone_numbers && parsed.phone_numbers.length > 0) ? parsed.phone_numbers[0] : null;
    parsed.experience = parsed.total_experience;
    
    // Additional Info mapping
    if (parsed.additional_info) {
      Object.assign(parsed, parsed.additional_info);
    }
    
    parsed.skills = normalizeParsedSkills(parsed.skills);
    parsed.education = normalizeParsedEducation(parsed.education);

    console.log("[AI Parser] Successfully parsed resume data with Nested Schema.");
    return parsed;
  } catch (error: any) {
    console.error("[AI Parser] AI Call failed or timed out:", error.message || error);
    return null;
  }
}

/**
 * Stage 2: Refines and Standardizes the parsed JSON data
 * Focuses on accuracy, inconsistent resolution, and data enhancement.
 */
export async function refineCandidateData(rawData: any) {
  if (!rawData) return null;

  const openai = getOpenAIClient();
  if (!openai) return rawData;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a data validation and enhancement AI.
          You will receive structured candidate data extracted from a resume.
          Your task is to:
          * Fix mismatches between designation and current_role (pick the most representative header title)
          * Normalize and Deduplicate skills (e.g. "JS, JavaScript" -> "JavaScript")
          * Standardize education format (Degree + Major)
          * Ensure experience is clear (e.g. "5 Years")
          * Fill missing fields like domain or gender if inferable
          
          RULES:
          * DO NOT change field names
          * DO NOT add new fields
          * DO NOT hallucinate
          * Return ONLY valid JSON`
        },
        {
          role: "user",
          content: JSON.stringify(rawData)
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const refinedContent = response.choices[0].message.content;
    if (refinedContent) {
      console.log('[AI Refinement] Successfully refined candidate data.');
      const refined = JSON.parse(refinedContent);
      refined.skills = normalizeParsedSkills(refined.skills);
      refined.education = normalizeParsedEducation(refined.education);
      return refined;
    }
    return rawData;
  } catch (error) {
    console.error('[AI Refinement] Refinement stage failed:', error);
    return rawData;
  }
}
