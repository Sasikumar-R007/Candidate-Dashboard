import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, UsersIcon, Crown, UserSearchIcon } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Job Portal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose your dashboard to get started
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Candidate Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Candidate Dashboard</CardTitle>
              <CardDescription>
                Manage your profile, job applications, and career preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/candidate" data-testid="link-candidate-dashboard">
                <Button className="w-full" size="lg" data-testid="button-candidate-dashboard">
                  Enter Candidate Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Team Leader Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Team Leader Dashboard</CardTitle>
              <CardDescription>
                Monitor team performance, track targets, and manage recruitment metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/team-leader" data-testid="link-team-leader-dashboard">
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="outline"
                  data-testid="button-team-leader-dashboard"
                >
                  Enter Team Leader Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center">
                <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage teams, view analytics, track performance, and oversee operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin" data-testid="link-admin-dashboard">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                  size="lg"
                  data-testid="button-admin-dashboard"
                >
                  Enter Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recruiter Dashboard Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-orange-100 dark:bg-orange-900 rounded-full w-16 h-16 flex items-center justify-center">
                <UserSearchIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl">Recruiter Dashboard</CardTitle>
              <CardDescription>
                Manage candidates, schedule interviews, and track recruitment pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recruiter" data-testid="link-recruiter-dashboard">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                  size="lg"
                  data-testid="button-recruiter-dashboard"
                >
                  Enter Recruiter Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}