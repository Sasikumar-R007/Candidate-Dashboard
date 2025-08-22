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
import { useNavigate } from "react-router-dom";

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
  experience: [0, 15],
  skills: [],
  role: "",
  company: "",
};

function exportToCSV(data) {
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
  const [selectedIds, setSelectedIds] = useState([]); // for bulk actions
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const resultsPerPage = 6;
  const navigate = useNavigate();

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
  const handleSkillAdd = (skill) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters({ ...filters, skills: [...filters.skills, skill] });
    }
  };
  const handleSkillRemove = (skill) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter((s) => s !== skill),
    });
  };
  const handleSaveCandidate = (id) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, saved: !c.saved } : c))
    );
    if (selectedCandidate && selectedCandidate.id === id) {
      setSelectedCandidate((prev) => ({ ...prev, saved: !prev.saved }));
    }
  };
  const handleSelectCandidate = (id) => {
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
        ...new Set([...prev, ...paginatedCandidates.map((c) => c.id)]),
      ]);
    }
  };
  const handleBulkAction = (action) => {
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
                        parseInt(e.target.value),
                        filters.experience[1],
                      ],
                    })
                  }
                  className="w-16 border rounded px-2 py-1"
                />
                <span>-</span>
                <input
                  type="number"
                  min={filters.experience[0]}
                  max={15}
                  value={filters.experience[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [
                        filters.experience[0],
                        parseInt(e.target.value),
                      ],
                    })
                  }
                  className="w-16 border rounded px-2 py-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-sm text-purple-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="ml-1 rounded-full bg-purple-200 px-1 text-xs text-purple-800 hover:bg-purple-300"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="Add a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleSkillAdd(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-purple-100"
                    onClick={() => handleSkillAdd(skill)}
                  >
                    {skill}
                  </button>
                ))}
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
              <label className="block text-sm font-medium mb-1">
                Current Company
              </label>
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
          <button
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg mt-6 hover:bg-green-700 transition"
            onClick={() => setStep(2)}
          >
            Source Resume
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Results UI
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Filters */}
      <aside className="bg-white border-r w-72 flex-shrink-0 flex flex-col p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-purple-700">Filters</h2>
            <button
              onClick={resetFilters}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            <button
              className={`text-left px-3 py-2 rounded font-medium ${
                sidebarView === "all"
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSidebarView("all")}
            >
              All Candidates
            </button>
            <button
              className={`text-left px-3 py-2 rounded font-medium ${
                sidebarView === "saved"
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSidebarView("saved")}
            >
              Saved Candidates
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search</label>
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
              className={`mt-2 px-2 py-1 rounded text-xs ${
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
          <div className="mb-4">
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
          <div className="mb-4">
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
                      parseInt(e.target.value),
                      filters.experience[1],
                    ],
                  })
                }
                className="w-16 border rounded px-2 py-1"
              />
              <span>-</span>
              <input
                type="number"
                min={filters.experience[0]}
                max={15}
                value={filters.experience[1]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    experience: [
                      filters.experience[0],
                      parseInt(e.target.value),
                    ],
                  })
                }
                className="w-16 border rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-sm text-purple-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="ml-1 rounded-full bg-purple-200 px-1 text-xs text-purple-800 hover:bg-purple-300"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              placeholder="Add a skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  handleSkillAdd(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-purple-100"
                  onClick={() => handleSkillAdd(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded px-2 py-2"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">Any</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Current Company
            </label>
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
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              className="w-96 px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
              placeholder={
                booleanMode
                  ? "Boolean search (e.g. React AND Node.js)"
                  : "Search by name, skill, company..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className={`ml-2 px-4 py-2 rounded ${
                booleanMode
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setBooleanMode((v) => !v)}
            >
              Boolean
            </button>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 cursor-pointer flex items-center gap-2"
                onClick={() => setShowBulkDropdown((v) => !v)}
                title="Bulk Action lets you select multiple candidates and perform actions like save, export, etc."
                disabled={selectedIds.length === 0}
              >
                <CheckSquare className="w-4 h-4" /> Bulk Actions
              </button>
              {showBulkDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10 min-w-[150px]">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-purple-50"
                    onClick={() => handleBulkAction("save")}
                  >
                    Save Selected
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-purple-50"
                    onClick={() => handleBulkAction("unsave")}
                  >
                    Unsave Selected
                  </button>
                </div>
              )}
            </div>
            <button
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
              title="Export lets you download the candidate list as CSV, Excel, or PDF."
              onClick={() => {
                if (window.confirm("Export all visible candidates as CSV?")) {
                  exportToCSV(filteredCandidates);
                }
              }}
            >
              Export
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </header>
        {/* Main Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Candidates List */}
          <div className="w-full md:w-2/3 p-8 overflow-y-auto">
            {sidebarView === "saved" && filteredCandidates.length === 0 && (
              <div className="text-center text-gray-500 text-lg py-12">
                No resumes are saved yet.
              </div>
            )}
            <div className="grid grid-cols-1 gap-6">
              {paginatedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition relative ${
                    selectedCandidate?.id === candidate.id
                      ? "ring-2 ring-purple-400"
                      : ""
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  {/* Bulk select checkbox */}
                  <div className="absolute left-4 top-4">
                    <button
                      className="focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCandidate(candidate.id);
                      }}
                    >
                      {selectedIds.includes(candidate.id) ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {/* Avatar/Initials */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 text-2xl font-bold select-none ml-8 md:ml-0">
                    {candidate.profilePic ? (
                      <img
                        src={candidate.profilePic}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span>
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="text-lg font-bold text-gray-900 leading-tight">
                          {candidate.name}
                        </div>
                        <div className="text-blue-700 font-semibold text-base hover:underline cursor-pointer">
                          {candidate.title}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                          className={`border px-4 py-2 rounded font-semibold text-sm ${
                            candidate.saved
                              ? "border-purple-600 text-purple-700 bg-purple-50"
                              : "border-gray-300 text-gray-900 bg-white hover:bg-gray-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveCandidate(candidate.id);
                          }}
                        >
                          {candidate.saved ? "Saved" : "Save Candidate"}
                        </button>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(candidate);
                          }}
                        >
                          View Resume
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3 text-gray-700 text-sm">
                      <div className="flex items-center gap-1 min-w-[150px]">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {candidate.experience} years experience
                      </div>
                      <div className="flex items-center gap-1 min-w-[150px]">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center gap-1 min-w-[150px]">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        {candidate.education}
                      </div>
                      <div className="flex items-center gap-1 min-w-[150px]">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {candidate.currentCompany}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {candidate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-gray-700 text-sm">
                      {candidate.summary}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock className="w-4 h-4" />
                      Last active: {candidate.lastActive}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded border ${
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {/* Candidate Profile Preview (unchanged) */}
          <div className="hidden md:block w-1/3 bg-white border-l p-8 overflow-y-auto">
            {selectedCandidate ? (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {selectedCandidate.profilePic ? (
                    <img
                      src={selectedCandidate.profilePic}
                      alt={selectedCandidate.name}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500">
                      {selectedCandidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedCandidate.name}
                    </h3>
                    <div className="text-purple-700 font-semibold">
                      {selectedCandidate.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCandidate.location}
                    </div>
                  </div>
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  {selectedCandidate.summary}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Current Company:</span>{" "}
                  {selectedCandidate.currentCompany}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Experience:</span>{" "}
                  {selectedCandidate.experience} years
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Education:</span>{" "}
                  {selectedCandidate.education}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Notice Period:</span>{" "}
                  {selectedCandidate.noticePeriod}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">CTC:</span>{" "}
                  {selectedCandidate.ctc}{" "}
                  <span className="ml-2 font-semibold">Expected:</span>{" "}
                  {selectedCandidate.expectedCtc}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedCandidate.email}
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Phone:</span>{" "}
                  {selectedCandidate.phone}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidate.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 items-center">
                  <button className="p-2 w-auto h-11 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1">
                    <Download className="w-5 h-5" />{" "}
                    <span className="text-sm font-medium">Resume</span>
                  </button>
                  <button
                    className={`p-2 w-11 h-11 rounded flex items-center justify-center ${
                      selectedCandidate.saved
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-500 border border-gray-300"
                    }`}
                    onClick={() => handleSaveCandidate(selectedCandidate.id)}
                  >
                    {selectedCandidate.saved ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                  <button className="p-2 w-11 h-11 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 w-11 h-11 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-20">
                Select a candidate to preview profile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SourceResume };
