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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    // Clear the Select value by not maintaining any value state
    const selectElement = document.querySelector('[role="combobox"]') as HTMLElement;
    if (selectElement) {
      selectElement.click(); // This will close the select
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
              <Input
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
              <Label className="block text-sm font-medium mb-1">Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {allLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">
                Experience (years)
              </Label>
              <div className="flex gap-2 items-center">
                <Input
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
                  className="w-20"
                />
                <span>to</span>
                <Input
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
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Role</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {allRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Company</Label>
              <Select value={filters.company} onValueChange={(value) => setFilters({ ...filters, company: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {allCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-1">Skills</Label>
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
            <Select onValueChange={(value) => {
              handleSkillAdd(value);
            }} value="">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add skills..." />
              </SelectTrigger>
              <SelectContent>
                {allSkills
                  .filter((skill) => !filters.skills.includes(skill))
                  .map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCw size={16} />
              Reset
            </Button>
            <Button
              onClick={() => setStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search ({filteredCandidates.length} results)
            </Button>
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
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Filters
              </Button>
              <h1 className="text-xl font-semibold">
                {filteredCandidates.length} Candidates Found
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => exportToCSV(filteredCandidates)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
              <div className="relative">
                {selectedIds.length > 0 && (
                  <>
                    <Button
                      onClick={() => setShowBulkDropdown(!showBulkDropdown)}
                      variant="outline"
                      size="sm"
                    >
                      Actions ({selectedIds.length})
                    </Button>
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
            <Button
              onClick={() => setSidebarView("all")}
              variant={sidebarView === "all" ? "default" : "outline"}
              size="sm"
            >
              All Candidates ({candidates.length})
            </Button>
            <Button
              onClick={() => setSidebarView("saved")}
              variant={sidebarView === "saved" ? "default" : "outline"}
              size="sm"
            >
              Saved ({candidates.filter((c) => c.saved).length})
            </Button>
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  {candidate.saved ? (
                    <BookmarkCheck size={20} className="text-blue-600" />
                  ) : (
                    <Bookmark size={20} />
                  )}
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{candidate.title}</p>

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase size={12} />
                  <span>
                    {candidate.experience} yrs • {candidate.currentCompany}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>Active {candidate.lastActive}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    +{candidate.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel - Candidate Details */}
      {selectedCandidate && (
        <div className="w-1/3 bg-white shadow-lg p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Candidate Profile</h2>
            <button
              onClick={() => handleSaveCandidate(selectedCandidate.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              {selectedCandidate.saved ? (
                <BookmarkCheck size={24} className="text-blue-600" />
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
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-2xl mx-auto mb-3">
                {selectedCandidate.name.charAt(0)}
              </div>
            )}
            <h3 className="font-bold text-xl text-gray-900">
              {selectedCandidate.name}
            </h3>
            <p className="text-gray-600">{selectedCandidate.title}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-500" />
                  <span>{selectedCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-gray-500" />
                  <span>{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-gray-500" />
                  <span>{selectedCandidate.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase size={16} className="text-gray-500" />
                  <span>{selectedCandidate.experience} years</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Current:</strong> {selectedCandidate.currentCompany}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Notice Period:</strong> {selectedCandidate.noticePeriod}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap size={16} className="text-gray-500" />
                <span>{selectedCandidate.education}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Compensation</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Current CTC:</strong> {selectedCandidate.ctc}
                </p>
                <p>
                  <strong>Expected CTC:</strong> {selectedCandidate.expectedCtc}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
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

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
              <p className="text-sm text-gray-600">{selectedCandidate.summary}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Activity</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-gray-500" />
                <span>Last active {selectedCandidate.lastActive}</span>
              </div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.open(selectedCandidate.resumeUrl, "_blank")}
            >
              <Download size={16} className="mr-2" />
              Download Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceResume;