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
  {
    id: 4,
    name: "Ravi Kumar",
    title: "DevOps Engineer",
    location: "Chennai, India",
    experience: 6,
    education: "B.Tech IT",
    currentCompany: "Amazon",
    lastActive: "3 days ago",
    skills: ["AWS", "Docker", "Kubernetes", "Linux", "Python"],
    summary: "DevOps engineer with strong cloud and automation background.",
    resumeUrl: "#",
    profilePic: "",
    noticePeriod: "60 days",
    ctc: "₹28L",
    expectedCtc: "₹32L",
    email: "ravi.kumar@email.com",
    phone: "+91 9876543212",
    saved: false,
  },
  {
    id: 5,
    name: "Meena S",
    title: "Full Stack Developer",
    location: "Remote",
    experience: 3.5,
    education: "M.Sc. Computer Science",
    currentCompany: "Google",
    lastActive: "6 hours ago",
    skills: ["Node.js", "React", "MongoDB", "Express", "AWS"],
    summary: "Full stack developer with a passion for scalable web apps.",
    resumeUrl: "#",
    profilePic: "",
    noticePeriod: "Immediate",
    ctc: "₹20L",
    expectedCtc: "₹25L",
    email: "meena.s@email.com",
    phone: "+91 9876543213",
    saved: true,
  },
  {
    id: 6,
    name: "Tom Victor",
    title: "Backend Developer",
    location: "Bangalore, India",
    experience: 2,
    education: "BCA",
    currentCompany: "Infosys",
    lastActive: "4 days ago",
    skills: ["Node.js", "Express", "MongoDB", "Docker"],
    summary: "Backend developer with a focus on Node.js and microservices.",
    resumeUrl: "#",
    profilePic: "",
    noticePeriod: "30 days",
    ctc: "₹10L",
    expectedCtc: "₹13L",
    email: "tom.victor@email.com",
    phone: "+91 9876543214",
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
  const [step, setStep] = useState(1); // 1: filter, 2: results
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

  // UI
  if (step === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">
            Source Resume
          </h2>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder={
                  booleanMode
                    ? "Boolean search (e.g. React AND Node.js)"
                    : "Search by name, skill, company..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className={`absolute right-2 top-2 px-2 py-1 rounded text-xs ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                className="w-full border rounded px-2 py-2"
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Experience (years)
              </label>
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
                  className="w-20 border rounded px-2 py-1"
                />
                <span>to</span>
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
                  className="w-20 border rounded px-2 py-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full border rounded px-2 py-2"
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
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <select
                className="w-full border rounded px-2 py-2"
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
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="text-blue-600 hover:text-blue-800"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSkillAdd(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full border rounded px-2 py-2"
            >
              <option value="">Add skills...</option>
              {allSkills
                .filter((skill) => !filters.skills.includes(skill))
                .map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              <RotateCw size={16} />
              Reset
            </button>
            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
            >
              Search ({filteredCandidates.length} results)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Results */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                Back to Filters
              </button>
              <h1 className="text-xl font-semibold">
                {filteredCandidates.length} Candidates Found
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(filteredCandidates)}
                className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
              >
                <Download size={16} />
                Export CSV
              </button>
              <div className="relative">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Actions ({selectedIds.length})
                    </button>
                    {showBulkDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleBulkAction("save")}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Save Selected
                          </button>
                          <button
                            onClick={() => handleBulkAction("unsave")}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Unsave Selected
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setSidebarView("all")}
              className={`px-4 py-2 rounded text-sm ${
                sidebarView === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Candidates ({candidates.length})
            </button>
            <button
              onClick={() => setSidebarView("saved")}
              className={`px-4 py-2 rounded text-sm ${
                sidebarView === "saved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Saved ({candidates.filter((c) => c.saved).length})
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer border-2 transition-colors ${
                selectedCandidate?.id === candidate.id
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCandidate(candidate.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selectedIds.includes(candidate.id) ? (
                      <CheckSquare size={20} className="text-blue-600" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                  {candidate.profilePic ? (
                    <img
                      src={candidate.profilePic}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {candidate.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCandidate(candidate.id);
                  }}
                  className="text-gray-400 hover:text-blue-500"
                >
                  {candidate.saved ? (
                    <BookmarkCheck size={20} className="text-blue-500" />
                  ) : (
                    <Bookmark size={20} />
                  )}
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{candidate.title}</p>

              <div className="flex items-center text-xs text-gray-500 mb-2">
                <MapPin size={12} className="mr-1" />
                {candidate.location}
              </div>

              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Briefcase size={12} className="mr-1" />
                {candidate.experience} years • {candidate.currentCompany}
              </div>

              <div className="flex items-center text-xs text-gray-500 mb-3">
                <GraduationCap size={12} className="mr-1" />
                {candidate.education}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{candidate.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                Active {candidate.lastActive}
              </div>
            </div>
          ))}
        </div>

        {/* Select All and Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              {paginatedCandidates.every((c) => selectedIds.includes(c.id)) ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} />
              )}
              Select All ({paginatedCandidates.length})
            </button>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Selected Candidate Details */}
      {selectedCandidate && (
        <div className="w-96 bg-white border-l border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Candidate Details</h2>
            <button
              onClick={() => handleSaveCandidate(selectedCandidate.id)}
              className="text-gray-400 hover:text-blue-500"
            >
              {selectedCandidate.saved ? (
                <BookmarkCheck size={24} className="text-blue-500" />
              ) : (
                <Bookmark size={24} />
              )}
            </button>
          </div>

          <div className="text-center mb-6">
            {selectedCandidate.profilePic ? (
              <img
                src={selectedCandidate.profilePic}
                alt={selectedCandidate.name}
                className="w-20 h-20 rounded-full mx-auto mb-3"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-600 text-2xl font-medium">
                {selectedCandidate.name.charAt(0)}
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedCandidate.name}
            </h3>
            <p className="text-gray-600">{selectedCandidate.title}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm">{selectedCandidate.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm">{selectedCandidate.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-sm">{selectedCandidate.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="text-gray-400" />
              <span className="text-sm">
                {selectedCandidate.experience} years at{" "}
                {selectedCandidate.currentCompany}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap size={16} className="text-gray-400" />
              <span className="text-sm">{selectedCandidate.education}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-sm text-gray-600">{selectedCandidate.summary}</p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCandidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-500">Notice Period</span>
              <p className="font-medium">{selectedCandidate.noticePeriod}</p>
            </div>
            <div>
              <span className="text-gray-500">Current CTC</span>
              <p className="font-medium">{selectedCandidate.ctc}</p>
            </div>
            <div>
              <span className="text-gray-500">Expected CTC</span>
              <p className="font-medium">{selectedCandidate.expectedCtc}</p>
            </div>
            <div>
              <span className="text-gray-500">Last Active</span>
              <p className="font-medium">{selectedCandidate.lastActive}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Contact
            </button>
            <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Download size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceResume;