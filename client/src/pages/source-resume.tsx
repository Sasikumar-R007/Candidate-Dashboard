import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  CheckSquare,
  Square,
  RotateCw,
  ArrowLeft,
  Download,
  Bookmark,
  BookmarkCheck,
  Phone,
  Mail,
} from "lucide-react";
import { useLocation } from "wouter";

const mockCandidates = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Full Stack Developer",
    location: "Mumbai, Maharashtra",
    experience: 5.5,
    education: "B.Tech Computer Science",
    currentCompany: "Tech Solutions Inc.",
    lastActive: "2 days ago",
    skills: ["React", "Node.js", "Python", "AWS", "MongoDB"],
    summary:
      "Experienced full-stack developer with expertise in modern web technologies and cloud platforms.",
    resumeUrl: "#",
    profilePic: "",
    noticePeriod: "30 days",
    ctc: "₹32L",
    expectedCtc: "₹38L",
    email: "sarah.johnson@email.com",
    phone: "+91 9876543210",
    saved: false,
  },
  {
    id: 2,
    name: "Priya Menon",
    title: "Backend Developer",
    location: "Remote",
    experience: 5,
    education: "MCA, Anna University",
    currentCompany: "Freshworks",
    lastActive: "5 hours ago",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker", "Redis"],
    summary:
      "Backend developer with strong cloud and microservices experience.",
    resumeUrl: "#",
    profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
    noticePeriod: "Immediate",
    ctc: "₹24L",
    expectedCtc: "₹28L",
    email: "priya.menon@email.com",
    phone: "+91 9988776655",
    saved: true,
  },
  {
    id: 3,
    name: "Amit Sharma",
    title: "Frontend Engineer",
    location: "Bangalore, India",
    experience: 4,
    education: "B.E. Computer Science",
    currentCompany: "Flipkart",
    lastActive: "1 day ago",
    skills: ["React", "Redux", "TypeScript", "HTML", "CSS"],
    summary:
      "Frontend specialist with 4 years experience in e-commerce and SaaS.",
    resumeUrl: "#",
    profilePic: "",
    noticePeriod: "15 days",
    ctc: "₹18L",
    expectedCtc: "₹22L",
    email: "amit.sharma@email.com",
    phone: "+91 9876543211",
    saved: false,
  },
];

const allSkills = [
  "React",
  "Node.js",
  "Python",
  "AWS",
  "MongoDB",
  "Express",
  "Docker",
  "Redis",
];
const allRoles = [
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Engineer",
];
const allCompanies = ["Tech Solutions Inc.", "Freshworks", "Google", "Amazon"];
const allLocations = ["Mumbai, Maharashtra", "Remote", "Bangalore, India"];

const initialFilters = {
  location: "",
  experience: [0, 15] as [number, number],
  skills: [] as string[],
  role: "",
  company: "",
};

