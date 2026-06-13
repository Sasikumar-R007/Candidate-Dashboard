import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { OperationalDataSync } from "@/components/operational-data-sync";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import AccountHoldOverlay from "@/components/account-hold-overlay";
import SigningOutOverlay from "@/components/signing-out-overlay";
import { BulkResumeImportProvider } from "@/contexts/bulk-resume-import-context";
import AuthenticatedNavigationGuard from "@/components/authenticated-navigation-guard";
import { ProtectedRoute } from "@/components/protected-route";
import ErrorBoundary from "@/components/error-boundary";
import Landing from "@/pages/landing";
import EmployerLogin from "@/pages/employer-login";
import EmployerLanding from "@/pages/employer-landing";
import CandidateLogin from "@/pages/candidate-login";
import CandidateRegistration from "@/pages/candidate-registration";
import CandidateResumeUpload from "@/pages/candidate-resume-upload";
import Dashboard from "@/pages/dashboard";
import TeamLeaderDashboard from "@/pages/team-leader-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminConsentLogsPage from "@/pages/admin-consent-logs";
import RecruiterDashboard2 from "@/pages/recruiter-dashboard-2";
import ClientDashboard from "@/pages/client-dashboard";
import SourceResume from "@/pages/source-resume";
import RecruiterActiveJobs from "@/pages/recruiter-active-jobs";
import RecruiterNewApplications from "@/pages/recruiter-new-applications";
import RecruiterAllCandidates from "@/pages/recruiter-all-candidates";
import RecruiterApplicants from "@/pages/recruiter-applicants";
import NotFound from "@/pages/not-found";
import Archives from "@/pages/archives";
import MasterDatabase from "@/pages/master-database";
import ChatPage from "@/pages/chat-page";
import SetupAdmin from "@/pages/setup-admin";
import SetupSupport from "@/pages/setup-support";
import SupportDashboard from "@/pages/support-dashboard";
import SupportLogin from "@/pages/support-login";
import CandidateProfile from "@/pages/candidate-profile";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import PlatformTermsPage from "@/pages/platform-terms";
import ClientAgreementPage from "@/pages/client-agreement";
import EmployeeAgreementPage from "@/pages/employee-agreement";
import ClientInvitePage from "@/pages/client-invite";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/employer" component={EmployerLanding} />
      <Route path="/setup-admin" component={SetupAdmin} />
      <Route path="/setup-support" component={SetupSupport} />
      <Route path="/employer-login" component={EmployerLogin} />
      <Route path="/support-login" component={SupportLogin} />
      <Route path="/candidate-login" component={CandidateLogin} />
      <Route path="/candidate-registration" component={CandidateRegistration} />
      <Route path="/candidate/upload-resume" component={CandidateResumeUpload} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/platform-terms" component={PlatformTermsPage} />
      <Route path="/terms-of-use" component={PlatformTermsPage} />
      <Route path="/client-access-agreement" component={ClientAgreementPage} />
      <Route path="/client-invite" component={ClientInvitePage} />
      <Route path="/employee-agreement" component={EmployeeAgreementPage} />
      
      <Route path="/candidate">
        <ProtectedRoute userType="candidate">
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/team-leader">
        <ProtectedRoute userType="employee" allowedRoles={["teamLead", "team_leader", "admin"]}>
          <TeamLeaderDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/consent-logs">
        <ProtectedRoute userType="employee" allowedRoles={["admin"]}>
          <AdminConsentLogsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute userType="employee" allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/recruiter">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <RecruiterDashboard2 />
        </ProtectedRoute>
      </Route>
      
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
      
      <Route path="/recruiter-all-candidates">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <RecruiterAllCandidates />
        </ProtectedRoute>
      </Route>
      
      <Route path="/recruiter-applicants">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <RecruiterApplicants />
        </ProtectedRoute>
      </Route>
      
      <Route path="/archives">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin", "client", "client_admin", "client_member"]}>
          <Archives />
        </ProtectedRoute>
      </Route>
      
      <Route path="/master-database">
        <ProtectedRoute userType="employee" allowedRoles={["admin"]}>
          <MasterDatabase />
        </ProtectedRoute>
      </Route>
      
      <Route path="/candidate-profile/:id">
        <ProtectedRoute userType="employee" allowedRoles={["recruiter", "talent_advisor", "teamLead", "team_leader", "admin"]}>
          <CandidateProfile />
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OperationalDataSync />
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <BulkResumeImportProvider>
                <AccountHoldOverlay />
                <SigningOutOverlay />
                <AuthenticatedNavigationGuard />
                <Toaster />
                <Router />
              </BulkResumeImportProvider>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
