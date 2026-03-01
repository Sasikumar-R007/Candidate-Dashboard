import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, Linkedin, Twitter, Facebook, Home, FileText, GraduationCap, TrendingUp, Users, BarChart, FolderKanban, Database, Rocket, Menu, X, ExternalLink } from "lucide-react";
import logoImage from "@assets/image_1761276742670.png";
import lp01Image from "@/assets/lp01.png";
import lp02Image from "@/assets/lp02.png";
import lp03Image from "@/assets/lp03.png";
import { useState } from "react";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchResults = [
    { role: "Product Designer", company: "Google", location: "Remote", experience: "3+ years" },
    { role: "Full-Stack Developer", company: "Microsoft", location: "Hybrid", experience: "5+ years" },
    { role: "UI/UX Designer", company: "Apple", location: "Remote", experience: "2+ years" },
    { role: "Frontend Engineer", company: "Meta", location: "On-site", experience: "4+ years" },
    { role: "Backend Developer", company: "Amazon", location: "Remote", experience: "3+ years" }
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

  const topRoles = [
    { name: "Product Designer", jobs: "1.1K Jobs" },
    { name: "Full-Stack Development", jobs: "4.7K Jobs" },
    { name: "Project Manager", jobs: "9.6K Jobs" }
  ];

  const activelyHiringJobs = [
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Cloud Engineer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Full-stack Development",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Product Designer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Project Manager",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Back-End Engineer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    },
    {
      company: "Google Private Limited",
      logo: "G",
      role: "Devops Engineer",
      location: "Remote",
      experience: "4+ Experience",
      department: "Product",
      description: "We're Looking for a Product Designer who can merge Creativity, Strategy, and user-centered thinking...",
      skills: {
        left: ["Figma", "Canva", "Photoshop"],
        middle: ["UI Design", "UX Design", "Web Design"],
        right: ["Color theory", "Illustrations", "Motion"]
      },
      applied: 1200,
      posted: "Two days ago"
    }
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(to bottom, #F5F3FF, #E8E4FF, #8776FF)' }}>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={logoImage}
                alt="StaffOS Logo"
                className="h-8 sm:h-10 w-auto"
                data-testid="img-logo"
                style={{ objectFit: 'contain' }}
              />
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                StaffOS
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/candidate-login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 bg-white">
                  Login
                </Button>
              </Link>
              <Link href="/candidate-registration">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Register
                </Button>
              </Link>
              <Link href="/employer-login">
                <button className="text-sm text-purple-600 font-medium hover:text-purple-700 backdrop-blur-sm bg-white/30 border border-white/50 px-4 py-2 rounded-lg transition-all">
                  For Employer
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Overlay - Full screen grey background */}
          <div
            className={`md:hidden fixed inset-0 bg-gray-500/80 z-40 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel - Slide from right */}
          <div
            className={`md:hidden fixed top-0 right-0 h-full w-80 bg-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            <div className="h-full flex flex-col">
              {/* Menu Header */}
              <div className="px-6 py-5 border-b-2 border-gray-300 bg-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-300 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-6 py-8 bg-gray-200">
                <div className="flex flex-col gap-6">
                  <Link href="/candidate-login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300 rounded-lg px-6 py-4 text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                      Login
                    </button>
                  </Link>

                  <Link href="/candidate-registration" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-6 py-4 text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg">
                      Register
                    </button>
                  </Link>

                  <Link href="/employer-login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-white text-purple-600 hover:bg-purple-50 border-2 border-purple-300 rounded-lg px-6 py-4 text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                      For Employer
                    </button>
                  </Link>

                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300 rounded-lg px-6 py-4 text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                      Contact
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-24 sm:pt-28">
        {/* Hero Section with Search */}
        <section className="mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Your next<br />
              <span className="bg-purple-600 text-white px-4 py-2 inline-block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">BIG opportunity</span><br />
              <span className="text-purple-600">starts here!</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-4">
              Find roles that match your skills and apply in minutes.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 max-w-5xl mx-auto relative">
            <input
              type="text"
              placeholder="Enter Skill/Designation/Company"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
            />
            <input
              type="text"
              placeholder="Experience"
              className="w-full md:w-32 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Enter Location"
              className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold">
              Search
            </Button>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {searchResults.filter(result =>
                  result.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  result.company.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((result, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.role}</h3>
                      <p className="text-sm text-gray-600">{result.company} • {result.location} • {result.experience}</p>
                    </div>
                    <Link href="/candidate-login">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Apply
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Browse Jobs by Category */}
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">Browse jobs by category</h2>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-6">Explore roles grouped by industry and find the perfect fit faster.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap justify-center gap-3 sm:gap-4">
              {[
                { icon: Home, label: "Remote" },
                { icon: FileText, label: "Internship" },
                { icon: GraduationCap, label: "Fresher" },
                { icon: TrendingUp, label: "Marking" },
                { icon: Users, label: "HR" },
                { icon: BarChart, label: "Analytics" },
                { icon: FolderKanban, label: "Project M..." },
                { icon: Database, label: "Data Sci..." },
                { icon: Rocket, label: "Startup" }
              ].map((category, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 w-full sm:w-auto"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900 flex-1 text-left">{category.label}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Explore Careers Section with Glass Morphism */}
        <section className="mb-12 sm:mb-16 relative">
          <div className="backdrop-blur-lg bg-white/20 rounded-2xl border border-white/30 shadow-xl p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Left: Image */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={lp01Image}
                  alt="Career exploration"
                  className="w-full max-w-md h-auto"
                />
              </div>

              {/* Right: Content */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Explore Careers in Top Roles
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700">
                    Choose a role and discover curated opportunities tailored just for you.
                  </p>
                </div>

                {/* Role Cards */}
                <div className="space-y-3">
                  {topRoles.map((role, index) => (
                    <div
                      key={index}
                      className="bg-transparent backdrop-blur-sm rounded-lg border border-black/20 p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.jobs}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-900" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Actively Hiring Roles Section */}
        <section id="jobs" className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-2">Actively Hiring Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex justify-center">
                <img
                  src={lp02Image}
                  alt="Actively Hiring Roles"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* Develop Your Potential Banner */}
          <div className="mt-8 sm:mt-12 backdrop-blur-lg bg-white/20 rounded-lg border border-white/30 shadow-xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="flex-1 w-full md:w-auto">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Develop Your Potential!</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Unlock your potential with constructive feedback from our recruiters.
              </p>
              <Link href="/candidate-login">
                <Button className="bg-white border border-black text-black hover:bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base w-full sm:w-auto">
                  Explore Now!
                </Button>
              </Link>
            </div>
            <div className="hidden md:block flex-shrink-0">
              <img
                src={lp03Image}
                alt="Develop Your Potential"
                className="w-auto h-24 sm:h-32"
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="backdrop-blur-lg bg-white/10 border border-white/30 py-12 sm:py-16 mb-12 sm:mb-16 rounded-lg px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready for your next big career move?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              Don't wait — get your next opportunity today.
            </p>
            <Link href="/candidate-registration">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
                Start Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-white max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4">STAFFOS...</div>
          <div className="flex gap-3 sm:gap-4 mb-6">
            <a href="https://linkedin.com/company/scaling-theory/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
            <a href="https://twitter.com/ScalingTheory" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
            <a href="https://www.facebook.com/scalingtheory" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
          </div>
        </div>
        <div className="pt-6">
          <p className="text-xs sm:text-sm text-white/80 mb-2">All trademarks are the property of their respective owners</p>
          <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2">
            All rights reserved © 2026 Scaling Theory Technologies Private Ltd.
            <a
              href="https://scalingtheory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-white transition-colors"
              aria-label="Visit Scaling Theory website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
