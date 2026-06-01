import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
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
  Rocket,
  TrendingUp,
  Twitter,
  Users,
} from "lucide-react";
import navLogoImage from "@/assets/nav logo.png";
import { useAuth } from "@/contexts/auth-context";
import { getDefaultRouteForAuthUser } from "@/lib/auth-routing";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/landing/JobCard";
import { LandingFeaturesGrid } from "@/components/landing/landing-features-grid";
import { LandingHeroSection } from "@/components/landing/landing-hero-section";
import {
  LandingSearchHero,
  type LocationOption,
} from "@/components/landing/landing-search-hero";
import { RecruiterJob } from "@shared/schema";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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


// Real-time top roles will be derived from the jobs array inside the component

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
  const [, navigate] = useLocation();
  const { user, isLoading, isVerified } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<LocationOption>("All India");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 6;

  const { data: jobs = [] } = useQuery<RecruiterJob[]>({
    queryKey: ["/api/public-jobs"],
  });

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const currentJobs = jobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const jobsSection = document.getElementById("jobs");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDelayedNav = (href: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      window.location.href = href;
    }, 1000);
  };

  // Derive top roles from real jobs data
  const dynamicTopRoles = Array.from(new Set(jobs.map(j => j.role || j.title)))
    .filter(Boolean)
    .slice(0, 3)
    .map(role => ({ name: role }));

  // Use the default if no jobs yet
  const displayTopRoles = dynamicTopRoles.length > 0 ? dynamicTopRoles : [
    { name: "Product Designer" },
    { name: "Software Engineer" },
    { name: "Project Manager" }
  ];


  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSearchResults = normalizedSearchQuery
    ? jobs
        .filter(job => {
          const searchableText = `${job.role} ${job.companyName} ${job.location} ${job.jobCategory} ${job.primarySkills}`.toLowerCase();
          return searchableText.includes(normalizedSearchQuery);
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    if (isLoading || !isVerified) {
      return;
    }

    const redirectPath = getDefaultRouteForAuthUser(user);
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [user, isLoading, isVerified, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
          <a
            href="/"
            className="flex min-w-0 items-center gap-2 sm:gap-2.5"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src={navLogoImage}
              alt="StaffOS Logo"
              className="h-8 w-auto shrink-0 sm:h-9"
              data-testid="img-logo"
              style={{ objectFit: "contain" }}
            />
            <span className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
              StaffOS
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button
              onClick={() => handleDelayedNav("/candidate-login")}
              className="h-9 rounded-[6px] bg-[#2563EB] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 sm:h-10 sm:px-6 sm:text-sm"
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelayedNav("/employer-login")}
              className="h-9 rounded-[6px] border-gray-300 bg-white px-3.5 text-xs font-semibold text-gray-900 hover:bg-gray-50 sm:h-10 sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Employer</span>
              <span className="hidden sm:inline">For Employer</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 pb-8 pt-[4.25rem] sm:px-6 sm:pb-12 sm:pt-20">
        <LandingHeroSection
          onSignUp={() => handleDelayedNav("/candidate-registration")}
        />
        <LandingFeaturesGrid />

        <LandingSearchHero
          searchQuery={searchQuery}
          onSearchQueryChange={(v) => {
            setSearchQuery(v);
            setShowSearchResults(v.trim().length > 0);
          }}
          location={locationFilter}
          onLocationChange={setLocationFilter}
          onSearch={() => handleDelayedNav("/candidate-login")}
          onTagClick={(tag) => {
            setSearchQuery(tag);
            setShowSearchResults(false);
          }}
          showSearchResults={showSearchResults}
          filteredResults={filteredSearchResults}
          onPickResult={() => handleDelayedNav("/candidate-login")}
          onBlurDropdown={() => setTimeout(() => setShowSearchResults(false), 200)}
          onFocusSearch={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
        />

        <section className="mb-16 mt-2">
          <div className="mt-10">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-900 sm:text-2xl">
              Browse jobs by category
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600 sm:text-base">
              Explore roles grouped by industry and find the perfect fit faster.
            </p>
            <div className="group relative overflow-hidden py-4">
              <motion.div
                className="flex w-max gap-4"
                animate={{
                  x: [0, -1000],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 35,
                    ease: "linear",
                  },
                }}
                whileHover={{ animationPlayState: "paused" }}
                style={{ display: "flex", gap: "1rem" }}
              >
                {[...jobCategories, ...jobCategories, ...jobCategories].map((category, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const jobsSection = document.getElementById("jobs");
                      if (jobsSection) {
                        jobsSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-white px-6 py-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 shadow-sm shadow-sky-100/80">
                      <category.icon className="h-5 w-5 text-[#1E6BFF]" />
                    </div>
                    <span className="flex-1 whitespace-nowrap text-left text-base font-semibold text-gray-800">
                      {category.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </button>
                ))}
              </motion.div>

              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </section>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] mb-10 w-screen bg-[#F9FAFB] py-14 sm:mb-12 sm:py-16">
          <section id="jobs" className="mx-auto max-w-[90rem] px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Latest opportunities
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600 sm:text-base">
              Actively hiring right now — apply in one click
            </p>

            {jobs.length > 0 ? (
              <>
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex justify-center sm:justify-start">
                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="h-9 w-9 rounded-[6px] border-gray-200 bg-white p-0 hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </Button>
                        <div className="mx-1 flex flex-wrap justify-center gap-1.5">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => handlePageChange(page)}
                              className={`h-9 min-w-[2.25rem] rounded-[6px] px-2 text-sm font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-[#1E6BFF] text-white shadow-md shadow-blue-200/50"
                                  : "border border-gray-200 bg-white text-gray-500 hover:border-sky-300 hover:text-[#1E6BFF]"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="h-9 w-9 rounded-[6px] border-gray-200 bg-white p-0 hover:bg-gray-50"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => handleDelayedNav("/candidate-login")}
                      className="h-10 rounded-[6px] bg-[#1E6BFF] px-6 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Browse More Jobs
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-10 rounded-xl border border-sky-100/80 bg-white py-12 text-center text-gray-500 shadow-sm">
                No active roles available at the moment. Please check back later.
              </div>
            )}
          </section>
        </div>

        <div className="mx-auto mb-12 max-w-[90rem] sm:mb-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[10px] bg-[#2563EB] px-6 py-8 sm:flex-row sm:items-center sm:px-10 sm:py-10">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready for your next big career move?
              </h2>
              <p className="mt-2 max-w-xl text-base text-white/90">
                Don&apos;t wait — get your next opportunity today.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => handleDelayedNav("/candidate-registration")}
              className="h-10 shrink-0 rounded-[6px] bg-white px-8 text-sm font-bold text-[#2563EB] shadow-sm hover:bg-gray-100 sm:h-11 sm:text-base"
            >
              Register
            </Button>
          </div>
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-gray-100 bg-white text-[#2563EB]">
        <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 sm:py-12">
          <div className="mb-8">
            <div className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              StaffOS...
            </div>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/company/scaling-theory/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#2563EB] bg-[#2563EB] text-white transition-colors hover:bg-white hover:text-[#2563EB]"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/ScalingTheory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#2563EB] bg-[#2563EB] text-white transition-colors hover:bg-white hover:text-[#2563EB]"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/scalingtheory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#2563EB] bg-[#2563EB] text-white transition-colors hover:bg-white hover:text-[#2563EB]"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="space-y-3 border-t border-sky-100 pt-6 text-sm text-[#2563EB]/90">
            <p>All trademarks are the property of their respective owners</p>
            <p className="flex flex-wrap items-center gap-1.5">
              <span>All rights reserved © 2026</span>
              <a
                href="https://scalingtheory.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium underline decoration-[#2563EB]/40 underline-offset-2 hover:opacity-80"
              >
                Scaling Theory Technologies Private Ltd.
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 bg-[#1d4ed8] py-3 text-center text-sm">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 sm:px-6">
            <Link
              href="/privacy-policy"
              className="font-semibold text-white/95 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              className="font-semibold text-white/95 transition-colors hover:text-white"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
      {/* Simplified Three-Dot Jumping Loading Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]/55 backdrop-blur-md"
          >
            <div className="landing-loader"></div>



















            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm font-semibold tracking-wide text-blue-100"
            >
              Loading...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
