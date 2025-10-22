import 'express-session';

declare module 'express-session' {
  interface SessionData {
    candidateId?: string;
    employeeId?: string;
    employeeRole?: string;
    userType?: 'candidate' | 'employee';
  }
}
