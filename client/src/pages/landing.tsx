import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Upload, Target, MessageCircle, Search, Briefcase, Mail, Phone, MapPin } from "lucide-react";
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4 max-w-4xl mx-auto" style={{fontFamily: 'Poppins, sans-serif'}}>
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

        {/* Section 1: Your Job Hunt, Simplified (For Candidates) */}
        <section className="py-16 max-w-6xl mx-auto" id="job-hunt">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Job Hunt, Simplified.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From resumes to recruiter chats, StaffOS makes every step smarter, faster, and tailored for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upload Once, Shine Everywhere */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="card-upload-once">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Once, Shine Everywhere
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                One profile syncs into a polished, job-ready profile.
              </p>
            </div>

            {/* Your Career HQ */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="card-career-hq">
              <div className="bg-red-100 dark:bg-red-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your Career HQ
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                One dashboard to track jobs, feedback, and progress.
              </p>
            </div>

            {/* No Waiting, Just Chatting */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="card-no-waiting">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Waiting, Just Chatting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Talk to recruiters in real-time and get on-the-spot responses.
              </p>
            </div>

            {/* Smarter Job Hunt */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="card-smarter-hunt">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smarter Job Hunt
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See how your data-driving perform compared to the market.
              </p>
            </div>

            {/* Jobs That Choose You */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg" data-testid="card-jobs-choose-you">
              <div className="bg-orange-100 dark:bg-orange-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Jobs That Choose You
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get matched with roles that fit your skills and career goals.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Your Hiring, Made Transparent (For Employers) */}
        <section className="py-16 max-w-6xl mx-auto" id="hiring-transparent">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Hiring, Made Transparent.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              With StaffOS, you don't just outsource hiring—you gain real-time visibility & data-driven insights
            </p>
          </div>

          <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-200 dark:border-blue-700 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Full Visibility,<br />Zero Blind Spots
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              With StaffOS, you don't just outsource hiring—you gain real-time visibility & data-driven insights
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Role Assigned */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-role-assigned">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Roll Assigned</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">15</div>
              </div>

              {/* Total Positions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-total-positions">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Positions</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">06</div>
              </div>

              {/* Paused Role */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-paused-role">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Paused Role</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">02</div>
              </div>

              {/* Active Roles */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-active-roles">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Roles</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">05</div>
              </div>

              {/* Withdrawn Role */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-withdrawn-role">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Withdrawn Role</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">01</div>
              </div>

              {/* Successful Hires */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center" data-testid="card-successful-hires">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Successful Hires</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">03</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Informed Hiring Decisions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md" data-testid="card-informed-decisions">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Informed Hiring Decisions</h4>
                <div className="h-32 bg-gradient-to-t from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded flex items-end justify-around p-4">
                  <div className="w-8 h-16 bg-blue-500 dark:bg-blue-600 rounded"></div>
                  <div className="w-8 h-24 bg-blue-600 dark:bg-blue-500 rounded"></div>
                  <div className="w-8 h-20 bg-blue-500 dark:bg-blue-600 rounded"></div>
                </div>
              </div>

              {/* Fact-based Intelligence */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md" data-testid="card-fact-based-intelligence">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Fact-based Intelligence</h4>
                <div className="h-32 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-900 dark:to-yellow-700 rounded flex items-center justify-center">
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Why StaffOS */}
        <section className="py-16 max-w-6xl mx-auto" id="about">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Text Content */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">StaffOS</h2>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                StaffOS: The Hiring Operating System from ScalingTheory
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At StaffOS, we believe the future of hiring should be transparent, data-driven, and human-centric. Traditional recruitment often leaves candidates in the dark about their applications and forces employers to navigate fragmented tools with little insight. We set out to change that.
              </p>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Why StaffOS</h4>
                
                <details className="border-b border-gray-200 dark:border-gray-700 pb-4" data-testid="details-transparency">
                  <summary className="cursor-pointer text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    Transparency
                  </summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4">
                    Complete visibility into the hiring process for both candidates and employers.
                  </p>
                </details>

                <details className="border-b border-gray-200 dark:border-gray-700 pb-4" data-testid="details-efficiency">
                  <summary className="cursor-pointer text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    Efficiency
                  </summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4">
                    Streamlined workflows that save time and reduce hiring cycles.
                  </p>
                </details>

                <details className="border-b border-gray-200 dark:border-gray-700 pb-4" data-testid="details-metrics">
                  <summary className="cursor-pointer text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    Metrics
                  </summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4">
                    Data-driven insights to make informed hiring decisions.
                  </p>
                </details>

                <details className="border-b border-gray-200 dark:border-gray-700 pb-4" data-testid="details-insights">
                  <summary className="cursor-pointer text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    Insights
                  </summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4">
                    AI-powered analytics that help you understand market trends and candidate behavior.
                  </p>
                </details>
              </div>
            </div>

            {/* Right Column - Image/Visual */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Overview</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    One unified platform for transparent hiring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Contact Us */}
        <section className="py-16 max-w-6xl mx-auto" id="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We'd love to hear from you! Reach out with any questions, feedback, or support needs.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3" data-testid="contact-phone">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">99003 28009</span>
                </div>

                <div className="flex items-center space-x-3" data-testid="contact-email">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Vikna@scalingtheory.com</span>
                </div>

                <div className="flex items-start space-x-3" data-testid="contact-address">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Laksnmipuram 2nd cross Rd,<br />
                    Trichy, Tamil Nadu
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Connect With Us</h3>
              
              <form className="space-y-4" data-testid="form-contact">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="input-name"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="input-email"
                  />
                </div>

                <input 
                  type="text" 
                  placeholder="Subject" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-subject"
                />

                <textarea 
                  placeholder="Message" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="textarea-message"
                ></textarea>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  data-testid="button-send"
                >
                  Send
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
