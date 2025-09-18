import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

export default function Landing() {
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


        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link href="/candidate-login" data-testid="link-candidate-login">
            <Button 
              variant="ghost" 
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              data-testid="button-candidate-login"
            >
              Candidate
            </Button>
          </Link>
          <Link href="/employer-login" data-testid="link-employer-login">
            <Button 
              className="bg-purple-800 hover:bg-purple-900 text-white px-6 font-medium"
              data-testid="button-employer-login"
            >
              Employer Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-black/20 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 backdrop-blur-sm border border-white/30 dark:border-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
                Watch our hiring solutions
                <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Manage your talent
              <br />
              efficiently with{" "}
              <span className="text-purple-700 dark:text-purple-400">StaffOS</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Keep your recruitment pipeline and all your staffing needs safely organized and manage talent quickly, easily & efficiently.
            </p>
            
            <Link href="/dashboard-selection" data-testid="link-get-started">
              <Button 
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-lg"
                data-testid="button-get-started"
              >
                Get Early Access
              </Button>
            </Link>
          </div>

          {/* Right Content - Illustration/Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700 p-6 shadow-2xl">
              {/* Mock Browser Header */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="flex-1 bg-white/20 dark:bg-gray-700/30 rounded-md py-1 px-3 ml-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    www.staffos.com/dashboard
                  </span>
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg p-4">
                  <div className="w-32 h-4 bg-white/30 dark:bg-gray-600/30 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-white/20 dark:bg-gray-700/30 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 dark:bg-gray-700/20 rounded-lg p-4">
                    <div className="w-20 h-3 bg-white/30 dark:bg-gray-600/30 rounded mb-2"></div>
                    <div className="w-16 h-6 bg-blue-400/40 rounded"></div>
                  </div>
                  <div className="bg-white/20 dark:bg-gray-700/20 rounded-lg p-4">
                    <div className="w-20 h-3 bg-white/30 dark:bg-gray-600/30 rounded mb-2"></div>
                    <div className="w-16 h-6 bg-green-400/40 rounded"></div>
                  </div>
                </div>
                <div className="bg-white/10 dark:bg-gray-700/10 rounded-lg p-4 space-y-2">
                  <div className="w-full h-3 bg-white/20 dark:bg-gray-600/20 rounded"></div>
                  <div className="w-4/5 h-3 bg-white/20 dark:bg-gray-600/20 rounded"></div>
                  <div className="w-3/5 h-3 bg-white/20 dark:bg-gray-600/20 rounded"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl opacity-60 blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl opacity-40 blur-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}