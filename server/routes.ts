import express, { type Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import { storage } from "./storage";
import { insertProfileSchema, insertJobPreferencesSchema, insertSkillSchema, insertSavedJobSchema, insertRequirementSchema, insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
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
    // Allow image files, PDFs, and documents (including modern formats)
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|avif|pdf|doc|docx)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    
    // Check MIME types including modern image formats and Office documents
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/webp', 'image/avif', // Modern image formats
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
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
      if (!employee) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if employee is active
      if (!employee.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      // Return employee data (excluding password) for frontend routing
      const { password: _, ...employeeData } = employee;
      res.json({
        success: true,
        employee: employeeData,
        message: "Login successful"
      });
    } catch (error) {
      console.error('Employee login error:', error);
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
      res.json({
        success: true,
        message: "Logged out successfully"
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

  // Get current user profile (demo user)
  app.get("/api/profile", async (req, res) => {
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
  app.patch("/api/profile", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedProfile = await storage.updateProfile(users.id, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get job preferences
  app.get("/api/job-preferences", async (req, res) => {
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

  // Get skills
  app.get("/api/skills", async (req, res) => {
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

  // Get job applications
  app.get("/api/job-applications", async (req, res) => {
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
  app.post("/api/upload/banner", upload.single('banner'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // In production, consider using cloud storage like AWS S3, Cloudinary, etc.
      // For now, using local storage with proper URL generation
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/profile", upload.single('profile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Upload failed", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/upload/resume", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.BACKEND_URL || `https://${req.get('host')}`)
        : `http://${req.get('host')}`;
      
      const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
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

  // Get saved jobs
  app.get("/api/saved-jobs", async (req, res) => {
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
  app.post("/api/saved-jobs", async (req, res) => {
    try {
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const validatedData = insertSavedJobSchema.parse({
        ...req.body,
        profileId: profile.id,
        savedDate: new Date().toISOString()
      });
      
      const savedJob = await storage.createSavedJob(validatedData);
      res.json(savedJob);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Remove saved job
  app.delete("/api/saved-jobs", async (req, res) => {
    try {
      const { jobTitle, company } = req.body;
      
      const users = await storage.getUserByUsername("mathew.anderson");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(users.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const removed = await storage.removeSavedJob(profile.id, jobTitle, company);
      if (removed) {
        res.json({ message: "Job removed from saved jobs" });
      } else {
        res.status(404).json({ message: "Saved job not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Leader Dashboard API routes
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

  // Team Leader profile endpoints - using database
  app.get("/api/team-leader/profile", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(404).json({ message: "Team leader profile not found" });
      }
      
      // Format response
      const profile = {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        employeeId: employee.employeeId,
        phone: employee.phone || "",
        email: employee.email,
        joiningDate: employee.joiningDate || "",
        department: employee.department || "",
        reportingTo: employee.reportingTo || "",
        totalContribution: employee.totalContribution || "0",
        bannerImage: employee.bannerImage,
        profilePicture: employee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Team leader profile fetch error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Leader profile update endpoint
  app.patch("/api/team-leader/profile", async (req, res) => {
    try {
      const { email, ...updates } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'team_leader') {
        return res.status(404).json({ message: "Team leader profile not found" });
      }
      
      // Update employee profile
      const updatedEmployee = await storage.updateEmployee(employee.id, updates);
      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      // Format response
      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: updatedEmployee.role,
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || "",
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate || "",
        department: updatedEmployee.department || "",
        reportingTo: updatedEmployee.reportingTo || "",
        totalContribution: updatedEmployee.totalContribution || "0",
        bannerImage: updatedEmployee.bannerImage,
        profilePicture: updatedEmployee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Team leader profile update error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Dashboard API routes and file uploads - using database
  app.get("/api/admin/profile", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'admin') {
        return res.status(404).json({ message: "Admin profile not found" });
      }
      
      // Format response
      const profile = {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        employeeId: employee.employeeId,
        phone: employee.phone || "",
        email: employee.email,
        joiningDate: employee.joiningDate || "",
        department: employee.department || "",
        reportingTo: employee.reportingTo || "",
        totalContribution: employee.totalContribution || "0",
        bannerImage: employee.bannerImage,
        profilePicture: employee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Admin profile fetch error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/profile", async (req, res) => {
    try {
      const { email, ...updates } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'admin') {
        return res.status(404).json({ message: "Admin profile not found" });
      }
      
      // Update employee profile
      const updatedEmployee = await storage.updateEmployee(employee.id, updates);
      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      // Format response
      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: updatedEmployee.role,
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || "",
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate || "",
        department: updatedEmployee.department || "",
        reportingTo: updatedEmployee.reportingTo || "",
        totalContribution: updatedEmployee.totalContribution || "0",
        bannerImage: updatedEmployee.bannerImage,
        profilePicture: updatedEmployee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Admin profile update error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
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

  // Recruiter Dashboard API routes - using database
  app.get("/api/recruiter/profile", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'recruiter') {
        return res.status(404).json({ message: "Recruiter profile not found" });
      }
      
      // Format response
      const profile = {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        employeeId: employee.employeeId,
        phone: employee.phone || "",
        email: employee.email,
        joiningDate: employee.joiningDate || "",
        department: employee.department || "",
        reportingTo: employee.reportingTo || "",
        totalContribution: employee.totalContribution || "0",
        bannerImage: employee.bannerImage,
        profilePicture: employee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Recruiter profile fetch error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/recruiter/profile", async (req, res) => {
    try {
      const { email, ...updates } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || employee.role !== 'recruiter') {
        return res.status(404).json({ message: "Recruiter profile not found" });
      }
      
      // Update employee profile
      const updatedEmployee = await storage.updateEmployee(employee.id, updates);
      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      // Format response
      const profile = {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        role: updatedEmployee.role,
        employeeId: updatedEmployee.employeeId,
        phone: updatedEmployee.phone || "",
        email: updatedEmployee.email,
        joiningDate: updatedEmployee.joiningDate || "",
        department: updatedEmployee.department || "",
        reportingTo: updatedEmployee.reportingTo || "",
        totalContribution: updatedEmployee.totalContribution || "0",
        bannerImage: updatedEmployee.bannerImage,
        profilePicture: updatedEmployee.profilePicture
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Recruiter profile update error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
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

  const httpServer = createServer(app);
  return httpServer;
}