function exportToCSV(data: any[]) {
  const csvRows = [];
  const headers = [
    "Name",
    "Title",
    "Location",
    "Experience",
    "Education",
    "Company",
    "Skills",
    "Last Active",
  ];
  csvRows.push(headers.join(","));
  for (const c of data) {
    csvRows.push(
      [
        c.name,
        c.title,
        c.location,
        c.experience,
        c.education,
        c.currentCompany,
        c.skills.join(" | "),
        c.lastActive,
      ]
        .map((v) => '"' + v + '"')
        .join(",")
    );
  }
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "candidates.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

const SourceResume = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [booleanMode, setBooleanMode] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarView, setSidebarView] = useState("all"); // 'all' or 'saved'
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // for bulk actions
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const resultsPerPage = 6;
  const [, setLocation] = useLocation();

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
    setBooleanMode(false);
  };

  // Filtering logic
  const filterCandidates = () => {
    let list = candidates;
    if (sidebarView === "saved") list = list.filter((c) => c.saved);
    return list.filter((c) => {
      if (booleanMode && searchQuery.trim()) {
        const terms = searchQuery.split(/\s+(AND|OR)\s+/i);
        let match = false;
        if (terms.includes("AND")) {
          match = terms
            .filter((t) => t !== "AND")
            .every((t) =>
              [c.name, c.title, ...c.skills]
                .join(" ")
                .toLowerCase()
                .includes(t.toLowerCase())
            );
        } else if (terms.includes("OR")) {
          match = terms
            .filter((t) => t !== "OR")
            .some((t) =>
              [c.name, c.title, ...c.skills]
                .join(" ")
                .toLowerCase()
                .includes(t.toLowerCase())
            );
        } else {
          match = [c.name, c.title, ...c.skills]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        if (!match) return false;
      } else if (searchQuery.trim()) {
        if (
          !(
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.skills.some((s) =>
              s.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        ) {
          return false;
        }
      }
      if (filters.location && c.location !== filters.location) return false;
      if (
        c.experience < filters.experience[0] ||
        c.experience > filters.experience[1]
      )
        return false;
      if (
        filters.skills.length > 0 &&
        !filters.skills.every((s) => c.skills.includes(s))
      )
        return false;
      if (filters.role && c.title !== filters.role) return false;
      if (filters.company && c.currentCompany !== filters.company) return false;
      return true;
    });
  };

  const filteredCandidates = filterCandidates();
  const totalPages = Math.ceil(filteredCandidates.length / resultsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Handlers
  const handleSkillAdd = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters({ ...filters, skills: [...filters.skills, skill] });
    }
  };
  const handleSkillRemove = (skill: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    });
  };
  const handleSaveCandidate = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, saved: !c.saved } : c))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => ({ ...prev, saved: !prev.saved }));
    }
  };
  const handleSelectCandidate = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (paginatedCandidates.every((c) => selectedIds.includes(c.id))) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedCandidates.some((c) => c.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...Array.from(new Set([...prev, ...paginatedCandidates.map((c) => c.id)])),
      ]);
    }
  };
  const handleBulkAction = (action: string) => {
    if (action === "save") {
      setCandidates((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id) ? { ...c, saved: true } : c
        )
      );
    } else if (action === "unsave") {
      setCandidates((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id) ? { ...c, saved: false } : c
        )
      );
    }
    setShowBulkDropdown(false);
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Filters */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-purple-600">Filters</h2>
          <button
            onClick={resetFilters}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search by name, skill, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="mt-2">
              <button
                className={`px-3 py-1 rounded text-xs ${
                  booleanMode
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setBooleanMode((v) => !v)}
                type="button"
              >
                Boolean
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            >
              <option value="">Any</option>
              {allLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium mb-2">Experience (years)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                max={filters.experience[1]}
                value={filters.experience[0]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    experience: [
                      parseInt(e.target.value) || 0,
                      filters.experience[1],
                    ],
                  })
                }
                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="text-sm text-gray-500">-</span>
              <input
                type="number"
                min={filters.experience[0]}
                max={20}
                value={filters.experience[1]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    experience: [
                      filters.experience[0],
                      parseInt(e.target.value) || 15,
                    ],
                  })
                }
                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {allSkills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    filters.skills.includes(skill)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => 
                    filters.skills.includes(skill) 
                      ? handleSkillRemove(skill)
                      : handleSkillAdd(skill)
                  }
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value })
              }
            >
              <option value="">Any</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Current Company */}
          <div>
            <label className="block text-sm font-medium mb-2">Current Company</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={filters.company}
              onChange={(e) =>
                setFilters({ ...filters, company: e.target.value })
              }
            >
              <option value="">Any</option>
              {allCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Source Resume Button */}
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
          >
            Source Resume
          </button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex">
        {/* Results List */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <input
                type="text" 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-80 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search by name, skill, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                Boolean
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm"
              >
                Bulk Actions
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm">
                Export
              </button>
              <button
                onClick={() => setLocation('/recruiter')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>

          {/* Sidebar Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSidebarView("all")}
              className={`px-4 py-2 rounded text-sm ${
                sidebarView === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              All Candidates
            </button>
            <button
              onClick={() => setSidebarView("saved")}
              className={`px-4 py-2 rounded text-sm ${
                sidebarView === "saved"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              Saved Candidates
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {paginatedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer ${
                  selectedCandidate?.id === candidate.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectCandidate(candidate.id);
                      }}
                      className="mt-1"
                    />
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-600">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">{candidate.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} />
                          {candidate.experience} years experience
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} />
                          {candidate.education}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{candidate.summary}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Clock size={12} />
                        Last active: {candidate.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveCandidate(candidate.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Save Candidate
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      View Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Selected Candidate Details */}
        {selectedCandidate && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {selectedCandidate.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedCandidate.name}</h3>
                <p className="text-gray-600">{selectedCandidate.title}</p>
                <p className="text-sm text-gray-500">{selectedCandidate.location}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.experience} years</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.education}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Company</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.currentCompany}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notice Period</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.noticePeriod}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">CTC</h4>
                <p className="text-sm text-gray-600">Current: {selectedCandidate.ctc}</p>
                <p className="text-sm text-gray-600">Expected: {selectedCandidate.expectedCtc}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm flex items-center justify-center gap-1">
                  <Download size={14} />
                  Resume
                </button>
                <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                  <Phone size={14} />
                </button>
                <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceResume;