import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  ChevronRight,
  Database,
  ExternalLink,
  Facebook,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  Linkedin,
  Menu,
  Rocket,
  TrendingUp,
  Twitter,
  Users,
  X,
} from "lucide-react";
import navLogoImage from "@/assets/nav logo.png";
import lp01Image from "@/assets/lp01.png";
import lp02Image from "@/assets/lp02.png";
import lp03Image from "@/assets/lp03.png";

type SearchSuggestion = {
  role: string;
  company: string;
  location: string;
  experience: string;
  skills: string[];
  category: string;
};

const searchSuggestions: SearchSuggestion[] = [
  {
    role: "Frontend Engineer",
    company: "Google",
    location: "Remote",
    experience: "3+ years",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    category: "Engineering",
  },
  {
    role: "Backend Developer",
    company: "Microsoft",
    location: "Hybrid",
    experience: "5+ years",
    skills: ["Node.js", "PostgreSQL", "Express", "AWS"],
    category: "Engineering",
  },
  {
    role: "UI/UX Designer",
    company: "Adobe",
    location: "Remote",
    experience: "2+ years",
    skills: ["Figma", "Wireframing", "Design Systems", "Canva"],
    category: "Design",
  },
  {
    role: "Project Manager",
    company: "Infosys",
    location: "On-site",
    experience: "6+ years",
    skills: ["Agile", "Scrum", "Stakeholder Management", "Jira"],
    category: "Management",
  },
  {
    role: "Data Analyst",
    company: "Amazon",
    location: "Hybrid",
    experience: "3+ years",
    skills: ["SQL", "Power BI", "Excel", "Python"],
    category: "Analytics",
  },
  {
    role: "HR Executive",
    company: "TCS",
    location: "On-site",
    experience: "2+ years",
    skills: ["Recruitment", "Payroll", "Employee Engagement", "HRMS"],
    category: "Human Resources",
  },
  {
    role: "DevOps Engineer",
    company: "Zoho",
    location: "Remote",
    experience: "4+ years",
    skills: ["Docker", "Kubernetes", "CI/CD", "Azure"],
    category: "Engineering",
  },
  {
    role: "Product Designer",
    company: "Meta",
    location: "Remote",
    experience: "4+ years",
    skills: ["Figma", "UX Research", "Prototyping", "Visual Design"],
    category: "Design",
  },
];

const topRoles = [
  { name: "Product Designer", jobs: "1.1K Jobs" },
  { name: "Full-Stack Development", jobs: "4.7K Jobs" },
  { name: "Project Manager", jobs: "9.6K Jobs" },
];

