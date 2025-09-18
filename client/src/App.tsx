import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import Landing from "@/pages/landing";
import EmployerLogin from "@/pages/employer-login";
import CandidateLogin from "@/pages/candidate-login";
import CandidateRegistration from "@/pages/candidate-registration";
import DashboardSelection from "@/pages/dashboard-selection";
import Dashboard from "@/pages/dashboard";
import TeamLeaderDashboard from "@/pages/team-leader-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import RecruiterDashboard from "@/pages/recruiter-dashboard";
import RecruiterDashboard2 from "@/pages/recruiter-dashboard-2";
import ClientDashboard from "@/pages/client-dashboard";
import SourceResume from "@/pages/source-resume";
import RecruiterActiveJobs from "@/pages/recruiter-active-jobs";
import RecruiterNewApplications from "@/pages/recruiter-new-applications";
import NotFound from "@/pages/not-found";
import Archives from "@/pages/archives";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/employer-login" component={EmployerLogin} />
      <Route path="/candidate-login" component={CandidateLogin} />
      <Route path="/candidate-registration" component={CandidateRegistration} />
      <Route path="/dashboard-selection" component={DashboardSelection} />
      <Route path="/candidate" component={Dashboard} />
      <Route path="/team-leader" component={TeamLeaderDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/recruiter" component={RecruiterDashboard} />
      <Route path="/recruiter-login-2" component={RecruiterDashboard2} />
      <Route path="/client" component={ClientDashboard} />
      <Route path="/source-resume" component={SourceResume} />
      <Route path="/recruiter-active-jobs" component={RecruiterActiveJobs} />
      <Route path="/recruiter-new-applications" component={RecruiterNewApplications} />
      <Route path="/archives" component={Archives} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
