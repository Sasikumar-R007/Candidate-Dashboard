import mammoth from 'mammoth';
import fs from 'fs';

interface ParsedResume {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  rawText: string;
}

async function parsePdf(dataBuffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

export async function parseResumeFile(filePath: string, mimeType: string): Promise<ParsedResume> {
  let text = '';

  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      text = await parsePdf(dataBuffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume file');
  }

  const extractedData = extractContactInfo(text);
  
  return {
    ...extractedData,
    rawText: text
  };
}

function extractContactInfo(text: string): { fullName: string | null; email: string | null; phone: string | null } {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
  
  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  
  const email = emails && emails.length > 0 ? emails[0].toLowerCase() : null;
  const phone = phones && phones.length > 0 ? phones[0].replace(/[^\d+]/g, '') : null;
  
  const fullName = extractName(text);
  
  return { fullName, email, phone };
}

function extractName(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    if (line.includes('@') || line.match(/\d{5,}/) || line.match(/^[+\d\s()-]+$/)) {
      continue;
    }
    
    const commonHeaders = ['resume', 'cv', 'curriculum vitae', 'objective', 'summary', 'experience', 'education', 'skills', 'contact', 'profile'];
    if (commonHeaders.some(header => line.toLowerCase().includes(header))) {
      continue;
    }
    
    const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/;
    if (namePattern.test(line) && line.length >= 4 && line.length <= 50) {
      return line;
    }
    
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const allCapitalized = words.every(word => /^[A-Z]/.test(word));
      const noNumbers = !/\d/.test(line);
      const noSpecialChars = !/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/.test(line);
      
      if (allCapitalized && noNumbers && noSpecialChars && line.length >= 4 && line.length <= 50) {
        return line;
      }
    }
  }
  
  return null;
}

export interface BulkParseResult {
  success: boolean;
  fileName: string;
  data?: ParsedResume;
  error?: string;
}

export async function parseBulkResumes(files: Array<{ path: string; originalname: string; mimetype: string }>): Promise<BulkParseResult[]> {
  const results: BulkParseResult[] = [];
  
  for (const file of files) {
    try {
      const parsed = await parseResumeFile(file.path, file.mimetype);
      results.push({
        success: true,
        fileName: file.originalname,
        data: parsed
      });
    } catch (error) {
      results.push({
        success: false,
        fileName: file.originalname,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}
