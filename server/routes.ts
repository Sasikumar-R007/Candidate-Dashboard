import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import { storage } from "./storage";
import { insertProfileSchema, insertJobPreferencesSchema, insertSkillSchema, insertSavedJobSchema, insertJobApplicationSchema, insertRequirementSchema, insertEmployeeSchema, insertImpactMetricsSchema, supportConversations, supportMessages, insertMeetingSchema, meetings, insertTargetMappingsSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import "./types"; // Import session types
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
// import pdfParse from "pdf-parse"; // Use dynamic import to avoid initialization issues
import mammoth from "mammoth";

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow image files and PDFs only
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|avif|pdf)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    
    // Check MIME types including modern image formats and PDF
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/avif', // Modern image formats
      'application/pdf'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF, WebP, AVIF), PDFs, and Word documents are allowed!'));
    }
  }
});

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const candidateRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  age: z.string().optional(),
  location: z.string().optional()
});

const candidateLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits")
});

// Resume parsing utilities
function extractNameFromText(text: string): string | null {
  // Simple name extraction - look for patterns at the beginning of the resume
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Look for name patterns in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip common headers
    if (line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('curriculum') ||
        line.toLowerCase().includes('vitae')) {
      continue;
    }
    
    // Look for likely name pattern (2-4 words, each capitalized, no numbers)
    const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/;
    if (namePattern.test(line)) {
      return line;
    }
  }
  
  return null;
}

function extractEmailFromText(text: string): string | null {
  // More comprehensive email patterns
  const emailPatterns = [
    // Standard email pattern
    /\b[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,}\b/gi,
    // Email with special characters
    /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\b/gi,
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Filter out common false positives
      const validEmail = matches.find(email => {
        const lower = email.toLowerCase();
        // Exclude common false positives
        return !lower.includes('example.com') && 
               !lower.includes('sample.com') &&
               !lower.includes('test.com') &&
               !lower.includes('domain.com') &&
               lower.split('@')[1].includes('.') && // Must have TLD
               lower.split('@')[0].length > 0; // Must have username
      });
      
      if (validEmail) {
        return validEmail.toLowerCase();
      }
    }
  }
  
  return null;
}

function extractPhoneFromText(text: string): string | null {
  // Multiple phone patterns
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,  // US format
    /(\+?\d{1,3}[-.\s]?)?\d{10}/,  // 10 digit
    /(\+?\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,  // Various formats
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\D/g, ''); // Remove non-digits
    }
  }
  
  return null;
}

async function parseResumeFile(filePath: string, fileType: string): Promise<{
  text: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}> {
  let text = '';
  
  try {
    if (fileType === 'pdf') {
      try {
        // Read the file buffer
        const dataBuffer = fs.readFileSync(filePath);
        
        // Import pdf-parse with proper error handling
        let pdfParse;
        try {
          const pdfParseModule = await import('pdf-parse');
          pdfParse = pdfParseModule.default || pdfParseModule;
        } catch (importError) {
          console.error('Error importing pdf-parse:', importError);
          throw new Error('PDF parser not available');
        }
        
        // Parse the PDF with options to handle errors gracefully
        const pdfData = await pdfParse(dataBuffer, {
          // Disable auto-loading of test files
          max: 0
        });
        text = pdfData.text || '';
        
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError.message);
        // If PDF parsing fails completely, return empty text instead of throwing
        // This allows email extraction to fail gracefully
        text = '';
      }
    } else if (fileType === 'docx') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
      } catch (docxError: any) {
        console.error('DOCX parsing error:', docxError.message);
        text = '';
      }
    }
    
    // Extract name first (needs line breaks preserved)
    const name = extractNameFromText(text);
    
    // Then normalize text for email and phone extraction
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const email = extractEmailFromText(normalizedText);
    const phone = extractPhoneFromText(normalizedText);
    
    return { text, name, email, phone };
  } catch (error: any) {
    console.error('Error parsing file:', error.message);
    // Return empty data instead of throwing - let the email validation handle the failure
    return { text: '', name: null, email: null, phone: null };
  }
}

// Authentication middleware for candidate routes
function requireCandidateAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.candidateId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Authentication middleware for employee routes
function requireEmployeeAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId) {
    return res.status(401).json({ message: "Employee authentication required" });
  }
  next();
}

// Authentication middleware for support team ONLY
function requireSupportAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.employeeId || req.session.employeeRole !== 'support') {
    return res.status(403).json({ message: "Access denied. Support team authentication required." });
  }
  next();
}

