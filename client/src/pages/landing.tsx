import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import candidateImage from "@assets/image_1761276490828.png";
import employerImage from "@assets/image_1761276502238.png";
import logoImage from "@assets/image_1761276742670.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src={logoImage} 
            alt="StaffOS Logo" 
            className="w-6 h-6"
            data-testid="img-logo"
          />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            staffOS
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" data-testid="link-home">
            Home
          </a>
          <a href="#candidates" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" data-testid="link-for-candidates">
            For Candidates
          </a>
          <a href="#employers" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" data-testid="link-for-employers">
            For Employers
          </a>
          <a href="#about" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" data-testid="link-about">
            About Us
          </a>
          <a href="#contact" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" data-testid="link-contact">
            Contact
          </a>
          <Link href="/candidate-login" data-testid="link-login">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded"
              data-testid="button-login"
            >
              Login
            </Button>
          </Link>
          <Link href="/employer-login" data-testid="link-employer">
            <Button 
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 rounded"
              data-testid="button-employer"
            >
              Employer
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex md:hidden items-center space-x-2">
          <Link href="/candidate-login" data-testid="link-candidate-login-mobile">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-700 dark:text-gray-300 rounded"
              data-testid="button-candidate-login-mobile"
            >
              Login
            </Button>
          </Link>
          <Link href="/employer-login" data-testid="link-employer-login-mobile">
            <Button 
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white rounded"
              data-testid="button-employer-login-mobile"
            >
              Employer
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        {/* Watch Solutions Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-black/20 rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 backdrop-blur-sm border border-white/30 dark:border-gray-700">
            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
            Watch our hiring solutions
            <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {/* Hero Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight mb-4 max-w-4xl mx-auto">
            One Platform—Transparent Job Journeys for Candidates, Powerful Hiring Metrics for Employers
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Candidates See Progress, Employers See Performance—All on StaffOS
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/candidate-login" data-testid="link-find-jobs">
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 px-8 font-semibold rounded"
                data-testid="button-find-jobs"
              >
                Find jobs
              </Button>
            </Link>
            <Link href="/employer-login" data-testid="link-post-jobs">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold rounded"
                data-testid="button-post-jobs"
              >
                Post jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Video Preview Section */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          {/* Floating gradient elements behind video */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl opacity-40 blur-3xl"></div>
          
          <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700 overflow-hidden aspect-video shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="w-16 h-16 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all shadow-xl"
                data-testid="button-play-video"
              >
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12 relative">
          {/* Background gradient blurs */}
          <div className="absolute -top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-20 blur-3xl"></div>
          
          {/* For Candidate Section */}
          <div id="candidates" className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              For Candidate
            </h2>
            
            {/* Candidate Features with Image */}
            <div className="space-y-6">
              <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 dark:border-gray-700">
                <img 
                  src={candidateImage} 
                  alt="Candidate Dashboard Preview" 
                  className="w-full rounded-lg"
                  data-testid="img-candidate-preview"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  My Application
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>Discover personalized job Suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>Apply to unlimited job openings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>Track application status in real-time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>Get feedback directly from recruiters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span>Manage everything from one dashboard</span>
                  </li>
                </ul>
                
                <div className="pt-4">
                  <Link href="/candidate-login" data-testid="link-candidate-cta">
                    <button 
                      className="text-sm font-medium text-gray-900 dark:text-white flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      data-testid="button-candidate-cta"
                    >
                      I'm a Candidate
                      <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* For Employer Section */}
          <div id="employers" className="relative bg-blue-600/20 dark:bg-blue-800/20 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30 dark:border-blue-700/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-700/10 rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                For Employer
              </h2>
              
              {/* Employer Features with Image */}
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <img 
                    src={employerImage} 
                    alt="Employer Dashboard Preview" 
                    className="w-full rounded-lg"
                    data-testid="img-employer-preview"
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Applicants
                  </h3>
                  <ul className="space-y-3 text-gray-800 dark:text-gray-200">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>Upload job openings in minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>Track applicants with built-in dashboards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>Interview scheduling & recruiter collaboration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>Measure recruiter performance per job</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>Access market insights & hiring metrics</span>
                    </li>
                  </ul>
                  
                  <div className="pt-4">
                    <Link href="/employer-login" data-testid="link-employer-cta">
                      <button 
                        className="text-sm font-medium text-gray-900 dark:text-white flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        data-testid="button-employer-cta"
                      >
                        I'm an Employer
                        <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Early Access CTA */}
        <div className="text-center py-12 relative">
          {/* Floating gradient background elements */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
          
          <Link href="/dashboard-selection" data-testid="link-get-early-access">
            <Button 
              size="lg" 
              className="relative bg-gray-900 hover:bg-gray-800 text-white px-12 py-6 text-lg font-semibold rounded shadow-2xl"
              data-testid="button-get-early-access"
            >
              Get Early Access
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
