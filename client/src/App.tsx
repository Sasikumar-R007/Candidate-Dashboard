import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import Landing from "@/pages/landing";
import EmployerLogin from "@/pages/employer-login";
import CandidateLogin from "@/pages/candidate-login";
import CandidateRegistration from "@/pages/candidate-registration";
import DashboardSelection from "@/pages/dashboard-selection";
import Dashboard from "@/pages/dashboard";
import TeamLeaderDashboard from "@/pages/team-leader-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import RecruiterDashboard2 from "@/pages/recruiter-dashboard-2";
import ClientDashboard from "@/pages/client-dashboard";
import SourceResume from "@/pages/source-resume";
import RecruiterActiveJobs from "@/pages/recruiter-active-jobs";
import RecruiterNewApplications from "@/pages/recruiter-new-applications";
import NotFound from "@/pages/not-found";
import Archives from "@/pages/archives";
import MasterDatabase from "@/pages/master-database";
import ChatPage from "@/pages/chat-page";
import SetupAdmin from "@/pages/setup-admin";
import SetupSupport from "@/pages/setup-support";
import SupportDashboard from "@/pages/support-dashboard";
import SupportLogin from "@/pages/support-login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/setup-admin" component={SetupAdmin} />
      <Route path="/setup-support" component={SetupSupport} />
      <Route path="/employer-login" component={EmployerLogin} />
      <Route path="/support-login" component={SupportLogin} />
      <Route path="/candidate-login" component={CandidateLogin} />
      <Route path="/candidate-registration" component={CandidateRegistration} />
      
      <Route path="/dashboard-selection" component={DashboardSelection} />
      
      <Route path="/candidate" component={Dashboard} />
      
      <Route path="/team-leader" component={TeamLeaderDashboard} />
      
      <Route path="/admin" component={AdminDashboard} />
      
      <Route path="/recruiter-login-2" component={RecruiterDashboard2} />
      
      <Route path="/client" component={ClientDashboard} />
      
      <Route path="/chat">
        <ProtectedRoute userType="employee">
          <ChatPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/source-resume">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <SourceResume />
        </ProtectedRoute>
      </Route>
      
      <Route path="/recruiter-active-jobs">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <RecruiterActiveJobs />
        </ProtectedRoute>
      </Route>
      
      <Route path="/recruiter-new-applications">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <RecruiterNewApplications />
        </ProtectedRoute>
      </Route>
      
      <Route path="/archives">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <Archives />
        </ProtectedRoute>
      </Route>
      
      <Route path="/master-database">
        <ProtectedRoute userType="employee" allowedRoles={["admin"]}>
          <MasterDatabase />
        </ProtectedRoute>
      </Route>
      
      <Route path="/support-dashboard">
        <ProtectedRoute userType="employee" allowedRoles={["support"]} redirectTo="/support-login">
          <SupportDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
