import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertJobPreferencesSchema, insertSkillSchema, insertSavedJobSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post("/api/upload/profile", upload.single('profile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post("/api/upload/resume", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
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

  // Team Leader file upload endpoints
  app.post("/api/team-leader/upload/banner", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/team-leader/upload/profile", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
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
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/admin/upload/profile", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Recruiter Dashboard API routes
  // In-memory storage for recruiter profile to persist changes
  let recruiterProfile = {
    id: "rec-001",
    name: "Sarah Johnson",
    role: "Senior Recruiter",
    employeeId: "REC01",
    phone: "90347 59088",
    email: "sarah@scalingtheory.com",
    joiningDate: "15-Jan-2022",
    department: "Talent Acquisition",
    reportingTo: "John Mathew",
    totalContribution: "1,80,000",
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
  app.post("/api/recruiter/upload/banner", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/recruiter/upload/profile", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Recruiter candidates API
  app.get("/api/recruiter/candidates", (req, res) => {
    const candidates = [
      {
        id: "cand001",
        name: "John Doe",
        jobId: "job001",
        job: "Frontend Developer",
        company: "TechCorp",
        status: "Interview Scheduled",
        appliedDate: "2025-01-10",
        email: "john.doe@email.com"
      },
      {
        id: "cand002",
        name: "Jane Smith",
        jobId: "job002",
        job: "UI/UX Designer",
        company: "Designify",
        status: "Shortlisted",
        appliedDate: "2025-01-09",
        email: "jane.smith@email.com"
      },
      {
        id: "cand003",
        name: "Ravi Kumar",
        jobId: "job003",
        job: "Backend Developer",
        company: "CodeLabs",
        status: "In-Process",
        appliedDate: "2025-01-08",
        email: "ravi.kumar@email.com"
      }
    ];
    res.json(candidates);
  });

  // Recruiter interviews API
  app.get("/api/recruiter/interviews", (req, res) => {
    const interviews = [
      {
        id: "int001",
        candidateName: "John Doe",
        position: "Frontend Developer",
        client: "TechCorp",
        interviewDate: "2025-01-15",
        interviewTime: "10:00",
        interviewType: "Technical",
        interviewRound: "Round 2"
      },
      {
        id: "int002",
        candidateName: "Jane Smith",
        position: "UI/UX Designer",
        client: "Designify",
        interviewDate: "2025-01-15",
        interviewTime: "14:00",
        interviewType: "Portfolio Review",
        interviewRound: "Round 1"
      }
    ];
    res.json(interviews);
  });

  app.post("/api/recruiter/interviews", (req, res) => {
    const newInterview = {
      id: `int${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    // Here you would typically save to database
    console.log('New interview scheduled:', newInterview);
    res.json(newInterview);
  });

  // Recruiter metrics API
  app.get("/api/recruiter/metrics", (req, res) => {
    const metrics = {
      activeJobs: 12,
      totalJobsPosted: 25,
      newApplications: 18,
      totalApplications: 82,
      todaysInterviews: 2,
      scheduledInterviews: 5,
      placementsThisMonth: 8,
      placementTarget: 15
    };
    res.json(metrics);
  });

  const httpServer = createServer(app);
  return httpServer;
}