const jobCategories = [
  { icon: Home, label: "Remote" },
  { icon: FileText, label: "Internship" },
  { icon: GraduationCap, label: "Fresher" },
  { icon: TrendingUp, label: "Marketing" },
  { icon: Users, label: "HR" },
  { icon: BarChart, label: "Analytics" },
  { icon: FolderKanban, label: "Project M..." },
  { icon: Database, label: "Data Sci..." },
  { icon: Rocket, label: "Startup" },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experience, setExperience] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSearchResults = normalizedSearchQuery
    ? searchSuggestions
        .map((suggestion) => {
          const searchableTerms = [
            suggestion.role,
            suggestion.company,
            suggestion.location,
            suggestion.category,
            ...suggestion.skills,
          ].map((item) => item.toLowerCase());

          let score = 0;

          searchableTerms.forEach((term) => {
            if (term === normalizedSearchQuery) {
              score += 120;
            } else if (term.startsWith(normalizedSearchQuery)) {
              score += 80;
            } else if (term.includes(normalizedSearchQuery)) {
              score += 40;
            }
          });

          suggestion.skills.forEach((skill) => {
            const normalizedSkill = skill.toLowerCase();
            if (normalizedSkill === normalizedSearchQuery) {
              score += 140;
            } else if (normalizedSkill.startsWith(normalizedSearchQuery)) {
              score += 90;
            }
          });

          return { ...suggestion, score };
        })
        .filter((suggestion) => suggestion.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 6)
    : [];

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background:
          "linear-gradient(to bottom, #FAF8FF 0%, #F1ECFF 30%, #E5DDFF 62%, #8776FF 100%)",
      }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-[#faf8ff]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <img
                src={navLogoImage}
                alt="StaffOS Logo"
                className="h-8 sm:h-10 w-auto"
                data-testid="img-logo"
                style={{ objectFit: "contain" }}
              />
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                StaffOS
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/candidate-login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-transparent text-gray-700 hover:bg-white/40 hover:text-gray-900"
                >
                  Login
                </Button>
              </Link>
              <Link href="/candidate-registration">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Register
                </Button>
              </Link>
              <Link href="/employer-login">
                <button className="rounded-lg border border-white/40 bg-white/20 px-4 py-2 text-sm font-medium text-purple-600 transition-all hover:text-purple-700">
                  For Employer
                </button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div
            className={`md:hidden fixed inset-0 bg-gray-500/80 z-40 transition-opacity duration-300 ease-in-out ${
              mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={`md:hidden fixed top-0 right-0 h-full w-80 bg-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-24 sm:pt-28">
        <section className="mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="inline">Your next </span>
              <span className="bg-purple-600 text-white px-4 py-2 inline-block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                <span
                  className="inline-block"
                  style={{ paddingBottom: "0.1em", display: "inline-block" }}
                >
                  BIG opportunity
                </span>
              </span>
              <br />
              <span className="text-purple-600">starts here!</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-4">
              Find roles that match your skills and apply in minutes.
            </p>
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-col gap-3 rounded-lg border border-white/70 bg-white/95 p-3 shadow-lg sm:gap-4 sm:p-4 md:flex-row">
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
              type="number"
              placeholder="Experience"
              className="w-full md:w-32 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              min={0}
              max={25}
              step={1}
              inputMode="numeric"
              value={experience}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (nextValue === "") {
                  setExperience("");
                  return;
                }

                const nextNumber = Number(nextValue);
                if (nextNumber >= 0 && nextNumber <= 25) {
                  setExperience(nextValue);
                }
              }}
            />
            <input
              type="text"
              placeholder="Enter Location"
              className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500 h-[48px]"
            />
            <Link href="/candidate-login" className="w-full md:w-48">
              <button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-3 h-[48px] text-base font-semibold rounded-sm border border-purple-600 flex items-center justify-center transition-colors"
              >
                Search
              </button>
            </Link>

            {showSearchResults && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((result, index) => (
                    <Link
                      key={`${result.role}-${result.company}-${index}`}
                      href="/candidate-login"
                    >
                      <div className="cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{result.role}</h3>
                            <p className="text-sm text-gray-600">
                              {result.company} | {result.location} | {result.experience}
                            </p>
                            <p className="mt-1 text-xs text-purple-700">
                              Skills: {result.skills.slice(0, 3).join(", ")} | {result.category}
                            </p>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-600">
                    No matching roles found. Try React, Designer, Google, HR, or Analytics.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
              Browse jobs by category
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
              Explore roles grouped by industry and find the perfect fit faster.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap justify-center gap-3 sm:gap-4">
              {jobCategories.map((category, index) => (
                <Link key={index} href="/candidate-login">
                  <button className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 w-full sm:w-auto">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F89252] flex items-center justify-center flex-shrink-0">
                      <category.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 flex-1 text-left">
                      {category.label}
                    </span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-16 relative">
          <div className="rounded-2xl border border-white/70 bg-white/45 p-4 shadow-[0_20px_70px_rgba(116,81,255,0.18)] backdrop-blur-lg sm:p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={lp01Image}
                  alt="Career exploration"
                  className="w-full max-w-md h-auto"
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Explore Careers in Top Roles
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700">
                    Choose a role and discover curated opportunities tailored just for you.
                  </p>
                </div>

                <div className="space-y-3">
                  {topRoles.map((role, index) => (
                    <Link key={index} href="/candidate-login">
                      <div className="cursor-pointer rounded-lg border border-purple-200/70 bg-white/70 p-4 shadow-sm transition-all hover:bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{role.name}</h3>
                            <p className="text-sm text-gray-600">{role.jobs}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-900" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="jobs" className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-2">
            Actively Hiring Roles
          </h2>
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

          <div className="mt-8 sm:mt-12 backdrop-blur-lg bg-white/20 rounded-lg border border-white/30 shadow-xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="flex-1 w-full md:w-auto">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Develop Your Potential!
              </h3>
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

        <section className="backdrop-blur-lg bg-white/10 border border-white/30 py-12 sm:py-16 mb-12 sm:mb-16 rounded-lg px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready for your next big career move?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              Don't wait - get your next opportunity today.
            </p>
            <Link href="/candidate-registration">
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              >
                Start Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="text-white max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4">
            STAFFOS...
          </div>
          <div className="flex gap-3 sm:gap-4 mb-6">
            <a
              href="https://linkedin.com/company/scaling-theory/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
            <a
              href="https://twitter.com/ScalingTheory"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
            <a
              href="https://www.facebook.com/scalingtheory"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </a>
          </div>
        </div>
        <div className="pt-6">
          <p className="text-xs sm:text-sm text-white/80 mb-2">
            All trademarks are the property of their respective owners
          </p>
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
