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
      setSelectedIds((prev) => 
        Array.from(new Set([...prev, ...paginatedCandidates.map((c) => c.id)]))
      );
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-600">
              Source Resume
            </h2>
            <button
              onClick={resetFilters}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        parseInt(e.target.value) || 15,
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
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                    handleSkillAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
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
            <div className="md:col-span-2">
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

  // Step 2: Results UI - Three section layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section - Filters */}
      <aside className="bg-white border-r w-64 flex-shrink-0 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-purple-700">Filters</h2>
          <button
            onClick={resetFilters}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <RotateCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2 mb-4">
          <button
            className={`text-left px-3 py-2 rounded text-sm font-medium ${
              sidebarView === "all"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSidebarView("all")}
          >
            All Candidates
          </button>
          <button
            className={`text-left px-3 py-2 rounded text-sm font-medium ${
              sidebarView === "saved"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSidebarView("saved")}
          >
            Saved Candidates
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search by name, skill, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              className="w-full border rounded px-2 py-2 text-sm"
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
            <label className="block text-sm font-medium mb-1">Experience (years)</label>
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
                className="w-12 border rounded px-1 py-1 text-sm"
              />
              <span className="text-sm">-</span>
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
                      parseInt(e.target.value) || 15,
                    ],
                  })
                }
                className="w-12 border rounded px-1 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Add a skill and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                  handleSkillAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {allSkills.slice(0, 8).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`text-xs px-2 py-1 rounded ${
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
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border rounded px-2 py-2 text-sm"
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
            <label className="block text-sm font-medium mb-1">Current Company</label>
            <select
              className="w-full border rounded px-2 py-2 text-sm"
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

      {/* Center Section - Profiles (Scrollable) */}
      <main className="flex-1 flex flex-col bg-white border-r">
        {/* Search Header - Fixed */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 relative max-w-md">
              <input
                type="text"
                className="w-full border rounded px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search by name, skill, company..."
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
            <div className="flex items-center gap-2 ml-4">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Bulk Actions
              </button>
              <button 
                onClick={() => exportToCSV(filteredCandidates)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Export
              </button>
              <button
                onClick={() => setLocation('/recruiter')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Profiles List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCandidate?.id === candidate.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(candidate.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectCandidate(candidate.id);
                    }}
                    className="mt-1"
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
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
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{candidate.summary}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Clock size={12} />
                          Last active: {candidate.lastActive}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveCandidate(candidate.id);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          {candidate.saved ? "Saved" : "Save Candidate"}
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          View Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right Section - Candidate Details (Larger) */}
      {selectedCandidate && (
        <aside className="w-96 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">
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
              <p className="text-gray-700 text-sm leading-relaxed">{selectedCandidate.summary}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Company</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.currentCompany}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.experience} years</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Education</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.education}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notice Period</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.noticePeriod}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">CTC</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.ctc}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Expected</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.expectedCtc}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Email</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.phone}</p>
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
              <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm flex items-center justify-center gap-1 hover:bg-blue-700">
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
        </aside>
      )}
    </div>
  );
};

export default SourceResume;