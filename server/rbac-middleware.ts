import { type Request, type Response, type NextFunction } from "express";
import { type Employee } from "@shared/schema";

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  admin: {
    canAccessAll: true,
    canManageEmployees: true,
    canManageCandidates: true,
    canManageRequirements: true,
    canViewAllMetrics: true,
    canManageBulkUploads: true,
    canAccessAllData: true
  },
  team_leader: {
    canAccessAll: false,
    canManageEmployees: false,
    canManageCandidates: true,
    canManageRequirements: true,
    canViewTeamMetrics: true,
    canViewOwnTeamData: true,
    canAccessCandidateData: true,
    canAccessJobData: true
  },
  recruiter: {
    canAccessAll: false,
    canManageEmployees: false,
    canAddCandidates: true,
    canUploadResumes: true,
    canManageOwnApplications: true,
    canManageAssignedCandidates: true,
    canViewOwnMetrics: true,
    canAccessOwnData: true
  },
  client: {
    canAccessAll: false,
    canManageEmployees: false,
    canViewOwnRequirements: true,
    canViewOwnApplications: true,
    canAccessOwnData: true
  }
};

// Extend Express Request to include employee
declare global {
  namespace Express {
    interface Request {
      employee?: Employee;
    }
  }
}

// Middleware to extract employee from request (assumes employee data is sent in headers or session)
export const extractEmployee = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll extract from headers since there's no session middleware
  // In production, this should use proper session management
  const employeeEmail = req.headers['x-employee-email'] as string;
  const employeeRole = req.headers['x-employee-role'] as string;
  
  if (employeeEmail && employeeRole) {
    req.employee = {
      email: employeeEmail,
      role: employeeRole,
    } as Employee;
  }
  
  next();
};

// Check if user has required role
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;
    
    if (!employee) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    if (!allowedRoles.includes(employee.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        code: "FORBIDDEN",
        requiredRoles: allowedRoles,
        userRole: employee.role
      });
    }
    
    next();
  };
};

// Check if user has specific permission
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;
    
    if (!employee) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    const rolePermissions = ROLE_PERMISSIONS[employee.role as keyof typeof ROLE_PERMISSIONS];
    
    if (!rolePermissions) {
      return res.status(403).json({ 
        message: "Invalid role",
        code: "INVALID_ROLE"
      });
    }
    
    // Check if role has the required permission
    if (!rolePermissions[permission as keyof typeof rolePermissions]) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        code: "FORBIDDEN",
        requiredPermission: permission,
        userRole: employee.role
      });
    }
    
    next();
  };
};

// Admin only middleware
export const adminOnly = requireRole('admin');

// Team leader or admin middleware
export const teamLeaderOrAdmin = requireRole('team_leader', 'admin');

// Recruiter, team leader, or admin middleware
export const recruiterOrAbove = requireRole('recruiter', 'team_leader', 'admin');

// All roles middleware (authenticated users)
export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.employee) {
    return res.status(401).json({ 
      message: "Authentication required",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

// Resource ownership check for recruiters
export const checkRecruiterOwnership = (resourceType: 'candidate' | 'application' | 'requirement') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;
    
    if (!employee) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }
    
    // Admin and Team Leaders can access all resources
    if (employee.role === 'admin' || employee.role === 'team_leader') {
      return next();
    }
    
    // Recruiters can only access their own resources
    if (employee.role === 'recruiter') {
      // The actual ownership check should be done in the route handler
      // by comparing the resource's assigned recruiter with req.employee
      // This middleware just sets up the context
      return next();
    }
    
    // Clients can only access their own resources
    if (employee.role === 'client') {
      if (resourceType !== 'requirement' && resourceType !== 'application') {
        return res.status(403).json({ 
          message: "Clients can only access their own requirements and applications",
          code: "FORBIDDEN"
        });
      }
      return next();
    }
    
    return res.status(403).json({ 
      message: "Insufficient permissions",
      code: "FORBIDDEN"
    });
  };
};

// Helper function to check if user can access resource
export const canAccessResource = (
  employee: Employee | undefined,
  resourceOwnerId: string,
  resourceType: 'candidate' | 'application' | 'requirement' | 'metric'
): boolean => {
  if (!employee) return false;
  
  // Admin can access everything
  if (employee.role === 'admin') return true;
  
  // Team leaders can access their team's resources
  if (employee.role === 'team_leader') {
    // In a real implementation, you would check if the resource belongs to the team leader's team
    return true;
  }
  
  // Recruiters can access their own resources
  if (employee.role === 'recruiter') {
    return employee.id === resourceOwnerId;
  }
  
  // Clients can access their own requirements and applications
  if (employee.role === 'client') {
    if (resourceType === 'requirement' || resourceType === 'application') {
      return employee.id === resourceOwnerId;
    }
    return false;
  }
  
  return false;
};
