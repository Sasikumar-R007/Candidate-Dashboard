import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertJobPreferencesSchema, insertSkillSchema } from "@shared/schema";
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

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
