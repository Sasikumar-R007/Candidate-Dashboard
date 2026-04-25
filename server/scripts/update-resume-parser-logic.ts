import fs from 'fs';
import path from 'path';

const parserPath = path.resolve('server/resume-parser.ts');
let content = fs.readFileSync(parserPath, 'utf-8');

// Add import
if (!content.includes("from './ai-resume-parser'")) {
  content = "import { parseResumeWithAI } from './ai-resume-parser';\n" + content;
}

// Update ParsedResume interface
if (!content.includes('aiParsed?: any;')) {
  content = content.replace(
    /rawText: string;/g,
    'rawText: string;\n  aiParsed?: any;'
  );
}

// Update parseResumeFile logic using regex to match the old function
const oldParseResumeFileRegex = /export async function parseResumeFile\(filePath: string, mimeType: string\): Promise<ParsedResume> \{[\s\S]*?return \{\s*\.\.\.extractedData,\s*rawText: text\s*\};\s*\}/;

const newParseResumeFile = `export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  let text = '';

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Resume file not found');
    }

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      text = await parsePdf(dataBuffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/png') {
      throw new Error('Image-based resumes are not supported yet because OCR is not implemented. Please upload a PDF or Word document.');
    } else {
      throw new Error(\`Unsupported file type: \${mimeType}\`);
    }

    // Validate that we extracted some text
    if (!text || text.trim().length < 10) {
      throw new Error('Could not extract sufficient text from resume. The file may be corrupted, password-protected, or in an unsupported format.');
    }
    return text;
  } catch (error: any) {
    console.error('Error extracting text from resume:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Failed to extract text from resume file: ' + (error.message || 'Unknown error'));
  }
}

export async function parseResumeFile(filePath: string, mimeType: string): Promise<ParsedResume> {
  const text = await extractTextFromFile(filePath, mimeType);
  const normalizedText = repairCompactedResumeText(normalizeResumeText(text));

  // Try AI Parsing first
  try {
    const aiParsed = await parseResumeWithAI(normalizedText);
    if (aiParsed) {
      // Map AI data to ParsedResume format
      return {
        fullName: aiParsed.name,
        email: aiParsed.email,
        phone: aiParsed.phone,
        designation: aiParsed.experience?.[0]?.role || null,
        experience: aiParsed.experience?.map(e => \`\${e.role} at \${e.company} (\${e.duration}): \${e.description}\`).join('\\n') || null,
        skills: aiParsed.skills?.join(', ') || null,
        location: null,
        company: aiParsed.experience?.[0]?.company || null,
        education: aiParsed.education?.map(e => \`\${e.degree} from \${e.institution} (\${e.year})\`).join('\\n') || null,
        highestQualification: aiParsed.education?.[0]?.degree || null,
        collegeName: aiParsed.education?.[0]?.institution || null,
        linkedinUrl: null,
        portfolioUrl: null,
        websiteUrl: null,
        currentRole: aiParsed.experience?.[0]?.role || null,
        rawText: text,
        aiParsed: aiParsed
      };
    }
  } catch (aiError) {
    console.warn('AI parsing failed, falling back to regex:', aiError);
  }

  // Fallback to regex parsing
  const extractedData = extractResumeData(normalizedText);
  
  return {
    ...extractedData,
    rawText: text
  };
}`;

if (oldParseResumeFileRegex.test(content)) {
  content = content.replace(oldParseResumeFileRegex, newParseResumeFile);
  fs.writeFileSync(parserPath, content);
  console.log('resume-parser.ts updated successfully');
} else {
  console.log('Regex match failed for oldParseResumeFile');
}
