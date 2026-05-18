import { Search, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecruiterJob } from "@shared/schema";

const TOP_SEARCH_TAGS = [
  "React Developer",
  "UI/UX Designer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "Product Manager",
] as const;

const LOCATION_OPTIONS = ["All India", "Remote", "Hybrid", "On-site"] as const;

type LandingSearchHeroProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  location: (typeof LOCATION_OPTIONS)[number];
  onLocationChange: (value: (typeof LOCATION_OPTIONS)[number]) => void;
  onSearch: () => void;
  onTagClick: (tag: string) => void;
  showSearchResults: boolean;
  filteredResults: RecruiterJob[];
  onPickResult: () => void;
  onBlurDropdown: () => void;
  onFocusSearch: () => void;
};

export function LandingSearchHero({
  searchQuery,
  onSearchQueryChange,
  location,
  onLocationChange,
  onSearch,
  onTagClick,
  showSearchResults,
  filteredResults,
  onPickResult,
  onBlurDropdown,
  onFocusSearch,
}: LandingSearchHeroProps) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen bg-[#F9FAFB] py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Find your next opportunity
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-gray-500">
          Discover careers that match your passion and potential.
        </p>

        <div className="relative mx-auto mt-8 max-w-2xl">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:flex-row sm:items-stretch">
            <div className="flex min-h-[52px] flex-1 items-center gap-3 border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r sm:py-0">
              <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onBlur={() => onBlurDropdown()}
                onFocus={onFocusSearch}
              />
            </div>

            <div className="relative flex min-h-[52px] min-w-0 flex-1 items-center gap-2 border-b border-gray-100 px-4 py-3 sm:w-[10rem] sm:flex-none sm:border-b-0 sm:py-0">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
              <div className="relative min-w-0 flex-1">
                <select
                  aria-label="Location"
                  value={location}
                  onChange={(e) =>
                    onLocationChange(e.target.value as (typeof LOCATION_OPTIONS)[number])
                  }
                  className="w-full cursor-pointer appearance-none border-0 bg-transparent py-0.5 pr-7 text-left text-sm font-medium text-gray-800 focus:outline-none focus:ring-0"
                >
                  {LOCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
              </div>
            </div>

            <div className="p-2 sm:flex sm:items-center sm:pr-2">
              <Button
                type="button"
                onClick={onSearch}
                className="h-10 w-full rounded-[8px] bg-[#1E6BFF] px-5 text-sm font-bold text-white hover:bg-blue-700 sm:h-9 sm:min-w-[8.5rem]"
              >
                Search Jobs
              </Button>
            </div>
          </div>

          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white text-left shadow-lg">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <button
                    key={`${result.id}-${index}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onPickResult}
                    className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{result.role}</p>
                      <p className="text-sm text-gray-500">
                        {result.companyName} · {result.location}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-[6px] bg-[#1E6BFF] px-3 py-1.5 text-xs font-semibold text-white">
                      View
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-600">
                  No matching roles. Try a different keyword or pick a top search below.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <p className="text-sm font-semibold text-[#1E6BFF]">Top Searches:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {TOP_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick(tag)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { LOCATION_OPTIONS };
export type LocationOption = (typeof LOCATION_OPTIONS)[number];
