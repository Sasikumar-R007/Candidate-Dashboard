import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import navLogoImage from "@/assets/nav logo.png";
import { FileText, Star, TrendingDown, Users } from "lucide-react";

export default function EmployerLanding() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={navLogoImage}
              alt="StaffOS Logo"
              className="h-8 sm:h-10 w-auto"
              style={{ objectFit: "contain" }}
            />
            <span className="font-semibold text-xl tracking-tight">StaffOS</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to previous page */}
            <button
              onClick={() => window.history.back()}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>

            <Link href="/employer-login">
              <button className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors">
                Login/Signup
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center w-full">
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 text-center mt-6 sm:mt-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug sm:leading-snug md:leading-snug">
            Your perfect talent advisor is here
            <br />
            ready to help you succeed.
          </h1>

          <p className="mt-5 text-gray-600 text-sm sm:text-base">
            Personalized guidance tailored to your goals.
            <br />
            Supporting your success every step of the way.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/employer-login">
              <Button className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-semibold shadow-md">
                Post Free Job
              </Button>
            </Link>

            <Link href="/employer-login">
              <Button
                variant="outline"
                className="px-8 py-3 rounded-full border-purple-600 text-purple-700 hover:bg-purple-50 text-sm sm:text-base font-semibold"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 mt-16 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Recognized by Industry
            <br />
            Tech Experts
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Supporting careers in a fast-moving digital world.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-7 h-7" />
              <p className="text-xl sm:text-2xl font-semibold">1L+</p>
              <p className="text-xs text-gray-500">
                Verified Candidate Database
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Star className="w-7 h-7" />
              <p className="text-xl sm:text-2xl font-semibold">98%</p>
              <p className="text-xs text-gray-500">Client Satisfaction Rate</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <TrendingDown className="w-7 h-7" />
              <p className="text-xl sm:text-2xl font-semibold">0.4%</p>
              <p className="text-xs text-gray-500">
                Early Attrition Rate to Date
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Users className="w-7 h-7" />
              <p className="text-xl sm:text-2xl font-semibold">20k+</p>
              <p className="text-xs text-gray-500">
                Successful Hires to Date
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


