import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings, LayoutGrid, Briefcase, Bookmark, BarChart3, ChevronLeft, ChevronRight, Linkedin, Twitter, Facebook, UserPlus } from "lucide-react";
import logoImage from "@assets/image_1761276742670.png";
import { useState } from "react";

export default function Landing() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeFeedback, setActiveFeedback] = useState(0);

  const feedbacks = [
    {
      name: "Priya",
      role: "Business Analytics",
      text: "I appreciate the opportunity to work on this task. The requirements were clear, communication was smooth, and the overall process was well organized. It was a positive experience, and I enjoyed contributing my skills to the project."
    }
  ];

  const jobCards = [
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Cloud Engineer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      skills: ["Figma", "UX Design", "Color theory", "Canva", "Photoshop", "Illustrations"],
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Microsoft",
      logo: "MS",
      role: "Cloud Engineer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      skills: ["Figma", "UX Design", "Color theory", "Canva", "Photoshop", "Illustrations"],
      applied: 1200,
      posted: "Two days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="StaffOS Logo" 
                className="w-6 h-6"
                data-testid="img-logo"
              />
              <span className="text-lg font-semibold text-gray-900">
                staffOS
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#jobs" className="text-sm text-gray-700 hover:text-gray-900">
                Find jobs
              </a>
              <a href="#employers" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                For Employer
              </a>
              <Link href="/candidate-login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  Login
                </Button>
              </Link>
              <Link href="/candidate-registration">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  Register
                </Button>
              </Link>
              <Link href="/employer-login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Employer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Hero Text */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Apply once. Track every step of your job application in real time.
            </h1>
            <Link href="/candidate-registration">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-fit px-8 py-6 text-lg font-medium"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Right: Description */}
          <div className="flex flex-col justify-center">
            <p className="text-lg text-gray-600 leading-relaxed">
              Apply to jobs, track every stage, and receive transparent feedback from recruiters.
            </p>
          </div>
        </div>

        {/* Dashboard Preview Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-16">
          {/* Sidebar Navigation Icons */}
          <div className="flex gap-8 mb-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <LayoutGrid className="w-5 h-5 text-gray-600" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 cursor-pointer">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <Bookmark className="w-5 h-5 text-gray-600" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Applied Jobs Section */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Applied Jobs</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Applied On</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Applied Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">Mobile App Developer</td>
                        <td className="py-3 px-4 text-sm text-gray-600">TechCorp</td>
                        <td className="py-3 px-4 text-sm text-gray-600">Full-Time</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            In-process
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">02-03-2025</td>
                        <td className="py-3 px-4 text-sm text-gray-600">02-03-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">Backend Developer</td>
                        <td className="py-3 px-4 text-sm text-gray-600">Designify</td>
                        <td className="py-3 px-4 text-sm text-gray-600">Part-Time</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Rejected
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">12-06-2025</td>
                        <td className="py-3 px-4 text-sm text-gray-600">12-06-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">Frontend Developer</td>
                        <td className="py-3 px-4 text-sm text-gray-600">CodeLabs</td>
                        <td className="py-3 px-4 text-sm text-gray-600">Internships</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            In-process
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">18-12-2025</td>
                        <td className="py-3 px-4 text-sm text-gray-600">18-12-2025</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">QA Tester</td>
                        <td className="py-3 px-4 text-sm text-gray-600">AppLogic</td>
                        <td className="py-3 px-4 text-sm text-gray-600">Full-Time</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Rejected
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">22-10-2025</td>
                        <td className="py-3 px-4 text-sm text-gray-600">22-10-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Job Suggestions */}
                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Job Suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobCards.map((job, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {job.logo}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.role}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                          </div>
                        </div>
                        <Bookmark className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.experience}</span>
                        <span>•</span>
                        <span>{job.department}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-600">Applied: {job.applied.toLocaleString()}</span>
                        <span className="text-gray-500">Posted on: {job.posted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Metrics */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Metrics</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">TAT Recruiter reply time</div>
                    <div className="text-2xl font-bold text-gray-900">24</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">JOBS Applied</div>
                    <div className="text-2xl font-bold text-gray-900">24</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">REJECTED On Applications</div>
                    <div className="text-2xl font-bold text-orange-600">14</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">INTERVIEWS In Process</div>
                    <div className="text-2xl font-bold text-gray-900">10</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">FEEDBACK Received</div>
                    <div className="text-2xl font-bold text-gray-900">9</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actively Hiring Roles Section */}
        <section id="jobs" className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">Actively Hiring Roles</h2>
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="min-w-[350px] bg-white rounded-lg shadow-md p-6 flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        G
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cloud Engineer</h3>
                        <p className="text-sm text-gray-600">Google Private Limited</p>
                      </div>
                    </div>
                    <Bookmark className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span>Remote</span>
                    <span>•</span>
                    <span>4+ Experience</span>
                    <span>•</span>
                    <span>Product</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking....
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Figma", "UX Design", "Color theory", "Canva", "Photoshop", "Illustrations"].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">Applied: 1,200</span>
                    <span className="text-gray-500">Posted on: Two days ago</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex gap-2">
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot === 1 ? "bg-blue-600" : "bg-blue-200"
                  }`}
                />
              ))}
            </div>
            <a href="#jobs" className="text-blue-600 font-medium flex items-center gap-2 hover:text-blue-700">
              Find Jobs now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Key Benefits</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI-powered resume parsing - Large card */}
            <div className="lg:row-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex flex-col items-center justify-center h-48">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Scripts</p>
                <p className="text-xs text-gray-400 mt-2">Drag or drop here</p>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-32 h-40 border border-gray-200 rounded bg-white p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-powered resume parsing</h3>
              <p className="text-gray-600">
                Automatically extracts key candidate details from resumes, improving accuracy and speeding up candidate matching.
              </p>
            </div>

            {/* No Waiting, Just Chatting */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex -space-x-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Waiting, Just Chatting</h3>
              <p className="text-gray-600">
                Talk to recruiters in real-time and get quicker responses.
              </p>
            </div>

            {/* Skill Matching */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex gap-2 mb-3">
                  {["All", "Accepted", "In-Process", "Rejected"].map((tab, i) => (
                    <span key={i} className={`px-3 py-1 text-xs rounded ${i === 0 ? "bg-blue-600 text-white" : "text-gray-600"}`}>
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded"></div>
                  <span className="text-xs text-gray-900">Frontend Developer</span>
                  <span className="ml-auto px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Rejected</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Matching</h3>
              <p className="text-gray-600">
                AI compares your skills, experience, and resume with job requirements to find roles where you're the best fit.
              </p>
            </div>

            {/* Candidate Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Metrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">TAT Recruiter reply time</span>
                    <span className="text-lg font-bold text-gray-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">10% Faster the last month</span>
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Candidate Metrics</h3>
              <p className="text-gray-600">
                Track your applications, responses, interviews, and feedback—all in one place.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/candidate-login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Find Jobs now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Feedback</h2>
          <div className="max-w-3xl mx-auto relative">
            <button
              onClick={() => setActiveFeedback((prev) => (prev - 1 + feedbacks.length) % feedbacks.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mb-4 flex items-center justify-center text-white text-2xl font-semibold">
                  P
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {feedbacks[activeFeedback].text}
                </p>
                <div className="text-right w-full">
                  <p className="font-semibold text-gray-900">{feedbacks[activeFeedback].name}</p>
                  <p className="text-sm text-gray-600">{feedbacks[activeFeedback].role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveFeedback((prev) => (prev + 1) % feedbacks.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-100 py-16 mb-16 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready for your next big career move?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Don't wait — get your next opportunity today.
            </p>
            <Link href="/candidate-registration">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Start Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="text-6xl font-bold text-gray-200 mb-4">STAFFOS</div>
              <p className="text-sm text-gray-600 mb-2">© 2026 Staffos. All rights reserved</p>
              <p className="text-sm text-gray-600">
                Powered by <span className="underline">Scaling Theory</span>
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#about" className="hover:text-gray-900">About US</a></li>
                <li><a href="#blog" className="hover:text-gray-900">Blog</a></li>
                <li className="flex items-center gap-2">
                  <a href="#careers" className="hover:text-gray-900">Careers</a>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">Hiring</span>
                </li>
                <li><a href="#contact" className="hover:text-gray-900">Contact</a></li>
                <li><a href="#faq" className="hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900">Pricing</a></li>
                <li><Link href="/candidate-login" className="hover:text-gray-900">Login</Link></li>
                <li><a href="#contact" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>

            {/* Term Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Term</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#privacy" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#license" className="hover:text-gray-900">License</a></li>
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <a href="#linkedin" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#twitter" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#facebook" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