async function processBulkUpload(jobId: string): Promise<void> {
  try {
    const job = await storage.getBulkUploadJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    const files = await storage.getBulkUploadFilesByJobId(jobId);
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    
    for (const file of files) {
      try {
        // Update file status to processing
        await storage.updateBulkUploadFile(file.id, { 
          status: 'processing',
          processedAt: new Date().toISOString()
        });
        
        // Parse the resume file
        const filePath = path.join(uploadsDir, file.fileName);
        const parsed = await parseResumeFile(filePath, file.fileType);
        
        // Create candidate if we have email
        let candidateId = null;
        if (parsed.email) {
          try {
            // Check if candidate with this email already exists
            const existingCandidate = await storage.getCandidateByEmail(parsed.email);
            
            if (!existingCandidate) {
              // Generate candidate ID
              const nextCandidateId = await storage.generateNextCandidateId();
              
              // Create new candidate
              const candidate = await storage.createCandidate({
                candidateId: nextCandidateId,
                fullName: parsed.name || 'Unknown',
                email: parsed.email,
                password: await bcrypt.hash('defaultPassword123', 10), // Default password
                phone: parsed.phone,
                createdAt: new Date().toISOString()
              });
              
              candidateId = candidate.id;
              successCount++;
            } else {
              candidateId = existingCandidate.id;
              successCount++;
            }
          } catch (candidateError) {
            console.error('Error creating candidate:', candidateError);
            failedCount++;
            
            await storage.updateBulkUploadFile(file.id, {
              status: 'failed',
              errorMessage: 'Failed to create candidate profile'
            });
            continue;
          }
        }
        
        // Update file with extracted data
        await storage.updateBulkUploadFile(file.id, {
          status: parsed.email ? 'success' : 'failed',
          candidateId,
          parsedText: parsed.text.substring(0, 5000), // Limit text length
          extractedName: parsed.name,
          extractedEmail: parsed.email,
          extractedPhone: parsed.phone,
          errorMessage: parsed.email ? null : 'No email found in resume'
        });
        
        if (!parsed.email) {
          failedCount++;
        }
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalName}:`, fileError);
        failedCount++;
        
        await storage.updateBulkUploadFile(file.id, {
          status: 'failed',
          errorMessage: fileError instanceof Error ? fileError.message : 'Unknown processing error'
        });
      }
      
      processedCount++;
      
      // Update job progress
      await storage.updateBulkUploadJob(jobId, {
        processedFiles: processedCount.toString(),
        successfulFiles: successCount.toString(),
        failedFiles: failedCount.toString()
      });
    }
    
    // Mark job as completed
    await storage.updateBulkUploadJob(jobId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    // Create notification for admin
    await storage.createNotification({
      userId: job.adminId,
      type: 'bulk_upload_complete',
      title: 'Bulk Resume Upload Complete',
      message: `Processed ${processedCount} files. ${successCount} successful, ${failedCount} failed.`,
      relatedJobId: jobId,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Bulk upload processing error:', error);
    
    // Mark job as failed
    await storage.updateBulkUploadJob(jobId, {
      status: 'failed',
      completedAt: new Date().toISOString()
    });
    
    // Create error notification
    const job = await storage.getBulkUploadJob(jobId);
    if (job) {
      await storage.createNotification({
        userId: job.adminId,
        type: 'bulk_upload_failed',
        title: 'Bulk Resume Upload Failed',
        message: `Bulk upload processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        relatedJobId: jobId,
        createdAt: new Date().toISOString()
      });
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee Authentication Routes
  app.post("/api/auth/employee-login", async (req, res) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validationResult.error.errors 
        });
      }
      
      const { email, password } = validationResult.data;
      
      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);
      console.log('[DEBUG] Employee found:', employee ? `Yes (${employee.email})` : 'No');
      if (!employee) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if employee has login credentials configured
      if (!employee.password) {
        return res.status(401).json({ message: "Login credentials not configured for this account. Please contact your administrator." });
      }
      
      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      console.log('[DEBUG] Password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if employee is active
      if (!employee.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: "Internal server error" });
        }
        
        // Set session after regeneration
        req.session.employeeId = employee.id;
        req.session.employeeRole = employee.role;
        req.session.userType = 'employee';
        
        // Save session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Internal server error" });
          }
          
          // Return employee data (excluding password) for frontend routing
          const { password: _, ...employeeData } = employee;
          res.json({
            success: true,
            employee: employeeData,
            message: "Login successful"
          });
        });
      });
    } catch (error) {
      console.error('Employee login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Support Team Authentication Route
  app.post("/api/auth/support-login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validationResult.error.errors 
        });
      }
      
      const { email, password } = validationResult.data;
      
      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);
      
      // Check if employee exists and has support role
      if (!employee || employee.role !== 'support') {
        return res.status(401).json({ message: "Invalid credentials or access denied" });
      }
      
      // Check if employee has login credentials configured
      if (!employee.password) {
        return res.status(401).json({ message: "Login credentials not configured for this account. Please contact your administrator." });
      }
      
      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials or access denied" });
      }
      
      // Check if employee is active
      if (!employee.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: "Internal server error" });
        }
        
        // Set session with support role
        req.session.employeeId = employee.id;
        req.session.employeeRole = 'support';
        req.session.userType = 'support';
        
        // Save session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Internal server error" });
          }
          
          // Return employee data (excluding password)
          const { password: _, ...employeeData } = employee;
          res.json({
            success: true,
            employee: employeeData,
            message: "Support login successful"
          });
        });
      });
    } catch (error) {
      console.error('Support login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Candidate Authentication Routes
  app.post("/api/auth/candidate-register", async (req, res) => {
    try {
      // Validate request body
      const validationResult = candidateRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const candidateData = validationResult.data;

      // Check if candidate already exists
      const existingCandidate = await storage.getCandidateByEmail(candidateData.email);
      if (existingCandidate) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Generate candidate ID and create candidate
      const candidateId = await storage.generateNextCandidateId();
      const newCandidate = await storage.createCandidate({
        ...candidateData,
        candidateId,
        isActive: true,
        isVerified: false,
        createdAt: new Date().toISOString()
      });

      // Generate 6-digit OTP for verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiry (10 minutes)
      await storage.storeOTP(candidateData.email, otp);
      
      // For demo purposes, show OTP in alert as requested by user
      // In production, this would be sent via email
      res.json({
        success: true,
        message: "Registration successful! Please verify with OTP",
        candidateId: newCandidate.candidateId,
        otp: otp, // For demo only - in production, would send via email
        email: newCandidate.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Candidate registration error:', error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/auth/candidate-login", async (req, res) => {
    try {
      // Validate request body
      const validationResult = candidateLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, password } = validationResult.data;

      // Check login attempts and lockout
      const loginAttempts = await storage.getLoginAttempts(email);
      const now = new Date().toISOString();
      
      if (loginAttempts?.lockedUntil && new Date(loginAttempts.lockedUntil) > new Date()) {
        return res.status(423).json({
          message: "You can't login for next 30 mins",
          locked: true,
          lockedUntil: loginAttempts.lockedUntil
        });
      }

      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        // Increment login attempts for failed login
        await storage.createOrUpdateLoginAttempts({
          email,
          attempts: loginAttempts ? (parseInt(loginAttempts.attempts) + 1).toString() : "1",
          lastAttemptAt: now,
          lockedUntil: null,
          createdAt: loginAttempts?.createdAt || now
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, candidate.password);
      if (!isPasswordValid) {
        const currentAttempts = loginAttempts ? parseInt(loginAttempts.attempts) + 1 : 1;
        
        // Check if this is the 3rd failed attempt
        if (currentAttempts >= 3) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + 30);
          
          await storage.createOrUpdateLoginAttempts({
            email,
            attempts: currentAttempts.toString(),
            lastAttemptAt: now,
            lockedUntil: lockUntil.toISOString(),
            createdAt: loginAttempts?.createdAt || now
          });
          
          return res.status(423).json({
            message: "You can't login for next 30 mins",
            locked: true,
            lockedUntil: lockUntil.toISOString()
          });
        } else {
          await storage.createOrUpdateLoginAttempts({
            email,
            attempts: currentAttempts.toString(),
            lastAttemptAt: now,
            lockedUntil: null,
            createdAt: loginAttempts?.createdAt || now
          });
          
          return res.status(401).json({
            message: "Invalid credentials",
            attemptsRemaining: 3 - currentAttempts
          });
        }
      }

      // Check if candidate is active
      if (!candidate.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Check if candidate is verified
      if (!candidate.isVerified) {
        // Generate new OTP for unverified accounts
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await storage.storeOTP(candidate.email, otp);
        
        return res.status(403).json({
          message: "Account not verified. Please verify with OTP",
          requiresVerification: true,
          otp: otp, // For demo only - in production, would send via email
          email: candidate.email
        });
      }

      // Reset login attempts on successful login
      await storage.resetLoginAttempts(email);

      // Store candidate ID (human-readable) in session for downstream lookups
      req.session.candidateId = candidate.candidateId;
      req.session.userType = 'candidate';

      // Return candidate data (excluding password) for frontend routing
      const { password: _, ...candidateData } = candidate;
      res.json({
        success: true,
        candidate: candidateData,
        message: "Login successful"
      });
    } catch (error) {
      console.error('Candidate login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/candidate-verify-otp", async (req, res) => {
    try {
      const validationResult = otpVerificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validationResult.error.errors
        });
      }

      const { email, otp } = validationResult.data;

      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Verify OTP against stored value with expiry check
      const isOtpValid = await storage.verifyOTP(email, otp);
      
      if (isOtpValid) {
        // Mark candidate as verified
        await storage.updateCandidate(candidate.id, { isVerified: true });

        // Reset login attempts
        await storage.resetLoginAttempts(email);

        // Store candidate ID (human-readable) in session for downstream lookups
        req.session.candidateId = candidate.candidateId;
        req.session.userType = 'candidate';

        const { password: _, ...candidateData } = candidate;
        res.json({
          success: true,
          candidate: { ...candidateData, isVerified: true },
          message: "Verification successful"
        });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Password change endpoints
  app.post("/api/employee/change-password", async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      
      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Email, current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password in storage
      const updateSuccess = await storage.updateEmployeePassword(email, hashedNewPassword);
      if (!updateSuccess) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error('Employee password change error:', error);
      res.status(500).json({ message: "Password change failed" });
    }
  });

  app.post("/api/candidate/change-password", async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      
      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Email, current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      // Find candidate by email
      const candidate = await storage.getCandidateByEmail(email);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, candidate.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password in storage
      const updateSuccess = await storage.updateCandidatePassword(email, hashedNewPassword);
      if (!updateSuccess) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error('Candidate password change error:', error);
      res.status(500).json({ message: "Password change failed" });
    }
  });

  // Logout endpoints
  app.post("/api/auth/candidate-logout", async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.error('Candidate logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.post("/api/auth/employee-logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({
          success: true,
          message: "Logged out successfully"
        });
      });
    } catch (error) {
      console.error('Employee logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Temporary seed endpoint to initialize sample employees for testing
  app.post("/api/seed-employees", async (req, res) => {
    try {
      // Check if employees already exist
      const existingEmployees = await storage.getAllEmployees();
      if (existingEmployees.length > 0) {
        return res.json({ message: "Employees already exist", count: existingEmployees.length });
      }

      // Create sample employees
      const currentTimestamp = new Date().toISOString();
      const sampleEmployees = [
        {
          employeeId: "STTA001",
          name: "Ram Kumar",
          email: "ram@gmail.com", 
          password: "ram123",
          role: "recruiter",
          age: "28",
          phone: "9876543210",
          department: "Talent Acquisition",
          joiningDate: "2024-01-15",
          reportingTo: "Team Lead",
          createdAt: currentTimestamp
        },
        {
          employeeId: "STTL001",
          name: "Priya Sharma",
          email: "priya@gmail.com",
          password: "priya123", 
          role: "team_leader",
          age: "32",
          phone: "9876543211",
          department: "Talent Acquisition",
          joiningDate: "2023-06-10",
          reportingTo: "Admin",
          createdAt: currentTimestamp
        },
        {
          employeeId: "STCL001",
          name: "Arjun Patel",
          email: "arjun@gmail.com",
          password: "arjun123",
          role: "client",
          age: "35", 
          phone: "9876543212",
          department: "Client Relations",
          joiningDate: "2023-03-20",
          reportingTo: "Admin",
          createdAt: currentTimestamp
        },
        {
          employeeId: "ADMIN",
          name: "Admin User",
          email: "admin@gmail.com",
          password: "admin123",
          role: "admin",
          age: "40",
          phone: "9876543213", 
          department: "Administration",
          joiningDate: "2022-01-01",
          reportingTo: "CEO",
          createdAt: currentTimestamp
        }
      ];

      const createdEmployees = [];
      for (const emp of sampleEmployees) {
        const employee = await storage.createEmployee(emp);
        createdEmployees.push({ id: employee.id, name: employee.name, email: employee.email, role: employee.role });
      }

      res.json({ 
        message: "Sample employees created successfully", 
        employees: createdEmployees 
      });
    } catch (error) {
      console.error('Seed employees error:', error);
      res.status(500).json({ message: "Failed to create sample employees", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // NOTE: Admin endpoints disabled for security - require proper authentication before enabling

  // Get current candidate profile
  app.get("/api/profile", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Transform candidate data to match profile structure expected by frontend
      const profile = {
        id: candidate.id,
        userId: candidate.id,
        firstName: candidate.fullName.split(' ')[0] || '',
        lastName: candidate.fullName.split(' ').slice(1).join(' ') || '',
        email: candidate.email,
        phone: candidate.phone || '',
        title: candidate.designation || '',
        location: candidate.location || '',
        gender: candidate.gender || '',
        profilePicture: candidate.profilePicture || '',
        bannerImage: candidate.bannerImage || '',
        resumeFile: candidate.resumeFile || '',
        resumeText: candidate.resumeText || '',
        skills: candidate.skills || '',
        experience: candidate.experience || '',
        currentCompany: candidate.company || '',
        currentRole: candidate.currentRole || '',
        education: candidate.education || '',
        portfolioUrl: candidate.portfolioUrl || '',
        websiteUrl: candidate.websiteUrl || '',
        linkedinUrl: candidate.linkedinUrl || '',
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy profile route for demo user (keeping for other parts of the app)
  app.get("/api/profile/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update profile
  app.patch("/api/profile", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Transform profile data to candidate fields
      const updates: any = {};
      
      // Map profile fields to candidate fields
      if (req.body.firstName || req.body.lastName) {
        const firstName = req.body.firstName || candidate.fullName.split(' ')[0];
        const lastName = req.body.lastName || candidate.fullName.split(' ').slice(1).join(' ');
        updates.fullName = `${firstName} ${lastName}`.trim();
      }
      
      if (req.body.phone !== undefined) updates.phone = req.body.phone;
      if (req.body.title !== undefined) updates.designation = req.body.title;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.gender !== undefined) updates.gender = req.body.gender;
      if (req.body.skills !== undefined) updates.skills = req.body.skills;
      if (req.body.currentCompany !== undefined) updates.company = req.body.currentCompany;
      if (req.body.currentRole !== undefined) updates.currentRole = req.body.currentRole;
      if (req.body.education !== undefined) updates.education = req.body.education;
      if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;
      if (req.body.bannerImage !== undefined) updates.bannerImage = req.body.bannerImage;
      if (req.body.resumeFile !== undefined) updates.resumeFile = req.body.resumeFile;
      if (req.body.resumeText !== undefined) updates.resumeText = req.body.resumeText;
      if (req.body.portfolioUrl !== undefined) updates.portfolioUrl = req.body.portfolioUrl;
      if (req.body.websiteUrl !== undefined) updates.websiteUrl = req.body.websiteUrl;
      if (req.body.linkedinUrl !== undefined) updates.linkedinUrl = req.body.linkedinUrl;
      
      // Update candidate in storage
      const updatedCandidate = await storage.updateCandidate(candidate.id, updates);
      
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Failed to update candidate" });
      }
      
      // Return data in profile format expected by frontend
      const profile = {
        id: updatedCandidate.id,
        userId: updatedCandidate.id,
        firstName: updatedCandidate.fullName.split(' ')[0] || '',
        lastName: updatedCandidate.fullName.split(' ').slice(1).join(' ') || '',
        email: updatedCandidate.email,
        phone: updatedCandidate.phone || '',
        title: updatedCandidate.designation || '',
        location: updatedCandidate.location || '',
        gender: updatedCandidate.gender || '',
        profilePicture: updatedCandidate.profilePicture || '',
        bannerImage: updatedCandidate.bannerImage || '',
        resumeFile: updatedCandidate.resumeFile || '',
        resumeText: updatedCandidate.resumeText || '',
        skills: updatedCandidate.skills || '',
        experience: updatedCandidate.experience || '',
        currentCompany: updatedCandidate.company || '',
        currentRole: updatedCandidate.currentRole || '',
        education: updatedCandidate.education || '',
        portfolioUrl: updatedCandidate.portfolioUrl || '',
        websiteUrl: updatedCandidate.websiteUrl || '',
        linkedinUrl: updatedCandidate.linkedinUrl || '',
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get job preferences for candidate
  app.get("/api/job-preferences", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      
      // Return mock job preferences for now
      const jobPreferences = {
        id: 'pref-1',
        profileId: candidateId,
        jobTitles: 'Software Engineer, Full Stack Developer',
        workMode: 'Remote',
        employmentType: 'Full-time',
        locations: 'Bangalore, Mumbai, Remote',
        startDate: 'Immediate',
        instructions: ''
      };
      
      res.json(jobPreferences);
    } catch (error) {
      console.error('Get job preferences error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy job preferences route
  app.get("/api/job-preferences/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const preferences = await storage.getJobPreferences(profile.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update job preferences
  app.patch("/api/job-preferences", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updatedPreferences = await storage.updateJobPreferences(profile.id, req.body);
      res.json(updatedPreferences);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get skills for candidate
  app.get("/api/skills", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate || !candidate.skills) {
        return res.json([]);
      }
      
      // Parse skills string into array of skill objects
      const skillsArray = candidate.skills.split(',').map((skill, index) => ({
        id: `skill-${index}`,
        profileId: candidateId,
        name: skill.trim(),
        category: 'primary'
      }));
      
      res.json(skillsArray);
    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy skills route
  app.get("/api/skills/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const skills = await storage.getSkillsByProfile(profile.id);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get activities
  app.get("/api/activities", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const activities = await storage.getActivitiesByProfile(profile.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create activity
  app.post("/api/activities", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const activityData = {
        ...req.body,
        profileId: profile.id,
        date: new Date().toLocaleDateString()
      };
      
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get job applications for candidate
  app.get("/api/job-applications", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Get real job applications from database
      const jobApplications = await storage.getJobApplicationsByProfile(candidate.id);
      
      res.json(jobApplications);
    } catch (error) {
      console.error('Get job applications error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create job application for candidate
  app.post("/api/job-applications", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Validate request body using zod
      const validationResult = insertJobApplicationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validationResult.error.errors 
        });
      }

      // Check for duplicate application
      const existingApplications = await storage.getJobApplicationsByProfile(candidate.id);
      const isDuplicate = existingApplications.some(
        app => app.jobTitle === validationResult.data.jobTitle && app.company === validationResult.data.company
      );
      
      if (isDuplicate) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      // Create the job application with server-side defaults
      const applicationData = {
        ...validationResult.data,
        profileId: candidate.id,
      };

      const application = await storage.createJobApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error) {
      console.error('Create job application error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy job applications route
  app.get("/api/job-applications/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const applications = await storage.getJobApplicationsByProfile(profile.id);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload endpoints
  app.post("/api/upload/banner", requireCandidateAuth, upload.single('banner'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // In production, consider using cloud storage like AWS S3, Cloudinary, etc.
      // For now, using local storage with proper URL generation
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      // Save banner URL to candidate profile
      await storage.updateCandidate(candidate.id, { bannerImage: fileUrl });
      
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/profile", requireCandidateAuth, upload.single('profile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      // Save profile picture URL to candidate profile
      await storage.updateCandidate(candidate.id, { profilePicture: fileUrl });
      
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/resume", requireCandidateAuth, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      // Save resume URL to candidate profile
      await storage.updateCandidate(candidate.id, { resumeFile: fileUrl });
      
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Placeholder image generator
  app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    const size = Math.min(parseInt(width) || 60, parseInt(height) || 60);
    
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="12" fill="#666">
          Logo
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get saved jobs for candidate
  app.get("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Use candidate's UUID as profileId for saved jobs
      const savedJobs = await storage.getSavedJobsByProfile(candidate.id);
      res.json(savedJobs);
    } catch (error) {
      console.error('Get saved jobs error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Legacy saved jobs route
  app.get("/api/saved-jobs/demo", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const savedJobs = await storage.getSavedJobsByProfile(profile.id);
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save a job
  app.post("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.session.candidateId!;
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const validatedData = insertSavedJobSchema.parse({
        ...req.body,
        profileId: candidate.id,
        savedDate: new Date().toISOString()
      });
      
      const savedJob = await storage.createSavedJob(validatedData);
      res.json(savedJob);
    } catch (error) {
      console.error('Save job error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove saved job
  app.delete("/api/saved-jobs", requireCandidateAuth, async (req, res) => {
    try {
      const { jobTitle, company } = req.body;
      const candidateId = req.session.candidateId!;
      
      const candidate = await storage.getCandidateByCandidateId(candidateId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      const removed = await storage.removeSavedJob(candidate.id, jobTitle, company);
      if (removed) {
        res.json({ message: "Job removed from saved jobs" });
      } else {
        res.status(404).json({ message: "Saved job not found" });
      }
    } catch (error) {
      console.error('Remove saved job error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Leader Dashboard API routes
  app.get("/api/team-leader/profile", (req, res) => {
    res.json(teamLeaderProfile);
  });

  app.get("/api/team-leader/team-members", (req, res) => {
    const teamMembers = [
      { id: "tm-001", name: "Sudharshan", salary: "2,95,000 INR", year: "2024-2025", profilesCount: "10" },
      { id: "tm-002", name: "Deepika", salary: "1,95,000 INR", year: "2024-2025", profilesCount: "5" },
      { id: "tm-003", name: "Dharshan", salary: "1,80,000 INR", year: "2024-2025", profilesCount: "4" },
      { id: "tm-004", name: "Kavya", salary: "2,30,000 INR", year: "2024-2025", profilesCount: "2" },
      { id: "tm-005", name: "Thamarai Selvi", salary: "2,50,000 INR", year: "2024-2025", profilesCount: "3" },
      { id: "tm-006", name: "Karthikayan", salary: "2,50,000 INR", year: "2024-2025", profilesCount: "2" }
    ];
    res.json(teamMembers);
  });

  app.get("/api/team-leader/target-metrics", (req, res) => {
    const targetMetrics = {
      id: "target-001",
      currentQuarter: "ASO-2025",
      minimumTarget: "15,00,000",
      targetAchieved: "10,00,000",
      incentiveEarned: "50,000"
    };
    res.json(targetMetrics);
  });

  app.get("/api/team-leader/daily-metrics", (req, res) => {
    const dailyMetrics = {
      id: "daily-001",
      date: "12-Aug-2025",
      totalRequirements: "20",
      completedRequirements: "12",
      avgResumesPerRequirement: "02",
      requirementsPerRecruiter: "03",
      dailyDeliveryDelivered: "3",
      dailyDeliveryDefaulted: "1"
    };
    res.json(dailyMetrics);
  });

  app.get("/api/team-leader/meetings", (req, res) => {
    const meetings = [
      { id: "meeting-001", type: "TL's Meeting", count: "3" },
      { id: "meeting-002", type: "CEO's Meeting", count: "1" }
    ];
    res.json(meetings);
  });

  app.get("/api/team-leader/ceo-comments", (req, res) => {
    const comments = [
      { id: "comment-001", comment: "Discuss with Shri Ragavi on her production", date: "12-Aug-2025" },
      { id: "comment-002", comment: "Discuss with Kavya about her leaves", date: "12-Aug-2025" },
      { id: "comment-003", comment: "Discuss with Umar for data", date: "12-Aug-2025" }
    ];
    res.json(comments);
  });

  // Team leader requirements endpoint
  app.get("/api/team-leader/requirements", (req, res) => {
    res.json([
      { id: "req-001", position: "Mobile App Developer", criticality: "HIGH", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
      { id: "req-002", position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
      { id: "req-003", position: "Frontend Developer", criticality: "MEDIUM", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
      { id: "req-004", position: "QA Tester", criticality: "HIGH", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" },
      { id: "req-005", position: "Mobile App Developer", criticality: "MEDIUM", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
      { id: "req-006", position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
      { id: "req-007", position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
      { id: "req-008", position: "Frontend Developer", criticality: "HIGH", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
      { id: "req-009", position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
      { id: "req-010", position: "QA Tester", criticality: "MEDIUM", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" },
      { id: "req-011", position: "Mobile App Developer", criticality: "HIGH", company: "Designify", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
      { id: "req-012", position: "Backend Developer", criticality: "LOW", company: "Tesco", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Unassigned" },
      { id: "req-013", position: "Frontend Developer", criticality: "HIGH", company: "CodeLabs", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
      { id: "req-014", position: "QA Tester", criticality: "LOW", company: "TechCorp", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Arun" }
    ]);
  });

  // Team leader requirements priority distribution
  app.get("/api/team-leader/requirements-distribution", (req, res) => {
    res.json({
      high: 15,
      medium: 9,
      low: 3,
      total: 27
    });
  });

  // Team Leader file upload endpoints
  app.post("/api/team-leader/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/team-leader/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // In-memory storage for team leader profile to persist changes
  let teamLeaderProfile = {
    id: "tl-001",
    name: "John Mathew",
    role: "Team Leader",
    employeeId: "STL01",
    phone: "90347 59092",
    email: "john@scalingtheory.com",
    joiningDate: "03-March-2021",
    department: "Talent Advisory",
    reportingTo: "Yatna Prakash",
    totalContribution: "2,50,000",
    bannerImage: null,
    profilePicture: null
  };

  // Update the existing GET endpoint to use stored profile
  app.get("/api/team-leader/profile", (req, res) => {
    res.json(teamLeaderProfile);
  });

  // Team Leader profile update endpoint
  app.patch("/api/team-leader/profile", (req, res) => {
    const updates = req.body;
    
    // Merge updates with existing profile to preserve other fields
    teamLeaderProfile = {
      ...teamLeaderProfile,
      ...updates
    };
    
    res.json(teamLeaderProfile);
  });

  // Admin Dashboard API routes and file uploads
  // In-memory storage for admin profile to persist changes
  let adminProfile = {
    id: "admin-001",
    name: "John Mathew",
    role: "CEO",
    employeeId: "ADM01",
    phone: "90347 59099",
    email: "john@scalingtheory.com",
    joiningDate: "01-Jan-2020",
    department: "Administration",
    reportingTo: "Board of Directors",
    totalContribution: "5,00,000",
    bannerImage: null,
    profilePicture: null
  };

  app.get("/api/admin/profile", (req, res) => {
    res.json(adminProfile);
  });

  app.patch("/api/admin/profile", (req, res) => {
    const updates = req.body;
    
    // Merge updates with existing profile to preserve other fields
    adminProfile = {
      ...adminProfile,
      ...updates
    };
    
    res.json(adminProfile);
  });

  // Admin file upload endpoints
  app.post("/api/admin/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/admin/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Admin team leaders endpoint - fetch all team leaders with their recruiter counts
  app.get("/api/admin/team-leaders", async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      
      // Filter team leaders
      const teamLeaders = allEmployees.filter(emp => emp.role === 'team_leader');
      
      // For each team leader, count their recruiters
      const teamLeadersWithCounts = teamLeaders.map(tl => {
        // Count recruiters reporting to this team leader
        const recruiterCount = allEmployees.filter(
          emp => emp.role === 'recruiter' && emp.reportingTo === tl.employeeId
        ).length;
        
        return {
          id: tl.id,
          employeeId: tl.employeeId,
          name: tl.name,
          email: tl.email || 'not filled',
          phone: tl.phone || 'not filled',
          age: tl.age || 'not filled',
          department: tl.department || 'not filled',
          joiningDate: tl.joiningDate || 'not filled',
          reportingTo: tl.reportingTo || 'not filled',
          members: recruiterCount,
          // Default metrics for new profiles
          tenure: '0',
          qtrsAchieved: 0,
          nextMilestone: '+0',
          totalClosures: 0,
          targetAchievement: 0,
          totalRevenue: '0',
          role: 'Team Leader',
          image: null,
          lastLogin: 'not filled',
          lastClosure: 'not filled'
        };
      });
      
      res.json(teamLeadersWithCounts);
    } catch (error) {
      console.error('Get team leaders error:', error);
      res.status(500).json({ message: "Failed to fetch team leaders", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Recruiter Dashboard API routes
  // In-memory storage for recruiter profile to persist changes
  let recruiterProfile = {
    id: "rec-001",
    name: "Kumaravel R",
    role: "Talent Advisor",
    employeeId: "STTA005",
    phone: "9998887770",
    email: "kumaravel@scaling.com",
    joiningDate: "5/11/2023",
    department: "Talent Advisory",
    reportingTo: "Prakash Raj Raja",
    totalContribution: "0",
    bannerImage: null,
    profilePicture: null
  };

  app.get("/api/recruiter/profile", (req, res) => {
    res.json(recruiterProfile);
  });

  app.patch("/api/recruiter/profile", (req, res) => {
    const updates = req.body;
    
    // Merge updates with existing profile to preserve other fields
    recruiterProfile = {
      ...recruiterProfile,
      ...updates
    };
    
    res.json(recruiterProfile);
  });

  // Recruiter file upload endpoints
  // Recruiter data endpoints - same as team leader
  app.get("/api/recruiter/target-metrics", (req, res) => {
    const targetMetrics = {
      id: "target-rec-001",
      currentQuarter: "ASO-2025",
      minimumTarget: "8,00,000",
      targetAchieved: "6,50,000",
      incentiveEarned: "35,000"
    };
    res.json(targetMetrics);
  });

  app.get("/api/recruiter/daily-metrics", (req, res) => {
    const dailyMetrics = {
      id: "daily-rec-001",
      date: "21-Aug-2025",
      totalRequirements: "15",
      completedRequirements: "8",
      avgResumesPerRequirement: "03",
      requirementsPerRecruiter: "02",
      dailyDeliveryDelivered: "2",
      dailyDeliveryDefaulted: "1"
    };
    res.json(dailyMetrics);
  });

  app.get("/api/recruiter/meetings", (req, res) => {
    const meetings = [
      { id: "meeting-rec-001", type: "TL's Meeting", count: "2" },
      { id: "meeting-rec-002", type: "CEO's Meeting", count: "1" }
    ];
    res.json(meetings);
  });

  app.get("/api/recruiter/ceo-comments", (req, res) => {
    const comments = [
      { id: "comment-rec-001", comment: "Focus on high-priority requirements this week", date: "21-Aug-2025" },
      { id: "comment-rec-002", comment: "Improve interview scheduling process", date: "21-Aug-2025" },
      { id: "comment-rec-003", comment: "Follow up on pending candidates", date: "20-Aug-2025" }
    ];
    res.json(comments);
  });

  app.post("/api/recruiter/upload/banner", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/recruiter/upload/profile", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Requirements API endpoints
  app.get("/api/admin/requirements", async (req, res) => {
    try {
      const requirements = await storage.getRequirements();
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/requirements", async (req, res) => {
    try {
      const validatedData = insertRequirementSchema.parse(req.body);
      const requirement = await storage.createRequirement(validatedData);
      res.status(201).json(requirement);
    } catch (error) {
      res.status(400).json({ message: "Invalid requirement data" });
    }
  });

  app.patch("/api/admin/requirements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRequirement = await storage.updateRequirement(id, req.body);
      if (!updatedRequirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json(updatedRequirement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/requirements/:id/archive", async (req, res) => {
    try {
      const { id } = req.params;
      const archivedRequirement = await storage.archiveRequirement(id);
      if (!archivedRequirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json(archivedRequirement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/archived-requirements", async (req, res) => {
    try {
      const archivedRequirements = await storage.getArchivedRequirements();
      res.json(archivedRequirements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Meetings API endpoints
  app.get("/api/admin/meetings", async (req, res) => {
    try {
      const { category } = req.query;
      const allMeetings = await db.select().from(meetings).orderBy(meetings.createdAt);
      
      if (category && (category === 'tl' || category === 'ceo_ta')) {
        const filteredMeetings = allMeetings.filter(m => m.meetingCategory === category);
        return res.json(filteredMeetings);
      }
      
      res.json(allMeetings);
    } catch (error) {
      console.error('Get meetings error:', error);
      res.status(500).json({ message: "Failed to get meetings" });
    }
  });

  app.post("/api/admin/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse(req.body);
      
      const [meeting] = await db.insert(meetings).values([{
        ...validatedData,
        createdAt: new Date().toISOString(),
      }]).returning();
      res.status(201).json(meeting);
    } catch (error: any) {
      console.error('Create meeting error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/admin/meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertMeetingSchema.partial().parse(req.body);
      
      const [updatedMeeting] = await db.update(meetings)
        .set(updateData)
        .where(eq(meetings.id, id))
        .returning();
      
      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json(updatedMeeting);
    } catch (error: any) {
      console.error('Update meeting error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/admin/meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [deletedMeeting] = await db.delete(meetings)
        .where(eq(meetings.id, id))
        .returning();
      
      if (!deletedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      console.error('Delete meeting error:', error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Daily Metrics API endpoint
  app.get("/api/admin/daily-metrics", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      
      // Get start and end of day in ISO format
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const startISO = startOfDay.toISOString();
      const endISO = endOfDay.toISOString();
      
      // Import schema tables
      const { requirements, employees, candidates } = await import("@shared/schema");
      
      // Get all requirements (createdAt is stored as text, so we filter in JavaScript)
      const allRequirements = await db.select().from(requirements);
      
      // Filter requirements created today
      const requirementsCreatedToday = allRequirements.filter(req => {
        const createdDate = new Date(req.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      });
      
      // 1. Total Requirements - count from Requirements table with TODAY's date
      const totalRequirements = requirementsCreatedToday.length;
      
      // 2. Avg. Resumes per Requirement - calculate based on criticality
      // HIGH=1, MEDIUM=3, LOW/EASY=5
      let totalExpectedResumes = 0;
      requirementsCreatedToday.forEach(req => {
        if (req.criticality === 'HIGH') {
          totalExpectedResumes += 1;
        } else if (req.criticality === 'MEDIUM') {
          totalExpectedResumes += 3;
        } else { // LOW or EASY
          totalExpectedResumes += 5;
        }
      });
      const avgResumesPerRequirement = totalRequirements > 0 
        ? (totalExpectedResumes / totalRequirements).toFixed(2)
        : "0.00";
      
      // 3. Requirements per Recruiter - get count of active recruiters
      const allEmployees = await db.select().from(employees);
      const activeRecruiters = allEmployees.filter(emp => 
        emp.role === 'recruiter' && emp.isActive === true
      );
      const recruiterCount = activeRecruiters.length;
      const requirementsPerRecruiter = recruiterCount > 0
        ? (totalRequirements / recruiterCount).toFixed(2)
        : "0.00";
      
      // 4. Completed Requirements - count requirements completed today (based on completedAt, not createdAt)
      const requirementsCompletedToday = allRequirements.filter(req => {
        if (!req.completedAt || req.status !== 'completed') return false;
        const completedDate = new Date(req.completedAt);
        return completedDate >= startOfDay && completedDate <= endOfDay;
      });
      const completedRequirements = requirementsCompletedToday.length;
      
      // 5. Total Resumes - count candidates (resumes) created today
      const allCandidates = await db.select().from(candidates);
      const candidatesCreatedToday = allCandidates.filter(candidate => {
        const createdDate = new Date(candidate.createdAt);
        return createdDate >= startOfDay && createdDate <= endOfDay;
      });
      const totalResumes = candidatesCreatedToday.length;
      
      // Return the calculated metrics
      res.json({
        totalRequirements,
        avgResumesPerRequirement,
        requirementsPerRecruiter,
        completedRequirements,
        totalResumes,
        // These would come from other sources - for now returning 0
        dailyDeliveryDelivered: 0,
        dailyDeliveryDefaulted: 0,
        overallPerformance: "G" // This would need separate calculation logic
      });
    } catch (error) {
      console.error('Daily metrics error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Employer forgot password endpoint
  app.post("/api/employer/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Simulate sending notification to admin
      console.log(`Password reset request for employer email: ${email}`);
      console.log(`Admin notification: New password reset request from ${email}`);
      
      // In a real implementation, you would:
      // 1. Check if email exists in the employer database
      // 2. Generate a reset token
      // 3. Send email to admin with the request details
      // 4. Store the reset request in database
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ 
        message: "Password reset request sent to admin",
        details: "You will receive an email notification once your request has been processed by the admin team."
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google OAuth endpoints (placeholder for future implementation)
  app.get("/api/auth/google", async (req, res) => {
    // Placeholder for Google OAuth initiation
    res.status(501).json({ message: "Google OAuth not yet implemented" });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    // Placeholder for Google OAuth callback
    res.status(501).json({ message: "Google OAuth callback not yet implemented" });
  });

  // Bulk Resume Upload Endpoints

  // Create a specialized bulk upload handler for multiple files
  const bulkUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadsDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
      files: 1000, // Allow up to 1000 files
    },
    fileFilter: (req, file, cb) => {
      // Only allow PDF and DOCX files for bulk upload
      const allowedExtensions = /\.(pdf|docx)$/i;
      const extname = allowedExtensions.test(file.originalname.toLowerCase());
      
      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const mimetype = allowedMimeTypes.includes(file.mimetype);
      
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Only PDF and DOCX files are allowed for bulk upload!'));
      }
    }
  });

  // Bulk resume upload endpoint
  app.post("/api/admin/bulk-resume-upload", bulkUpload.array('resumes', 1000), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Generate unique job ID
      const jobId = `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const adminId = req.body.adminId || "admin"; // In real app, get from session
      
      // Create bulk upload job
      const bulkJob = await storage.createBulkUploadJob({
        jobId,
        adminId,
        totalFiles: files.length.toString(),
        createdAt: new Date().toISOString()
      });

      // Create file records for tracking
      const filePromises = files.map(async (file) => {
        return await storage.createBulkUploadFile({
          jobId,
          fileName: file.filename,
          originalName: file.originalname,
          fileSize: file.size.toString(),
          fileType: file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx',
          resumeUrl: `/uploads/${file.filename}`
        });
      });

      await Promise.all(filePromises);

      // Start background processing (simplified - in production use proper queue)
      processBulkUpload(jobId).catch(console.error);

      res.json({
        success: true,
        jobId,
        message: `${files.length} files uploaded successfully. Processing started.`,
        totalFiles: files.length
      });

    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Get bulk upload job status
  app.get("/api/admin/bulk-upload-jobs/:jobId/status", async (req, res) => {
    try {
      const { jobId } = req.params;
      
      const job = await storage.getBulkUploadJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const files = await storage.getBulkUploadFilesByJobId(jobId);
      
      res.json({
        job,
        files: files.map(f => ({
          id: f.id,
          originalName: f.originalName,
          status: f.status,
          errorMessage: f.errorMessage,
          extractedName: f.extractedName,
          extractedEmail: f.extractedEmail,
          extractedPhone: f.extractedPhone
        }))
      });

    } catch (error) {
      console.error('Get job status error:', error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  // Get notifications for user
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getNotificationsByUserId(userId);
      
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get error report for failed bulk upload
  app.get("/api/admin/bulk-upload-jobs/:jobId/error-report", async (req, res) => {
    try {
      const { jobId } = req.params;
      
      const files = await storage.getBulkUploadFilesByJobId(jobId);
      const failedFiles = files.filter(f => f.status === 'failed');
      
      if (failedFiles.length === 0) {
        return res.status(404).json({ message: "No failed files found" });
      }

      // Generate CSV content
      const csvHeader = "File Name,Error Message,File Size,File Type\n";
      const csvContent = failedFiles.map(f => 
        `"${f.originalName}","${f.errorMessage}","${f.fileSize}","${f.fileType}"`
      ).join('\n');
      
      const csvData = csvHeader + csvContent;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bulk-upload-errors-${jobId}.csv"`);
      res.send(csvData);
      
    } catch (error) {
      console.error('Error report generation error:', error);
      res.status(500).json({ message: "Failed to generate error report" });
    }
  });

  // Bootstrap admin - UNAUTHENTICATED endpoint for first-time setup
  app.post("/api/bootstrap/admin", async (req, res) => {
    try {
      // Check if any admin already exists
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');
      
      if (existingAdmins.length > 0) {
        return res.status(403).json({ 
          message: "Admin account already exists. Please use the login page.",
          adminExists: true 
        });
      }

      // Validate using Zod schema
      const bootstrapAdminSchema = insertEmployeeSchema.omit({ 
        createdAt: true, 
        employeeId: true 
      }).extend({
        role: z.literal('admin'),
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
      });

      const validatedData = bootstrapAdminSchema.parse(req.body);

      // Generate admin employee ID
      const employeeId = await storage.generateNextEmployeeId('admin');
      
      const employeeData = {
        ...validatedData,
        employeeId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      // Password will be hashed by storage layer
      const admin = await storage.createEmployee(employeeData);
      
      res.status(201).json({ 
        message: "Admin account created successfully",
        employee: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error: any) {
      console.error('Bootstrap admin error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid admin data", 
          errors: error.errors 
        });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ 
          message: "An account with this email already exists" 
        });
      }
      res.status(500).json({ message: "Failed to create admin account" });
    }
  });

  // Check if admin exists - UNAUTHENTICATED endpoint
  app.get("/api/bootstrap/check", async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');
      
      // For testing purposes, return admin email if exists
      const adminInfo = existingAdmins.length > 0 ? {
        email: existingAdmins[0].email,
        name: existingAdmins[0].name,
        note: "Password is encrypted and cannot be displayed for security"
      } : null;
      
      res.json({ 
        adminExists: existingAdmins.length > 0,
        setupRequired: existingAdmins.length === 0,
        adminInfo
      });
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Delete admin - UNAUTHENTICATED endpoint (protected by security key)
  app.delete("/api/bootstrap/admin", async (req, res) => {
    try {
      const { securityKey } = req.body;
      
      // Verify security key
      const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY;
      
      if (!ADMIN_RESET_KEY) {
        return res.status(500).json({ 
          message: "Admin reset feature is not configured. Please contact system administrator." 
        });
      }
      
      if (!securityKey || securityKey !== ADMIN_RESET_KEY) {
        return res.status(403).json({ 
          message: "Invalid security key. Access denied." 
        });
      }
      
      // Get all admin accounts
      const allEmployees = await storage.getAllEmployees();
      const existingAdmins = allEmployees.filter(emp => emp.role === 'admin');
      
      if (existingAdmins.length === 0) {
        return res.status(404).json({ 
          message: "No admin account found to delete." 
        });
      }
      
      // Delete all admin accounts
      let deletedCount = 0;
      for (const admin of existingAdmins) {
        const deleted = await storage.deleteEmployee(admin.id);
        if (deleted) {
          deletedCount++;
        }
      }
      
      res.json({ 
        message: `Successfully deleted ${deletedCount} admin account(s). You can now create a new admin.`,
        deletedCount
      });
    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({ message: "Failed to delete admin account" });
    }
  });

  // Bootstrap support - UNAUTHENTICATED endpoint for first-time setup
  app.post("/api/bootstrap/support", async (req, res) => {
    try {
      // Check if any support already exists
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');
      
      if (existingSupport.length > 0) {
        return res.status(403).json({ 
          message: "Support account already exists. Please use the login page.",
          supportExists: true 
        });
      }

      // Validate using Zod schema
      const bootstrapSupportSchema = insertEmployeeSchema.omit({ 
        createdAt: true, 
        employeeId: true 
      }).extend({
        role: z.literal('support'),
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
      });

      const validatedData = bootstrapSupportSchema.parse(req.body);

      // Generate support employee ID
      const employeeId = await storage.generateNextEmployeeId('support');
      
      const employeeData = {
        ...validatedData,
        employeeId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      // Password will be hashed by storage layer
      const support = await storage.createEmployee(employeeData);
      
      res.status(201).json({ 
        message: "Support account created successfully",
        employee: {
          id: support.id,
          name: support.name,
          email: support.email,
          role: support.role
        }
      });
    } catch (error: any) {
      console.error('Bootstrap support error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid support data", 
          errors: error.errors 
        });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ 
          message: "An account with this email already exists" 
        });
      }
      res.status(500).json({ message: "Failed to create support account" });
    }
  });

  // Check if support exists - UNAUTHENTICATED endpoint
  app.get("/api/bootstrap/support/check", async (req, res) => {
    try {
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');
      
      // For testing purposes, return support email if exists
      const supportInfo = existingSupport.length > 0 ? {
        email: existingSupport[0].email,
        name: existingSupport[0].name,
        note: "Password is encrypted and cannot be displayed for security"
      } : null;
      
      res.json({ 
        supportExists: existingSupport.length > 0,
        setupRequired: existingSupport.length === 0,
        supportInfo
      });
    } catch (error) {
      console.error('Support check error:', error);
      res.status(500).json({ message: "Failed to check support status" });
    }
  });

  // Delete support - UNAUTHENTICATED endpoint (protected by security key)
  app.delete("/api/bootstrap/support", async (req, res) => {
    try {
      const { securityKey } = req.body;
      
      // Verify security key - use same key as admin for simplicity
      const SUPPORT_RESET_KEY = process.env.ADMIN_RESET_KEY;
      
      if (!SUPPORT_RESET_KEY) {
        return res.status(500).json({ 
          message: "Support reset feature is not configured. Please contact system administrator." 
        });
      }
      
      if (!securityKey || securityKey !== SUPPORT_RESET_KEY) {
        return res.status(403).json({ 
          message: "Invalid security key. Access denied." 
        });
      }
      
      // Get all support accounts
      const allEmployees = await storage.getAllEmployees();
      const existingSupport = allEmployees.filter(emp => emp.role === 'support');
      
      if (existingSupport.length === 0) {
        return res.status(404).json({ 
          message: "No support account found to delete." 
        });
      }
      
      // Delete all support accounts
      let deletedCount = 0;
      for (const support of existingSupport) {
        const deleted = await storage.deleteEmployee(support.id);
        if (deleted) {
          deletedCount++;
        }
      }
      
      res.json({ 
        message: `Successfully deleted ${deletedCount} support account(s). You can now create a new support account.`,
        deletedCount
      });
    } catch (error) {
      console.error('Delete support error:', error);
      res.status(500).json({ message: "Failed to delete support account" });
    }
  });

  // Create employee
  app.post("/api/admin/employees", async (req, res) => {
    try {
      // Always generate employee ID on backend (SCE001, SCE002, etc.)
      const employeeId = await storage.generateNextEmployeeId(req.body.role || 'employee');
      
      const employeeData = insertEmployeeSchema.parse({
        ...req.body,
        employeeId, // Override any client-provided ID
        createdAt: new Date().toISOString(),
      });
      
      // Password will be hashed by storage layer
      const employee = await storage.createEmployee(employeeData);
      
      res.status(201).json({ message: "Employee created successfully", employee });
    } catch (error: any) {
      console.error('Create employee error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Employee with this email or ID already exists" });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Create client
  app.post("/api/admin/clients", async (req, res) => {
    try {
      const clientSchema = z.object({
        clientCode: z.string().optional(),
        brandName: z.string().min(1),
        incorporatedName: z.string().optional(),
        gstin: z.string().optional(),
        address: z.string().optional(),
        location: z.string().optional(),
        spoc: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        agreement: z.string().optional(),
        percentage: z.string().optional(),
        category: z.string().optional(),
        paymentTerms: z.string().optional(),
        source: z.string().optional(),
        startDate: z.string().optional(),
        currentStatus: z.string().optional(),
        createdAt: z.string(),
      });

      let clientCode = req.body.clientCode;
      if (!clientCode) {
        clientCode = await storage.generateNextClientCode();
      }

      const validatedData = clientSchema.parse({
        ...req.body,
        clientCode,
        createdAt: new Date().toISOString(),
      });

      // Create client record (without password)
      const { password, ...clientDataWithoutPassword } = validatedData;
      // Ensure clientCode is included in the data
      const clientDataToInsert = {
        ...clientDataWithoutPassword,
        clientCode
      };
      const client = await storage.createClient(clientDataToInsert);
      
      // Create employee profile for client login
      // Note: storage.createEmployee will hash the password, so pass raw password
      const employeeData = {
        employeeId: clientCode,
        name: validatedData.brandName,
        email: validatedData.email,
        password: validatedData.password,
        role: "client",
        phone: validatedData.spoc || "",
        department: "Client",
        joiningDate: validatedData.startDate || new Date().toISOString().split('T')[0],
        reportingTo: "Admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      await storage.createEmployee(employeeData);
      
      res.status(201).json({ message: "Client profile created successfully", client });
    } catch (error: any) {
      console.error('Create client error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Client with this email or code already exists" });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Create client credentials (simplified - for User Management)
  app.post("/api/admin/clients/credentials", async (req, res) => {
    try {
      const credentialsSchema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        name: z.string().min(1),
        phoneNumber: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        joiningDate: z.string(),
        linkedinProfile: z.string().optional(),
      });

      const validatedData = credentialsSchema.parse(req.body);
      
      // Generate client code
      const clientCode = await storage.generateNextClientCode();

      // Create minimal client record with just the essential information
      const minimalClientData = {
        clientCode,
        brandName: validatedData.name,
        email: validatedData.email,
        currentStatus: 'active',
        createdAt: new Date().toISOString(),
      };
      
      const client = await storage.createClient(minimalClientData);
      
      // Create employee profile for client login
      // SECURITY: Always set role to "client" on server-side to prevent privilege escalation
      const employeeData = {
        employeeId: clientCode,
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role: "client",
        phone: validatedData.phoneNumber,
        department: "Client",
        joiningDate: validatedData.joiningDate,
        reportingTo: "Admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      await storage.createEmployee(employeeData);
      
      res.status(201).json({ 
        message: "Client credentials created successfully", 
        client,
        employeeId: clientCode
      });
    } catch (error: any) {
      console.error('Create client credentials error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid credentials data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Client with this email already exists" });
      }
      res.status(500).json({ message: "Failed to create client credentials" });
    }
  });

  // Create target mapping
  app.post("/api/admin/target-mappings", async (req, res) => {
    try {
      // Validate only the required fields from client
      const { teamLeadId, teamMemberId, quarter, year, minimumTarget } = req.body;
      
      if (!teamLeadId || !teamMemberId || !quarter || !year || minimumTarget === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate team lead and member are different
      if (teamLeadId === teamMemberId) {
        return res.status(400).json({ message: "Team lead and team member cannot be the same person" });
      }
      
      // Validate numeric fields parse correctly
      const yearNum = parseInt(year);
      const minimumTargetNum = parseInt(minimumTarget);
      
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ message: "Invalid year value" });
      }
      
      if (isNaN(minimumTargetNum) || minimumTargetNum < 0) {
        return res.status(400).json({ message: "Invalid minimum target value" });
      }
      
      // Fetch employee information to verify and get metadata
      const teamLead = await storage.getEmployeeById(teamLeadId);
      const teamMember = await storage.getEmployeeById(teamMemberId);
      
      if (!teamLead) {
        return res.status(400).json({ message: "Team lead not found" });
      }
      
      if (!teamMember) {
        return res.status(400).json({ message: "Team member not found" });
      }
      
      // Validate team lead role
      if (teamLead.role !== "team_leader") {
        return res.status(400).json({ message: "Selected employee is not a team leader" });
      }
      
      // Server-side derived data - createdAt is handled by database default
      const targetMappingData = insertTargetMappingsSchema.parse({
        teamLeadId,
        teamMemberId,
        quarter,
        year: yearNum,
        minimumTarget: minimumTargetNum,
      });
      
      const targetMapping = await storage.createTargetMapping(targetMappingData);
      
      res.status(201).json({ message: "Target mapping created successfully", targetMapping });
    } catch (error: any) {
      console.error('Create target mapping error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid target mapping data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create target mapping" });
    }
  });

  // Get all target mappings with joined employee data
  app.get("/api/admin/target-mappings", async (req, res) => {
    try {
      const targetMappings = await storage.getAllTargetMappings();
      
      // Enrich with employee data
      const enrichedMappings = await Promise.all(
        targetMappings.map(async (mapping) => {
          const teamLead = await storage.getEmployeeById(mapping.teamLeadId);
          const teamMember = await storage.getEmployeeById(mapping.teamMemberId);
          
          return {
            ...mapping,
            teamLeadName: teamLead?.name || "Unknown",
            teamMemberName: teamMember?.name || "Unknown",
            teamMemberRole: teamMember?.role || "Unknown",
          };
        })
      );
      
      res.json(enrichedMappings);
    } catch (error) {
      console.error('Get target mappings error:', error);
      res.status(500).json({ message: "Failed to get target mappings" });
    }
  });

  // Get all employees
  app.get("/api/admin/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ message: "Failed to get employees" });
    }
  });

  // Get all clients
  app.get("/api/admin/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ message: "Failed to get clients" });
    }
  });

  // Update employee
  app.put("/api/admin/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate update data with partial schema
      const updateSchema = insertEmployeeSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      // Hash password if it's being updated
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }
      
      const updatedEmployee = await storage.updateEmployee(id, validatedData);
      
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (error: any) {
      console.error('Update employee error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Employee with this email or ID already exists" });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Delete employee
  app.delete("/api/admin/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEmployee(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Update client
  app.put("/api/admin/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate update data with partial schema
      const updateSchema = z.object({
        clientCode: z.string().min(1).optional(),
        brandName: z.string().min(1).optional(),
        incorporatedName: z.string().optional(),
        gstin: z.string().optional(),
        address: z.string().optional(),
        location: z.string().optional(),
        spoc: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        agreement: z.string().optional(),
        percentage: z.string().optional(),
        category: z.string().optional(),
        paymentTerms: z.string().optional(),
        source: z.string().optional(),
        startDate: z.string().optional(),
        referral: z.string().optional(),
        currentStatus: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const updatedClient = await storage.updateClient(id, validatedData);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json({ message: "Client updated successfully", client: updatedClient });
    } catch (error: any) {
      console.error('Update client error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return res.status(409).json({ message: "Client with this code already exists" });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/admin/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteClient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Seed database endpoint - call once to populate initial data
  app.post("/api/admin/seed-database", async (req, res) => {
    try {
      // Check if employees already exist
      const existingEmployees = await storage.getAllEmployees();
      if (existingEmployees.length > 0) {
        return res.status(400).json({ message: "Database already seeded. Employees exist." });
      }

      // Sample employee data
      const sampleEmployees = [
        {
          employeeId: "STTL001",
          name: "Priya Sharma",
          email: "priya@gmail.com",
          password: "priya123",
          role: "team_leader",
          age: "32",
          phone: "9876543211",
          department: "Talent Acquisition",
          joiningDate: "2023-06-10",
          reportingTo: "ADMIN"
        },
        {
          employeeId: "STTA001",
          name: "Ram Kumar",
          email: "ram@gmail.com",
          password: "ram123",
          role: "recruiter",
          age: "28",
          phone: "9876543210",
          department: "Talent Acquisition",
          joiningDate: "2024-01-15",
          reportingTo: "STTL001"
        },
        {
          employeeId: "STCL001",
          name: "Arjun Patel",
          email: "arjun@gmail.com",
          password: "arjun123",
          role: "client",
          age: "35",
          phone: "9876543212",
          department: "Client Relations",
          joiningDate: "2023-03-20",
          reportingTo: "Admin"
        },
        {
          employeeId: "ADMIN",
          name: "Admin User",
          email: "admin@gmail.com",
          password: "admin123",
          role: "admin",
          age: "40",
          phone: "9876543213",
          department: "Administration",
          joiningDate: "2022-01-01",
          reportingTo: "CEO"
        }
      ];

      // Hash passwords and create employees
      const saltRounds = 10;
      const createdEmployees = [];
      for (const emp of sampleEmployees) {
        const hashedPassword = await bcrypt.hash(emp.password, saltRounds);
        const employee = await storage.createEmployee({
          employeeId: emp.employeeId,
          name: emp.name,
          email: emp.email,
          password: hashedPassword,
          role: emp.role,
          age: emp.age,
          phone: emp.phone,
          department: emp.department,
          joiningDate: emp.joiningDate,
          reportingTo: emp.reportingTo
        });
        createdEmployees.push(employee);
      }

      res.json({
        success: true,
        message: `Database seeded successfully. Created ${createdEmployees.length} employees.`,
        employees: createdEmployees.map(e => ({ email: e.email, role: e.role }))
      });
    } catch (error) {
      console.error('Seed database error:', error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Impact Metrics routes
  // Create impact metrics
  app.post("/api/admin/impact-metrics", async (req, res) => {
    try {
      const validatedData = insertImpactMetricsSchema.parse(req.body);
      const metrics = await storage.createImpactMetrics(validatedData);
      res.json({ message: "Impact metrics created successfully", metrics });
    } catch (error: any) {
      console.error('Create impact metrics error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid impact metrics data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create impact metrics" });
    }
  });

  // Get all impact metrics
  app.get("/api/admin/impact-metrics", async (req, res) => {
    try {
      const { clientId } = req.query;
      
      if (clientId && typeof clientId === 'string') {
        const metrics = await storage.getImpactMetrics(clientId);
        if (!metrics) {
          return res.status(404).json({ message: "Impact metrics not found" });
        }
        return res.json(metrics);
      }
      
      const allMetrics = await storage.getAllImpactMetrics();
      res.json(allMetrics);
    } catch (error) {
      console.error('Get impact metrics error:', error);
      res.status(500).json({ message: "Failed to get impact metrics" });
    }
  });

  // Update impact metrics
  app.put("/api/admin/impact-metrics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const updateSchema = z.object({
        clientId: z.string().optional(),
        speedToHire: z.number().optional(),
        revenueImpactOfDelay: z.number().optional(),
        clientNps: z.number().optional(),
        candidateNps: z.number().optional(),
        feedbackTurnAround: z.number().optional(),
        feedbackTurnAroundAvgDays: z.number().optional(),
        firstYearRetentionRate: z.number().optional(),
        fulfillmentRate: z.number().optional(),
        revenueRecovered: z.number().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedMetrics = await storage.updateImpactMetrics(id, validatedData);
      
      if (!updatedMetrics) {
        return res.status(404).json({ message: "Impact metrics not found" });
      }
      
      res.json({ message: "Impact metrics updated successfully", metrics: updatedMetrics });
    } catch (error: any) {
      console.error('Update impact metrics error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid impact metrics data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update impact metrics" });
    }
  });

  // Delete impact metrics
  app.delete("/api/admin/impact-metrics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteImpactMetrics(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Impact metrics not found" });
      }
      
      res.json({ message: "Impact metrics deleted successfully" });
    } catch (error) {
      console.error('Delete impact metrics error:', error);
      res.status(500).json({ message: "Failed to delete impact metrics" });
    }
  });

  // Client Metrics Endpoints
  // Speed metrics current values
  app.get("/api/client/speed-metrics", (req, res) => {
    res.json({
      timeToFirstSubmission: 0,
      timeToInterview: 0,
      timeToOffer: 0,
      timeToFill: 0
    });
  });

  // Quality metrics current values
  app.get("/api/client/quality-metrics", (req, res) => {
    res.json({
      submissionToShortList: 0,
      interviewToOffer: 0,
      offerAcceptance: 0,
      earlyAttrition: 0
    });
  });

  // Speed metrics chart data
  app.get("/api/client/speed-metrics-chart", (req, res) => {
    res.json([
      { month: 'Jan', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Feb', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Mar', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Apr', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'May', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 },
      { month: 'Jun', timeToFirstSubmission: 0, timeToInterview: 0, timeToOffer: 0, timeToFill: 0 }
    ]);
  });

  // Quality metrics chart data
  app.get("/api/client/quality-metrics-chart", (req, res) => {
    res.json([
      { month: 'Jan', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Feb', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Mar', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Apr', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'May', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 },
      { month: 'Jun', submissionToShortList: 0, interviewToOffer: 0, offerAcceptance: 0, earlyAttrition: 0 }
    ]);
  });

  app.post("/api/support/send-message", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ 
          error: "Message is required" 
        });
      }

      if (!req.session.supportUserId) {
        req.session.supportUserId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      }

      const candidateEmail = req.session.candidateId 
        ? (await storage.getCandidateByCandidateId(req.session.candidateId))?.email 
        : null;
      
      const emailToUse = candidateEmail || `${req.session.supportUserId}@guest.staffos.com`;
      const nameToUse = candidateEmail ? 'Candidate' : 'Guest User';
      
      const now = new Date().toISOString();
      let convId = req.session.conversationId;

      if (!convId) {
        const existingConv = await db.select()
          .from(supportConversations)
          .where(eq(supportConversations.userEmail, emailToUse))
          .orderBy(desc(supportConversations.createdAt))
          .limit(1);

        if (existingConv.length > 0 && existingConv[0].status !== 'closed') {
          convId = existingConv[0].id;
          await db.update(supportConversations)
            .set({ lastMessageAt: now })
            .where(eq(supportConversations.id, convId));
        } else {
          const newConv = await db.insert(supportConversations).values({
            userId: req.session.candidateId || req.session.supportUserId || null,
            userEmail: emailToUse,
            userName: nameToUse,
            subject: message.substring(0, 100),
            status: 'open',
            lastMessageAt: now,
            createdAt: now,
          }).returning();
          convId = newConv[0].id;
        }
        
        req.session.conversationId = convId;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        await db.update(supportConversations)
          .set({ lastMessageAt: now })
          .where(eq(supportConversations.id, convId));
      }

      await db.insert(supportMessages).values({
        conversationId: convId,
        senderType: 'user',
        senderName: nameToUse,
        message: message,
        createdAt: now,
      });

      res.json({ 
        success: true, 
        conversationId: convId,
        message: "Your message has been sent to our support team. We'll get back to you shortly." 
      });
    } catch (error) {
      console.error('Error sending support message:', error);
      res.status(500).json({ 
        error: "Failed to send message. Please try again later." 
      });
    }
  });

  app.get("/api/support/conversations", requireSupportAuth, async (req, res) => {
    try {
      const conversations = await db.select()
        .from(supportConversations)
        .orderBy(desc(supportConversations.lastMessageAt));

      const conversationsWithCount = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await db.select()
            .from(supportMessages)
            .where(eq(supportMessages.conversationId, conv.id));
          
          const lastMessage = messages[messages.length - 1];
          
          return {
            ...conv,
            messageCount: messages.length,
            lastMessage: lastMessage?.message || '',
          };
        })
      );

      res.json(conversationsWithCount);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/support/conversations/:id/messages", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (conversation.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await db.select()
        .from(supportMessages)
        .where(eq(supportMessages.conversationId, id))
        .orderBy(supportMessages.createdAt);

      res.json({
        conversation: conversation[0],
        messages: messages,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/support/conversations/:id/reply", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { message, senderName } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.id, id))
        .limit(1);

      if (conversation.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const now = new Date().toISOString();

      await db.insert(supportMessages).values({
        conversationId: id,
        senderType: 'support',
        senderName: senderName || 'Support Team',
        message: message,
        createdAt: now,
      });

      await db.update(supportConversations)
        .set({ 
          lastMessageAt: now,
          status: 'in_progress' 
        })
        .where(eq(supportConversations.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending reply:', error);
      res.status(500).json({ error: "Failed to send reply" });
    }
  });

  app.patch("/api/support/conversations/:id/status", requireSupportAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await db.update(supportConversations)
        .set({ status })
        .where(eq(supportConversations.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get("/api/support/my-conversation", async (req, res) => {
    try {
      if (!req.session.supportUserId && !req.session.candidateId) {
        req.session.supportUserId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      const candidateEmail = req.session.candidateId 
        ? (await storage.getCandidateByCandidateId(req.session.candidateId))?.email 
        : null;
      
      const emailToUse = candidateEmail || `${req.session.supportUserId}@guest.staffos.com`;

      const conversation = await db.select()
        .from(supportConversations)
        .where(eq(supportConversations.userEmail, emailToUse))
        .orderBy(desc(supportConversations.createdAt))
        .limit(1);

      if (conversation.length === 0) {
        return res.json({ conversation: null, messages: [] });
      }

      const messages = await db.select()
        .from(supportMessages)
        .where(eq(supportMessages.conversationId, conversation[0].id))
        .orderBy(supportMessages.createdAt);

      res.json({
        conversation: conversation[0],
        messages: messages,
      });
    } catch (error) {
      console.error('Error fetching my conversation:', error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
