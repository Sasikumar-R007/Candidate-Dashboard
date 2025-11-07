import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, UsersIcon, Crown, UserSearchIcon, Building2, BrainCircuit, ArrowLeft } from "lucide-react";

export default function DashboardSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white dark:text-black" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            StaffOS
          </span>
        </div>

        {/* Back Button */}
        <Link href="/" data-testid="link-back-home">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </Link>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to StaffOS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose your dashboard to get started
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Candidate Dashboard Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-300/30">
                  <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Candidate Dashboard</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Manage your profile, job applications, and career preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/candidate" data-testid="link-candidate-dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0" 
                    size="lg" 
                    data-testid="button-candidate-dashboard"
                  >
                    Enter Candidate Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Leader Dashboard Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-green-300/30">
                  <UsersIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Team Leader Dashboard</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Monitor team performance, track targets, and manage recruitment metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/team-leader" data-testid="link-team-leader-dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0" 
                    size="lg"
                    data-testid="button-team-leader-dashboard"
                  >
                    Enter Team Leader Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Dashboard Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-purple-300/30">
                  <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Admin Dashboard</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Manage teams, view analytics, track performance, and oversee operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin" data-testid="link-admin-dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0" 
                    size="lg"
                    data-testid="button-admin-dashboard"
                  >
                    Enter Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recruiter Dashboard Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-400/20 to-orange-600/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-orange-300/30">
                  <UserSearchIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Recruiter Dashboard</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Manage candidates, schedule interviews, and track recruitment pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/recruiter" data-testid="link-recruiter-dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0" 
                    size="lg"
                    data-testid="button-recruiter-dashboard"
                  >
                    Enter Recruiter Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recruiter Login 2 Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-2 border-orange-300/40 dark:border-orange-600/40 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-500/20 to-orange-700/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-orange-400/30">
                  <UserSearchIcon className="h-8 w-8 text-orange-700 dark:text-orange-300" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Recruiter Login 2</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Enhanced recruiter workspace with advanced features and improved workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/recruiter-login-2" data-testid="link-recruiter-login-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0" 
                    size="lg"
                    data-testid="button-recruiter-login-2"
                  >
                    Enter Recruiter Login 2
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Client Dashboard Card */}
            <Card className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-teal-400/20 to-teal-600/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-teal-300/30">
                  <Building2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Client Dashboard</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-300">
                  Manage job requirements, track roles, and view recruitment progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/client" data-testid="link-client-dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0" 
                    size="lg"
                    data-testid="button-client-dashboard"
                  >
                    Enter Client Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}