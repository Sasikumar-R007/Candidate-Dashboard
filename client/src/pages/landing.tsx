import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, Building2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Job Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started by choosing your role
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Candidate Login Card */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Candidate Login</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard-selection" data-testid="link-candidate-login">
                <Button 
                  className="w-full py-6 text-lg font-semibold" 
                  size="lg" 
                  data-testid="button-candidate-login"
                >
                  Get Started as Candidate
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employer Login Card */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-orange-100 dark:bg-orange-900 rounded-full w-20 h-20 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Employer Login</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard-selection" data-testid="link-employer-login">
                <Button 
                  className="w-full py-6 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white" 
                  size="lg"
                  data-testid="button-employer-login"
                >
                  Get Started as Employer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}