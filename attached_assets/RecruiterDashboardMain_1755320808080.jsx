import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBriefcase,
  FaUserCheck,
  FaLinkedin,
  FaCalendarCheck,
  FaHandshake,
  FaEdit,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
  Funnel,
  SlidersHorizontal,
} from "lucide-react";

const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const RecruiterDashboardMain = () => {
  const navigate = useNavigate();
  const handleUploadClick = () => {
    // navigate("/upload-resume");
    navigate("/candidate-form");
  };

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("updates");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const summaryCards = [
    {
      icon: <FaBriefcase size={28} className="text-black" />,
      title: "Active jobs",
      count: 12,
      subtitle: "Total Jobs Posted: 25",
      path: "/recruiter/total-jobs",
    },
    {
      icon: <FaUserCheck size={28} className="text-black" />,
      title: "New applications:",
      count: 12,
      subtitle: "Candidates Applied: 82",
      path: "/recruiter/candidates-applied",
    },
  ];

  const [recruiter, setRecruiter] = useState({});
  const recruiterId = localStorage.getItem("recruiterId"); // Store recruiterId after login

  useEffect(() => {
    if (recruiterId) {
      axios
        .get(`${API_BASE}/recruiter/${recruiterId}`)
        .then((res) => setRecruiter(res.data))
        .catch((err) => console.error("Error fetching recruiter:", err));
    }
  }, [recruiterId]);

  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");

  const [editData, setEditData] = useState({
    recruiterId: "",
    name: "",
    email: "",
    mobile: "",
    designation: "",
    reportingTo: "",
    joiningDate: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("recruiterProfile");
    if (stored) {
      setRecruiter(JSON.parse(stored));
    }
  }, []);

  const [visibleCount, setVisibleCount] = useState(5);

  const [activeCandidates, setActiveCandidates] = useState([
    {
      id: "cand001",
      name: "John Doe",
      jobId: "job001",
      job: "Frontend Developer",
      company: "TechCorp",
    },
    {
      id: "cand002",
      name: "Jane Smith",
      jobId: "job002",
      job: "UI/UX Designer",
      company: "Designify",
    },
    {
      id: "cand003",
      name: "Ravi Kumar",
      jobId: "job003",
      job: "Backend Developer",
      company: "CodeLabs",
    },
    {
      id: "cand004",
      name: "Aisha Ali",
      jobId: "job004",
      job: "Full Stack Dev",
      company: "WebFusion",
    },
    {
      id: "cand005",
      name: "David Lee",
      jobId: "job005",
      job: "Project Manager",
      company: "AgileWorks",
    },
    {
      id: "cand006",
      name: "Meena S",
      jobId: "job006",
      job: "QA Tester",
      company: "BugCatchers",
    },
    {
      id: "cand007",
      name: "Tom Victor",
      jobId: "job007",
      job: "DevOps Engineer",
      company: "CloudBase",
    },
    {
      id: "cand008",
      name: "Sara N",
      jobId: "job008",
      job: "Data Analyst",
      company: "InsightSoft",
    },
    {
      id: "cand009",
      name: "Naveen R",
      jobId: "job009",
      job: "Mobile App Dev",
      company: "AppLogic",
    },
    {
      id: "cand010",
      name: "Kavi R",
      jobId: "job010",
      job: "Product Designer",
      company: "PixelMint",
    },
    {
      id: "cand011",
      name: "Deepak S",
      jobId: "job011",
      job: "HR Manager",
      company: "HireNow",
    },
  ]);

  const [archivedCandidates, setArchivedCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);

  const [activeSection, setActiveSection] = useState("dashboard");

  //Rec Profile session data

  // const [recruiter, setRecruiter] = useState({
  //   recruiterId: "STTA01",
  //   reportingTo: "Prakash Raj Raja",
  //   designedIn: "HR Department",
  //   joiningDate: "2023-06-15",
  //   email: "recruiter@example.com",
  //   mobile: "+91 9876543210",
  //   profilePic: "/assets/recruiter.jpg",
  // });

  // // Upload Profile Picture
  // const handleProfilePicChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("profilePic", file);

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}/recruiters/upload-profile-pic/${recruiter._id}`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );
  //     setRecruiter((prev) => ({ ...prev, profilePic: res.data.profilePic }));
  //   } catch (error) {
  //     console.error("Error uploading profile pic:", error);
  //   }
  // };

  // // Upload Banner
  // const handleBannerChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("banner", file);

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}/recruiters/upload-banner/${recruiter._id}`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );
  //     setRecruiter((prev) => ({ ...prev, bannerUrl: res.data.bannerUrl }));
  //   } catch (error) {
  //     console.error("Error uploading banner:", error);
  //   }
  // };

  const handleRemovePic = () => {
    setRecruiter({ ...recruiter, profilePic: "" });
  };

  // Upload Profile Picture
  const handleChangePic = async (e) => {
    const file = e.target.files[0];
    if (!file || !recruiter._id) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/recruiters/upload-profile-pic/${recruiter._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setRecruiter({ ...recruiter, profilePic: res.data.profilePic });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    }
  };

  // Upload Banner
  const handleChangeBanner = async (e) => {
    const file = e.target.files[0];
    if (!file || !recruiter._id) return;

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/recruiters/upload-banner/${recruiter._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setRecruiter({ ...recruiter, bannerUrl: res.data.bannerUrl });
    } catch (err) {
      console.error("Error uploading banner:", err);
    }
  };

  const handleRemoveBanner = () => {
    setRecruiter({ ...recruiter, bannerUrl: "" });
  };

  const [confirmId, setConfirmId] = useState(null);

  // Interview Tracker Modal States
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidateName: "",
    position: "",
    client: "",
    interviewDate: "",
    interviewTime: "",
    interviewType: "",
    interviewRound: "",
  });

  const handleInterviewChange = (e) => {
    const { name, value } = e.target;
    setInterviewForm({ ...interviewForm, [name]: value });
  };

  // Add state for interviews and modal
  const [allInterviews, setAllInterviews] = useState([]);
  const [showTodayInterviewsModal, setShowTodayInterviewsModal] =
    useState(false);

  // Backend API base URL
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Helper to get today's date string
  const todayStr = getToday();

  // Filter today's interviews from allInterviews
  const todaysInterviews = allInterviews.filter(
    (i) => i.interviewDate === todayStr
  );

  // Add interview (update backend and re-fetch)
  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      recruiterId: recruiter.recruiterId,
      ...interviewForm,
      interviewFeedback: "", // Add default empty value
      finalStatus: "", // Add default empty value
    };
    try {
      const res = await fetch(`${API_BASE}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInterviewForm({
          candidateName: "",
          position: "",
          client: "",
          interviewDate: "",
          interviewTime: "",
          interviewType: "",
          interviewRound: "",
        });
        setShowInterviewModal(false);
        fetchAllInterviews();
      } else {
        console.error("Failed to add interview:", res.status);
      }
    } catch (err) {
      console.error("Error adding interview:", err);
    }
  };

  // Update interview (PUT and re-fetch)
  const handleEditInterview = async (updated) => {
    try {
      const res = await fetch(`${API_BASE}/api/interviews/${updated._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        // If status is rejected, archive the candidate
        if (updated.finalStatus === "Rejected") {
          try {
            const archivePayload = {
              name: updated.candidateName,
              email: updated.candidateEmail || "noemail@example.com",
              status: updated.finalStatus,
              reason:
                updated.interviewFeedback ||
                "Rejected during interview process",
            };

            const archiveRes = await fetch(`${API_BASE}/api/archived`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(archivePayload),
            });

            if (archiveRes.ok) {
              alert(
                `${updated.candidateName} has been rejected and moved to archived candidates.`
              );
            } else {
              console.error("Failed to archive candidate");
            }
          } catch (archiveErr) {
            console.error("Error archiving candidate:", archiveErr);
          }
        }

        setEditInterview(null);
        fetchAllInterviews();
      }
    } catch (err) {
      console.error("Error updating interview:", err);
    }
  };

  // Remove interview by index
  const removeInterview = (idx) => {
    // This function is no longer needed as interviews are managed by allInterviews
  };

  // ends...

  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    setShowEditProfileModal(recruiter);
  }, [recruiter]);

  const statuses = [
    "Shortlisted",
    "In-Process",
    "Interview Scheduled",
    "Interview On-Going",
    "Final Round",
    "HR Round",
    "Selected",
    "Screened Out",
  ];
  const rejectionReasons = [
    "Skill mismatch",
    "Lack of communication",
    "Inadequate experience",
    "Unprofessional behavior",
    "Other",
  ];

  const visibleCandidates = showAll
    ? activeCandidates
    : activeCandidates.slice(0, 10);

  const handleStatusChange = (cand, value) => {
    if (value === "Screened Out") {
      const confirmReject = window.confirm(
        `Are you sure you want to mark ${cand.name} as ${value}?`
      );
      if (confirmReject) {
        setSelectedCandidate({ ...cand, status: value });
        setShowReasonModal(true);
      }
    } else {
      console.log(`${cand.name} status changed to ${value}`);
    }
  };

  const archiveCandidate = async (candidate, reason) => {
    const payload = {
      name: candidate.name,
      email: candidate.email || "noemail@example.com",
      status: candidate.status,
      reason,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/archived`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert(`${candidate.name} archived successfully.`);
        setActiveCandidates((prev) =>
          prev.filter((c) => c.id !== candidate.id)
        );
      } else {
        alert("Failed to archive.");
      }
    } catch (err) {
      console.error("Archive error:", err);
    }
  };

  // const [activeRequirements, setActiveRequirements] = useState([
  //   {
  //     id: 1,
  //     position: "Full Stack Engineer",
  //     criticality: "Medium",
  //     company: "StartupXYZ",
  //     contactPerson: "David Wilson",
  //     contactPersonEmail: "david@example.com",
  //     talentAdvisor: "Lisa Wang",
  //   },
  //   {
  //     id: 2,
  //     position: "Backend Developer",
  //     criticality: "Low",
  //     company: "DataTech Solutions",
  //     contactPerson: "Tom Anderson",
  //     contactPersonEmail: "tom@example.com",
  //     talentAdvisor: "Lisa Wang",
  //   },
  //   {
  //     id: 3,
  //     position: "Data Scientist",
  //     criticality: "High",
  //     company: "AI Innovations",
  //     contactPerson: "Robert Kim",
  //     contactPersonEmail: "robert@example.com",
  //     talentAdvisor: "Lisa Wang",
  //   },
  //   {
  //     id: 4,
  //     position: "Quality Assurance Engineer",
  //     criticality: "Low",
  //     company: "TestPro Solutions",
  //     contactPerson: "Kevin Brown",
  //     contactPersonEmail: "kevin@example.com",
  //     talentAdvisor: "Lisa Wang",
  //   },
  // ]);

  const [activeRequirements] = useState([
    {
      id: 1,
      position: "Frontend Dev",
      criticality: "High",
      company: "TechCorp",
      contactPerson: "John",
      contactPersonEmail: "john@corp.com",
    },
    {
      id: 2,
      position: "Backend Dev",
      criticality: "Medium",
      company: "SoftInc",
      contactPerson: "Jane",
      contactPersonEmail: "jane@corp.com",
    },
    {
      id: 3,
      position: "Full Stack Dev",
      criticality: "Low",
      company: "WebWorks",
      contactPerson: "Sam",
      contactPersonEmail: "sam@corp.com",
    },
    {
      id: 4,
      position: "UI/UX Designer",
      criticality: "High",
      company: "Designify",
      contactPerson: "Alice",
      contactPersonEmail: "alice@corp.com",
    },
    {
      id: 5,
      position: "Project Manager",
      criticality: "Medium",
      company: "ManageIt",
      contactPerson: "Bob",
      contactPersonEmail: "bob@corp.com",
    },
    {
      id: 6,
      position: "DevOps Engineer",
      criticality: "Low",
      company: "CloudBase",
      contactPerson: "Eve",
      contactPersonEmail: "eve@corp.com",
    },
    {
      id: 7,
      position: "QA Tester",
      criticality: "High",
      company: "BugCatchers",
      contactPerson: "Tom",
      contactPersonEmail: "tom@corp.com",
    },
    {
      id: 8,
      position: "Data Analyst",
      criticality: "Medium",
      company: "InsightSoft",
      contactPerson: "Mia",
      contactPersonEmail: "mia@corp.com",
    },
    {
      id: 9,
      position: "Mobile App Dev",
      criticality: "Low",
      company: "AppLogic",
      contactPerson: "Naveen",
      contactPersonEmail: "naveen@corp.com",
    },
    {
      id: 10,
      position: "Product Designer",
      criticality: "High",
      company: "PixelMint",
      contactPerson: "Kavi",
      contactPersonEmail: "kavi@corp.com",
    },
  ]);

  const requirements = [
    {
      id: 1,
      position: "Frontend Developer",
      criticality: "High",
      company: "TechCorp",
      spoc: "David Wilson",
      spocEmail: "david@techcorp.com",
    },
    {
      id: 2,
      position: "UI/UX Designer",
      criticality: "Medium",
      company: "Designify",
      spoc: "Tom Anderson",
      spocEmail: "tom@designify.com",
    },
    {
      id: 3,
      position: "Backend Developer",
      criticality: "Low",
      company: "CodeLabs",
      spoc: "Robert Kim",
      spocEmail: "robert@codelabs.com",
    },
    {
      id: 4,
      position: "QA Tester",
      criticality: "Medium",
      company: "AppLogic",
      spoc: "Kevin Brown",
      spocEmail: "kevin@applogic.com",
    },
    {
      id: 5,
      position: "Mobile App Developer",
      criticality: "High",
      company: "Tesco",
      spoc: "Mel Gibson",
      spocEmail: "mel@tesco.com",
    },
    {
      id: 6,
      position: "Data Analyst",
      criticality: "Low",
      company: "InsightSoft",
      spoc: "Priya S",
      spocEmail: "priya@insightsoft.com",
    },
    {
      id: 7,
      position: "DevOps Engineer",
      criticality: "High",
      company: "CloudBase",
      spoc: "Arun K",
      spocEmail: "arun@cloudbase.com",
    },
    {
      id: 8,
      position: "Project Manager",
      criticality: "Medium",
      company: "AgileWorks",
      spoc: "John P",
      spocEmail: "john@agileworks.com",
    },
    {
      id: 9,
      position: "HR Manager",
      criticality: "Low",
      company: "HireNow",
      spoc: "Deepak S",
      spocEmail: "deepak@hirenow.com",
    },
    {
      id: 10,
      position: "Product Designer",
      criticality: "High",
      company: "PixelMint",
      spoc: "Sara N",
      spocEmail: "sara@pixelmint.com",
    },
  ];

  const renderCriticality = (level) => {
    const styles = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-blue-100 text-blue-700",
      Low: "bg-gray-200 text-gray-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[level] || ""
        }`}
      >
        {level.toUpperCase()}
      </span>
    );
  };

  const [archivedRequirements, setArchivedRequirements] = useState([]);
  const [requirementCounts, setRequirementCounts] = useState({}); // { [reqId]: { [date]: count } }
  const [openCalendarId, setOpenCalendarId] = useState(null); // reqId of open calendar
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [inputCount, setInputCount] = useState("");
  const [calendarStep, setCalendarStep] = useState("calendar"); // 'calendar' or 'input'

  // Helper to get count for a requirement/date
  const getCountForReq = (reqId, date) => {
    return requirementCounts[reqId]?.[date] || "-";
  };

  // Helper to get the most recent count for a requirement
  const getMostRecentCountForReq = (reqId) => {
    const counts = requirementCounts[reqId];
    if (!counts) return 0;
    const dates = Object.keys(counts);
    if (dates.length === 0) return 0;
    // Sort dates descending (latest first)
    dates.sort((a, b) => b.localeCompare(a));
    return parseInt(counts[dates[0]]) || 0;
  };

  // Helper to get the most recent date with a count for a requirement
  const getMostRecentDateForReq = (reqId) => {
    const counts = requirementCounts[reqId];
    if (!counts) return null;
    const dates = Object.keys(counts);
    if (dates.length === 0) return null;
    // Sort dates descending (latest first)
    dates.sort((a, b) => b.localeCompare(a));
    return dates[0];
  };

  // Helper to get total count for a requirement
  const getTotalCountForReq = (reqId) => {
    const counts = requirementCounts[reqId];
    if (!counts) return 0;
    return Object.values(counts).reduce(
      (sum, count) => sum + (parseInt(count) || 0),
      0
    );
  };

  // Simple calendar for current month
  const Calendar = ({ onDateClick, selected }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const weeks = [];
    let day = 1 - startDay;
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++, day++) {
        if (day < 1 || day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
        }
      }
      weeks.push(week);
    }
    return (
      <div className="bg-white dark:bg-gray-800 border rounded shadow p-4">
        <div className="text-center font-semibold mb-2 dark:text-gray-200">
          {today.toLocaleString("default", { month: "long" })} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center font-bold dark:text-gray-200">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {week.map((d, j) => {
              if (!d) return <div key={j}></div>;
              const dateStr = `${year}-${String(month + 1).padStart(
                2,
                "0"
              )}-${String(d).padStart(2, "0")}`;
              const isSelected = selected === dateStr;
              return (
                <button
                  key={j}
                  className={`w-7 h-7 rounded-full text-center ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-100 dark:hover:bg-blue-700 dark:text-gray-200"
                  } ${dateStr === getToday() ? "border border-blue-400" : ""}`}
                  onClick={() => onDateClick(dateStr)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const handleSubmitReason = () => {
    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    const updatedCandidate = {
      ...selectedCandidate,
      status: selectedCandidate.status,
    };

    archiveCandidate(updatedCandidate, reason);
    setShowReasonModal(false);
    setReason("");
    setDesc("");
    setSelectedCandidate(null);
  };

  const recentActivities = [
    "Job 'Frontend Developer' posted 2 days ago",
    "Interview scheduled with John Doe",
    "Candidate Jane Smith applied for Backend Developer",
    "Offer sent to Michael Lee",
    "Profile updated successfully",
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleOpenAddInterview = () => {
    setInterviewForm((form) => ({
      ...form,
      interviewDate: getToday(),
    }));
    setShowInterviewModal(true);
  };

  const [editInterview, setEditInterview] = useState(null);

  // Fetch all interviews for recruiter
  const fetchAllInterviews = () => {
    if (recruiter.recruiterId) {
      fetch(`${API_BASE}/api/interviews?recruiterId=${recruiter.recruiterId}`)
        .then((res) => res.json())
        .then((data) => setAllInterviews(data))
        .catch(() => setAllInterviews([]));
    }
  };

  useEffect(() => {
    fetchAllInterviews();
    // eslint-disable-next-line
  }, [recruiter.recruiterId]);

  // Helper to count pending cases
  const pendingCasesCount = allInterviews.filter(
    (i) => i.finalStatus !== "Joined/Closure" && i.finalStatus !== "Rejected"
  ).length;

  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionLevel, setContributionLevel] = useState("85%"); // placeholder
  const [teamLeaderMsg, setTeamLeaderMsg] = useState(
    "Great job on your recent closures!"
  ); // placeholder
  const [adminMsg, setAdminMsg] = useState("Keep up the good work."); // placeholder
  const [closures, setClosures] = useState([
    { name: "Adhitya – Tracx", date: "2024-06-01" },
    { name: "Ravi Kumar – CodeLabs", date: "2024-05-15" },
    { name: "Priya M – WebFusion", date: "2024-04-20" },
  ]);

  const lastClosure = closures.length > 0 ? closures[0] : null;

  const perdata = [
    {
      candidate: "Aarav",
      position: "Frontend Developer",
      client: "TechCorp",
      offeredOn: "06-06-2025",
      joinedOn: "06-06-2025",
      quarter: "FMA",
      closureValue: "1,52,500",
      incentive: "3000",
    },
    {
      candidate: "Arjun",
      position: "UI/UX Designer",
      client: "Designify",
      offeredOn: "08-06-2025",
      joinedOn: "08-06-2025",
      quarter: "MJJ",
      closureValue: "4,50,000",
      incentive: "6000",
    },
    {
      candidate: "Shaurya",
      position: "Backend Developer",
      client: "CodeLabs",
      offeredOn: "20-06-2025",
      joinedOn: "20-06-2025",
      quarter: "ASO",
      closureValue: "3,50,000",
      incentive: "3000",
    },
    {
      candidate: "Vihaan",
      position: "QA Tester",
      client: "AppLogic",
      offeredOn: "01-07-2025",
      joinedOn: "01-07-2025",
      quarter: "NDJ",
      closureValue: "2,00,000",
      incentive: "3000",
    },
    {
      candidate: "Aditya",
      position: "Mobile App Developer",
      client: "Bug Catchers",
      offeredOn: "23-07-2025",
      joinedOn: "23-07-2025",
      quarter: "NDJ",
      closureValue: "1,75,000",
      incentive: "3000",
    },
  ];

  const sampleJobs = [
    {
      id: 1,
      company: "Google Technologies Inc.",
      role: "Cloud Engineer",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      brand: "Google",
      location: "Bengaluru",
      salary: "25 LPA",
      type: "Permanent",
      mode: "Work from office",
      experience: "8 Years",
      openings: 2,
      category: "B2B",
      nature: "Full Time",
      stack: ["CI/CD", "Docker", "Azure"],
      posted: "3 days ago",
      hot: true,
    },
    {
      id: 2,
      company: "Google Technologies Inc.",
      role: "Frontend Developer",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      brand: "Microsoft",
      location: "Bengaluru",
      salary: "25 LPA",
      type: "Permanent",
      mode: "Work from office",
      experience: "8 Years",
      openings: 2,
      category: "C2C",
      nature: "Part Time",
      stack: ["CI/CD", "Docker", "Azure"],
      posted: "3 days ago",
      hot: true,
    },
    // Add more jobs if needed
  ];

  const [showHotJobs, setShowHotJobs] = useState(true);

  const filteredJobs = showHotJobs
    ? sampleJobs.filter(job => job.hot)
    : sampleJobs;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-gray-300 fixed top-0 left-0 h-full flex flex-col py-8 px-6">
        <nav className="flex flex-col text-lg gap-6">
          <button
            className={`text-left hover:text-white ${
              activeSection === "dashboard" ? "font-bold text-white" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`text-left hover:text-white ${
              activeSection === "jobBoard" ? "font-bold text-white" : ""
            }`}
            onClick={() => setActiveSection("jobBoard")}
          >
            Job Board
          </button>
          <button
            className={`text-left hover:text-white ${
              activeSection === "settings" ? "font-bold text-white" : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="text-left hover:bg-red-600 text-white bg-red-500 rounded-md px-4 py-2"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {activeSection === "dashboard" && (
          <div>
            <div className="w-full">
              {/* Top Row */}
              {/* Banner Section */}
              <div className="relative w-full">
                {/* Banner Image */}
                <div className="relative group">
                  <img
                    src={
                      recruiter?.bannerUrl
                        ? `${API_BASE}${recruiter.bannerUrl}`
                        : "/default-banner.jpg"
                    }
                    alt="Banner"
                    className="w-full h-48 object-cover"
                  />
                  {/* Hover options for banner */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <label className="bg-white text-sm px-3 py-1 rounded cursor-pointer mr-2">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChangeBanner}
                      />
                    </label>
                    {recruiter.bannerUrl && (
                      <button
                        className="bg-red-500 text-white text-sm px-3 py-1 rounded"
                        onClick={handleRemoveBanner}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-70px] group">
                  <img
                    src={
                      recruiter?.profilePic
                        ? `${API_BASE}${recruiter.profilePic}`
                        : "/default-profile.jpg"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white"
                  />
                  {/* Hover options for profile */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition">
                    <label className="bg-white text-xs px-2 py-1 rounded cursor-pointer mr-1">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChangePic}
                      />
                    </label>
                    {recruiter.profilePic && (
                      <button
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemovePic}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row: Contribution, LinkedIn, Edit */}
              <div className="flex justify-between items-center mt-5 px-6">
                <p className="font-semibold text-gray-700">
                  Total Contribution <br />
                  <span className="text-xl">
                    ₹{recruiter.totalContribution || "0"}
                  </span>
                </p>

                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setDarkMode(!darkMode)}
                    className="cursor-pointer p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Toggle dark mode"
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-800" />
                    )}
                  </div>
                  <a
                    href={recruiter.linkedinUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-700"
                  >
                    <FaLinkedin className="w-5 h-5 text-white" />
                  </a>

                  <button
                    onClick={() => {
                      setEditData(recruiter); // Copy recruiter details into editData
                      setShowEditProfileModal(true);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* {showEditProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg relative">
                    <button
                      onClick={() => setShowEditProfileModal(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
                    >
                      ×
                    </button>

                    <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
                      Edit Profile
                    </h2>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await axios.put(
                            `${API_BASE}/recruiter/profile`,
                            editData
                          );
                          setRecruiter(editData); // Update dashboard instantly
                          setShowEditProfileModal(false);
                        } catch (error) {
                          console.error("Error updating profile:", error);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={editData.designation || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              designation: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          Mobile
                        </label>
                        <input
                          type="text"
                          value={editData.mobile || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, mobile: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editData.email || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          Reporting To
                        </label>
                        <input
                          type="text"
                          value={editData.reportingTo || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              reportingTo: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                          LinkedIn URL
                        </label>
                        <input
                          type="text"
                          value={editData.linkedinUrl || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              linkedinUrl: e.target.value,
                            })
                          }
                          className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowEditProfileModal(false)}
                          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )} */}

              {/* Recruiter Info */}
              <div className="text-center mt-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {recruiter.name}
                </h2>
                <p className="text-gray-600 font-bold">
                  Talent Advisor{" "}
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {recruiter.recruiterId}
                  </span>
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  📞 {recruiter.mobile} &nbsp; ✉️ {recruiter.email}
                </p>
                <p className="text-gray-400 text-sm">
                  Joining Date:{" "}
                  {new Date(recruiter.joiningDate).toLocaleDateString("en-IN")}
                </p>
                <p className="text-gray-400 text-sm">
                  Reporting to: {recruiter.reportingTo}
                </p>
              </div>

              {/*new tabbed sessions*/}

              <div className="flex border-b mt-5">
                {["updates", "requirements", "pipeline", "performance"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium ${
                        activeTab === tab
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                )}
              </div>

              {/*tabbed session codes here seperately*/}
              <div className="mt-6">
                {activeTab === "updates" && (
                  <div className="mx-5 mb-3 dark:text-gray-200">
                    <div className="flex justify-between items-center mx-5 mb-3 dark:text-gray-200">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Updates</h2>
                      </div>
                      <div>
                        <button
                          onClick={() => navigate("/recruiter/add-job")}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-5 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                          Post Jobs
                        </button>
                        <button
                          onClick={handleUploadClick}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mr-5 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                          Upload Resume
                        </button>

                        <button
                          onClick={() => navigate("/source-resume")}
                          className=" bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition dark:bg-blue-600 dark:hover:bg-blue-700  "
                        >
                          Source Resume
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 mb-6">
                      {/* Top Row - 3 Summary Boxes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Active Jobs */}
                        <div
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer p-5 flex flex-col items-center text-center dark:bg-gray-800 dark:border dark:border-gray-700"
                          onClick={() => navigate(summaryCards[0]?.path)}
                        >
                          {/* Icon & Title */}
                          <div className="flex flex-col items-center">
                            <div className="text-blue-800 text-xl mb-1">
                              {summaryCards[0]?.icon}
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {summaryCards[0]?.title}
                            </h3>
                          </div>

                          {/* Main Count */}
                          <p className="text-4xl font-bold text-black mt-2 dark:text-white">
                            {summaryCards[0]?.count}
                          </p>

                          {/* Subtitle in Highlighted Bar */}
                          <div className="mt-3 bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2">
                            <span className="text-red-600">
                              {/* Small icon if needed */}
                            </span>
                            {summaryCards[0]?.subtitle}
                          </div>
                        </div>

                        {/* Second Summary Card */}
                        <div
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer p-5 flex flex-col items-center text-center dark:bg-gray-800 dark:border dark:border-gray-700"
                          onClick={() => navigate(summaryCards[1]?.path)}
                        >
                          {/* Icon & Title */}
                          <div className="flex flex-col items-center">
                            <div className="text-blue-800 text-xl mb-1">
                              {summaryCards[1]?.icon}
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {summaryCards[1]?.title}
                            </h3>
                          </div>

                          {/* Main Count */}
                          <p className="text-4xl font-bold text-black mt-2 dark:text-white">
                            {summaryCards[1]?.count}
                          </p>

                          {/* Subtitle in Highlighted Bar */}
                          <div className="mt-3 bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2">
                            {summaryCards[1]?.subtitle}
                          </div>
                        </div>

                        {/* Interview Tracker */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 dark:bg-gray-800 dark:border dark:border-gray-700">
                          {/* Title */}
                          <h3 className="text-lg font-semibold text-center text-blue-900 mb-4 dark:text-gray-200">
                            Interview Tracker
                          </h3>

                          {/* Two sections side by side */}
                          <div className="flex items-center justify-between">
                            {/* Today's Schedule */}
                            <div className="flex-1 flex flex-col items-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Today's Schedule
                              </p>
                              <p className="text-3xl font-bold text-black dark:text-white mt-1">
                                {todaysInterviews.length}
                              </p>
                              <button
                                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                onClick={handleOpenAddInterview}
                              >
                                Add
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="border-l h-16 mx-4"></div>

                            {/* Pending Cases */}
                            <div className="flex-1 flex flex-col items-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Pending cases
                              </p>
                              <p className="text-3xl font-bold text-black dark:text-white mt-1">
                                {pendingCasesCount}
                              </p>
                              <button
                                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                onClick={() => setShowTrackerModal(true)}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {showInterviewModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 dark:bg-gray-800">
                            <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
                              Add Interview
                            </h2>
                            <form
                              onSubmit={handleInterviewSubmit}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <input
                                name="candidateName"
                                value={interviewForm.candidateName}
                                onChange={handleInterviewChange}
                                placeholder="Candidate Name"
                                className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                              />
                              <input
                                name="position"
                                value={interviewForm.position}
                                onChange={handleInterviewChange}
                                placeholder="Position"
                                className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                              />
                              <input
                                name="client"
                                value={interviewForm.client}
                                onChange={handleInterviewChange}
                                placeholder="Client"
                                className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                              />
                              <div className="flex gap-2">
                                <input
                                  type="date"
                                  name="interviewDate"
                                  value={interviewForm.interviewDate}
                                  onChange={handleInterviewChange}
                                  className="border p-2 rounded w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                  required
                                />
                                <input
                                  type="time"
                                  name="interviewTime"
                                  value={interviewForm.interviewTime}
                                  onChange={handleInterviewChange}
                                  className="border p-2 rounded w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                  required
                                />
                              </div>

                              <select
                                name="interviewType"
                                value={interviewForm.interviewType}
                                onChange={handleInterviewChange}
                                className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                              >
                                <option value="">Interview Type</option>
                                <option>Telephonic</option>
                                <option>Face 2 Face</option>
                                <option>Video Conference</option>
                                <option>Assignment</option>
                              </select>

                              <select
                                name="interviewRound"
                                value={interviewForm.interviewRound}
                                onChange={handleInterviewChange}
                                className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                required
                              >
                                <option value="">Interview Round</option>
                                <option>Intro</option>
                                <option>Assignment</option>
                                <option>L1</option>
                                <option>L2</option>
                                <option>L3</option>
                                <option>L4</option>
                                <option>L5</option>
                                <option>L6</option>
                                <option>L7</option>
                                <option>HR Round</option>
                                <option>Final Round</option>
                                <option>Offer Discussion</option>
                                <option>Additional Discussion</option>
                              </select>

                              <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button
                                  type="button"
                                  onClick={() => setShowInterviewModal(false)}
                                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                >
                                  Submit
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Candidate Status */}
                      <div className="flex flex-col lg:flex-row gap-4 my-5 w-full">
                        {/* Left Column */}
                        <div className="w-full bg-white rounded-2xl shadow p-4 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
                          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
                            Applicant Overview
                          </h2>
                          <div className="overflow-x-auto">
                            {/* Table */}
                            <div className="overflow-x-auto">
                              <table className="min-w-full table-auto border-collapse">
                                <thead>
                                  <tr className="text-left bg-gray-100 dark:bg-gray-700">
                                    <th className="p-3 dark:text-gray-200">
                                      Applied on
                                    </th>
                                    <th className="p-3 dark:text-gray-200">
                                      Candidate Name
                                    </th>
                                    <th className="p-3 dark:text-gray-200">
                                      Company
                                    </th>
                                    <th className="p-3 dark:text-gray-200">
                                      Role Applied
                                    </th>
                                    <th className="p-3 dark:text-gray-200">
                                      Submission
                                    </th>
                                    <th className="p-3 dark:text-gray-200">
                                      Current Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeCandidates
                                    .slice(0, visibleCount)
                                    .map((cand, index) => (
                                      <tr
                                        key={cand.id}
                                        className="border-b hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                      >
                                        <td className="p-3 dark:text-gray-200">
                                          {`0${index + 1}-08-2025`}
                                        </td>
                                        <td
                                          className="p-3 font-medium text-blue-600 cursor-pointer hover:underline dark:text-blue-400"
                                          onClick={() =>
                                            navigate(
                                              `/recruiter/candidate/${cand.id}`
                                            )
                                          }
                                        >
                                          {cand.name}
                                        </td>
                                        <td className="p-3 dark:text-gray-200">
                                          {cand.company}
                                        </td>
                                        <td
                                          className="p-3 cursor-pointer hover:underline dark:text-gray-200"
                                          onClick={() =>
                                            navigate(
                                              `/recruiter/job/${cand.jobId}`
                                            )
                                          }
                                        >
                                          {cand.job}
                                        </td>
                                        <td className="p-3">
                                          <span
                                            className={`px-3 py-1 rounded-full text-white text-sm ${
                                              index % 2 === 0
                                                ? "bg-green-500"
                                                : "bg-blue-500"
                                            }`}
                                          >
                                            {index % 2 === 0
                                              ? "Inbound"
                                              : "Uploaded"}
                                          </span>
                                        </td>
                                        <td className="p-3">
                                          <select
                                            className="border px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                            defaultValue="In-Process"
                                            onChange={(e) =>
                                              handleStatusChange(
                                                cand,
                                                e.target.value
                                              )
                                            }
                                          >
                                            {statuses.map((status) => (
                                              <option
                                                key={status}
                                                value={status}
                                              >
                                                {status}
                                              </option>
                                            ))}
                                          </select>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>

                            {/* View More / View Less Buttons */}
                            <div className="flex justify-end gap-3 mt-4">
                              {visibleCount > 5 && (
                                <button
                                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                  onClick={() =>
                                    setVisibleCount(visibleCount - 5)
                                  }
                                >
                                  View Less
                                </button>
                              )}
                              {visibleCount < activeCandidates.length && (
                                <button
                                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                  onClick={() =>
                                    setVisibleCount(visibleCount + 5)
                                  }
                                >
                                  View More
                                </button>
                              )}
                            </div>

                            {showReasonModal && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
                                  <h3 className="text-lg font-semibold mb-4 text-center dark:text-gray-200">
                                    Reason for Screening Out
                                  </h3>

                                  <div className="mb-4">
                                    <label className="block mb-1 font-medium">
                                      Select Reason
                                    </label>
                                    <select
                                      className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                      value={reason}
                                      onChange={(e) =>
                                        setReason(e.target.value)
                                      }
                                    >
                                      <option value="">
                                        -- Choose a reason --
                                      </option>
                                      {rejectionReasons.map((r) => (
                                        <option key={r} value={r}>
                                          {r}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="mb-4">
                                    <label className="block mb-1 font-medium">
                                      Optional Description
                                    </label>
                                    <textarea
                                      rows="3"
                                      className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                      value={desc}
                                      onChange={(e) => setDesc(e.target.value)}
                                      placeholder="Write more details (optional)..."
                                    ></textarea>
                                  </div>

                                  <div className="flex justify-between">
                                    <button
                                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                      onClick={() => setShowReasonModal(false)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                      onClick={handleSubmitReason}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "requirements" && (
                  <div className="mx-5 mb-3 dark:text-gray-200">
                    {/* Requirements Section */}
                    {/* Boxes Section */}
                    <h2 className="text-2xl font-semibold mb-6 dark:text-gray-200">
                      Requirements
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-10">
                      {[
                        { title: "Total Requirements", count: 10 },
                        { title: "High Priority", count: 5 },
                        { title: "Robust Requirements", count: 4 },
                        { title: "Idle Requirements", count: 2 },
                        { title: "Delivery Pending", count: 3 },
                        { title: "Easy Requirements", count: 2 },
                      ].map((box, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 flex flex-col justify-between h-24 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            {box.title}
                          </h3>
                          <p className="text-5xl font-bold text-blue-700 self-end mr-7">
                            {box.count}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row - Requirements + Contributions */}
                    {/* grid grid-cols-1 md:grid-cols-2 */}
                    <div className=" gap-6">
                      {/* Requirements Section */}
                      {/* Deliverables Table */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">
                          Deliverables
                        </h2>

                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto border-collapse">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                                <th className="p-3 dark:text-gray-200">
                                  Positions
                                </th>
                                <th className="p-3 dark:text-gray-200">
                                  Criticality
                                </th>
                                <th className="p-3 dark:text-gray-200">
                                  Company
                                </th>
                                <th className="p-3 dark:text-gray-200">SPOC</th>
                                <th className="p-3 dark:text-gray-200">
                                  SPOC Email
                                </th>
                                <th className="p-3 dark:text-gray-200">
                                  Count
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeRequirements
                                .slice(0, visibleCount)
                                .map((req) => (
                                  <tr
                                    key={req.id}
                                    className="border-b hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                  >
                                    <td className="p-3 text-blue-600 font-medium dark:text-blue-400">
                                      {req.position}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          req.criticality === "High"
                                            ? "bg-red-100 text-red-700"
                                            : req.criticality === "Medium"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-200 text-gray-700"
                                        }`}
                                      >
                                        {req.criticality}
                                      </span>
                                    </td>
                                    <td className="p-3 dark:text-gray-200">
                                      {req.company}
                                    </td>
                                    <td className="p-3 dark:text-gray-200">
                                      {req.contactPerson}
                                    </td>
                                    <td className="p-3 dark:text-gray-200">
                                      {req.contactPersonEmail}
                                    </td>
                                    <td className="p-3">
                                      <button
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick={() => {
                                          setOpenCalendarId(req.id);
                                          const mostRecentDate =
                                            getMostRecentDateForReq(req.id);
                                          setSelectedDate(
                                            mostRecentDate || getToday()
                                          );
                                          setInputCount("");
                                          setCalendarStep("calendar");
                                          setShowModal(true); // <-- Opens your modal
                                        }}
                                      >
                                        {getTotalCountForReq(req.id) === 0
                                          ? "Set"
                                          : getTotalCountForReq(req.id)}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        {/* View More / View Less */}
                        {/* Buttons Section */}
                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-4">
                          {visibleCount < requirements.length ? (
                            <button
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                              onClick={() => setVisibleCount(visibleCount + 5)}
                            >
                              View More
                            </button>
                          ) : (
                            visibleCount > 5 && (
                              <button
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                                onClick={() => setVisibleCount(5)}
                              >
                                View Less
                              </button>
                            )
                          )}
                          <button
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            onClick={() => navigate("/requirements-archive")}
                          >
                            Req-Archives
                          </button>
                        </div>
                      </div>

                      {/* Overall Contributions with shaded blocks */}
                    </div>

                    {/* {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-4xl w-full min-h-[80vh] overflow-y-auto dark:bg-gray-800">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-gray-200">
                              Your Requirements
                            </h2>
                            <button
                              onClick={() => setShowModal(false)}
                              className="text-red-500 font-bold text-lg dark:text-red-500"
                            >
                              X
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mb-2 dark:text-gray-400">
                            Read-only view of requirements assigned to you for
                            recruitment
                          </p>
                          <table className="min-w-full text-sm text-left border">
                            <thead className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                              <tr>
                                <th className="p-2 border dark:text-gray-200">
                                  Position
                                </th>
                                <th className="p-2 border dark:text-gray-200">
                                  Criticality
                                </th>
                                <th className="p-2 border dark:text-gray-200">
                                  Company
                                </th>
                                <th className="p-2 border dark:text-gray-200">
                                  SPOC
                                </th>
                                <th className="p-2 border dark:text-gray-200">
                                  SPOC Email
                                </th>
                                <th className="p-2 border dark:text-gray-200">
                                  Count
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeRequirements.map((req) => (
                                <tr
                                  key={req.id}
                                  className="border dark:border-gray-600"
                                >
                                  <td className="p-2 text-blue-600 font-medium dark:text-blue-400">
                                    {req.position}
                                  </td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs dark:text-gray-200 ${
                                        req.criticality === "High"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                                          : req.criticality === "Medium"
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                      }`}
                                    >
                                      {req.criticality}
                                    </span>
                                  </td>
                                  <td className="p-2 dark:text-gray-200">
                                    {req.company}
                                  </td>
                                  <td className="p-2 dark:text-gray-200">
                                    {req.contactPerson}
                                  </td>
                                  <td className="p-2 dark:text-gray-200">
                                    {req.contactPersonEmail}
                                  </td>
                                  <td className="p-2">
                                    <button
                                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                      onClick={() => {
                                        setOpenCalendarId(req.id);
                                        const mostRecentDate =
                                          getMostRecentDateForReq(req.id);
                                        setSelectedDate(
                                          mostRecentDate || getToday()
                                        );
                                        setInputCount("");
                                        setCalendarStep("calendar");
                                      }}
                                    >
                                      {getTotalCountForReq(req.id) === 0
                                        ? "Set"
                                        : getTotalCountForReq(req.id)}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )} */}

                    {openCalendarId && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                        <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl p-8 relative w-full max-w-md flex flex-col items-center">
                          <button
                            className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                            onClick={() => {
                              setOpenCalendarId(null);
                              setCalendarStep("calendar");
                            }}
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <div className="w-full flex flex-col items-center">
                            <div className="mb-6 text-xl font-bold text-center dark:text-gray-100">
                              Select a Date for Count
                            </div>
                            {calendarStep === "calendar" ? (
                              <>
                                <div className="mb-4 w-full flex justify-center">
                                  <Calendar
                                    selected={selectedDate}
                                    onDateClick={(dateStr) => {
                                      setSelectedDate(dateStr);
                                      setInputCount("");
                                      setCalendarStep("input");
                                    }}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="mb-4 text-lg font-semibold dark:text-gray-200">
                                  Set Count for {selectedDate}
                                </div>
                                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                  Current count for this date:{" "}
                                  {requirementCounts[openCalendarId]?.[
                                    selectedDate
                                  ] || 0}
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  className="border px-3 py-2 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 mb-4"
                                  value={inputCount}
                                  onChange={(e) =>
                                    setInputCount(e.target.value)
                                  }
                                  placeholder="Add to count"
                                  autoFocus
                                />
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                  This will be added to the existing count for
                                  this date.
                                </div>
                                <div className="flex gap-4 mt-2 w-full justify-center">
                                  <button
                                    className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500 text-sm font-semibold"
                                    onClick={() => setCalendarStep("calendar")}
                                  >
                                    Back
                                  </button>
                                  <button
                                    className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 text-sm font-semibold"
                                    onClick={() => {
                                      const currentCount = parseInt(
                                        requirementCounts[openCalendarId]?.[
                                          selectedDate
                                        ] || 0
                                      );
                                      const newCount =
                                        parseInt(inputCount) || 0;
                                      const totalCount =
                                        currentCount + newCount;

                                      setRequirementCounts((prev) => ({
                                        ...prev,
                                        [openCalendarId]: {
                                          ...(prev[openCalendarId] || {}),
                                          [selectedDate]: totalCount.toString(),
                                        },
                                      }));
                                      setOpenCalendarId(null);
                                      setCalendarStep("calendar");
                                    }}
                                  >
                                    Save
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "pipeline" && (
                  <div>
                    {/* Resume/Pipeline Section */}
                    {/* <h2 className="text-xl font-semibold mb-4">Pipeline</h2> */}
                    {/* Right Column Buttons for small screens */}
                    <div className="block lg:hidden mt-6 flex flex-col gap-3">
                      <button
                        className="w-full py-3 bg-green-600 text-white text-lg rounded-xl shadow hover:bg-green-700"
                        onClick={() => navigate("/funnel")}
                      >
                        Pipeline
                      </button>
                      <button
                        className="w-full py-3 bg-yellow-500 text-white text-lg rounded-xl shadow hover:bg-yellow-400"
                        onClick={() => navigate("/archived-candidates")}
                      >
                        Archived
                      </button>
                    </div>
                    {/* Right Column Buttons for large screens */}
                    {/* <div className="hidden lg:flex lg:w-[25%] flex-col gap-4">
                      <button
                        className="w-full py-3 bg-green-600 text-white text-lg rounded-xl shadow hover:bg-green-700"
                        onClick={() => navigate("/funnel")}
                      >
                        Pipeline
                      </button>
                      <button
                        className="w-full py-3 bg-yellow-500 text-white text-lg rounded-xl shadow hover:bg-yellow-400"
                        onClick={() => navigate("/archived-candidates")}
                      >
                        Archived
                      </button>
                    </div> */}

                    <div className="grid grid-cols-4 gap-4 p-4">
                      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer">
                        <div className="text-gray-500">Resume processed</div>
                        <div className="text-4xl font-bold">20</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer">
                        <div className="text-gray-500">Recruitment worked</div>
                        <div className="text-4xl font-bold">12</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer">
                        <div className="text-gray-500">Feedback pending</div>
                        <div className="text-4xl font-bold">8</div>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer">
                        <div className="text-gray-500">Assignment cleared</div>
                        <div className="text-4xl font-bold">10</div>
                      </div>
                    </div>

                    {/* Pipeline shells */}

                    <div className="p-4 text-white">
                      <div className="grid grid-cols-7 gap-4 text-center font-semibold mb-4 text-blue-600 bg-white p-2">
                        <div>Level 1</div>
                        <div>Level 2</div>
                        <div>Level 3</div>
                        <div>Final Round</div>
                        <div>HR Round</div>
                        <div>Offer Stage</div>
                        <div>Closure</div>
                      </div>

                      <div className="grid grid-cols-7 gap-4">
                        {/* Keerthana */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-green-100 text-green-800 rounded shadow-lg">
                          Keerthana
                        </div>
                        <div className="p-2 bg-green-100 text-green-800 rounded shadow-lg">
                          Keerthana
                        </div>

                        {/* Vishnu Purana */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-green-100 text-green-800 rounded shadow-lg">
                          Vishnu
                        </div>
                        <div className="p-2 bg-green-100 text-green-800 rounded shadow-lg">
                          Vishnu
                        </div>

                        {/* Chanakya */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Chanakya
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Chanakya
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Chanakya
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm">
                          Chanakya
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm">
                          Chanakya
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>

                        {/* Adhya */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Adhya
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Adhya
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Adhya
                        </div>
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded shadow-sm">
                          Adhya
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>

                        {/* Vanshika */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Vanshika
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Vanshika
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Vanshika
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>

                        {/* Reyansh */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Reyansh
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Reyansh
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>

                        {/* Shaurya */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Shaurya
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>

                        {/* Vihana */}
                        <div className="p-2 bg-blue-100 text-blue-800 rounded shadow-sm">
                          Vihana
                        </div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                        <div className="p-2"></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "performance" && (
                  <div>
                    <div className="p-8 font-sans">
                      {/* Summary Cards Section - Keeping the original clean design */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center text-center hover:shadow-xl cursor-pointer">
                          <div className="text-lg font-semibold text-blue-700 mb-1">
                            Tenure
                          </div>
                          <div className="text-3xl font-bold text-gray-800">
                            4
                          </div>
                          <div className="text-red-500 text-lg font-medium">
                            Quarters
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center text-center hover:shadow-xl cursor-pointer">
                          <div className="text-lg font-semibold text-blue-700 mb-1">
                            Total Closures
                          </div>
                          <div className="text-3xl font-bold text-gray-800 mt-2">
                            12
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center text-center hover:shadow-xl cursor-pointer">
                          <div className="text-lg font-semibold text-blue-700 mb-1">
                            Recent Closure
                          </div>
                          <div className="text-lg font-bold text-gray-500">
                            Adhitya
                          </div>
                          <div className="text-red-500 text-lg font-medium">
                            Tracx
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center text-center hover:shadow-xl cursor-pointer">
                          <div className="text-lg font-semibold text-blue-700 mb-1">
                            Last Closure
                          </div>
                          <div className="text-lg font-bold text-gray-500 mt-3">
                            1 Month 15 Days
                          </div>
                        </div>
                      </div>

                      {/* Data Table Section - Improved design with zebra-striping */}
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        {/* Table Header with Filter Icon */}
                        <div className="relative mb-4">
                          {/* Filter icon row */}
                          <div className="flex justify-end mb-3 mr-2">
                            <Funnel
                              size={24}
                              className="text-blue-500 cursor-pointer"
                            />
                          </div>

                          {/* Header grid row */}
                          <div className="grid grid-cols-8 gap-2 text-gray-600 font-bold text-sm w-full bg-gray-100 p-2 rounded-t-lg">
                            <div className="col-span-1">Candidate</div>
                            <div className="col-span-1">Position</div>
                            <div className="col-span-1">Client</div>
                            <div className="col-span-1">Offered On</div>
                            <div className="col-span-1">Joined On</div>
                            <div className="col-span-1">Quarter</div>
                            <div className="col-span-1">Closure Value</div>
                            <div className="col-span-1">Incentive</div>
                          </div>
                        </div>

                        {/* Table Rows */}
                        {perdata.map((row, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-8 gap-2 text-sm items-center py-2 border-b border-gray-200 ${
                              index % 2 === 1 ? "bg-gray-50" : ""
                            } last:border-b-0`}
                          >
                            <div className="col-span-1 text-gray-800 font-medium">
                              {row.candidate}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.position}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.client}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.offeredOn}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.joinedOn}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.quarter}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.closureValue}
                            </div>
                            <div className="col-span-1 text-gray-600">
                              {row.incentive}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Section */}
                    <h2 className="text-xl mx-5 font-semibold mb-4">
                      Recent Activity
                    </h2>
                    <div className="w-[60%] bg-white p-6 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Overall Contribution
                      </h3>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center bg-gray-100 px-4 py-4 rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tenure
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            4 Quarters
                          </p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-100 px-4 py-4 rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Closures
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            3
                          </p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-100 px-4 py-4 rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Recent Closure
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            Adhitya – Tracx
                          </p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-100 px-4 py-4 rounded shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last Closure
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            1M 15 Days
                          </p>
                        </div>
                      </div>

                      <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        onClick={() => setShowContributionModal(true)}
                      >
                        View Contribution
                      </button>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white p-6 rounded-lg shadow max-w-full mx-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        {/* <button className="text-blue-600 hover:underline flex items-center gap-1">
              <FaEdit /> Edit Profile
            </button> */}
                      </div>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
                        {recentActivities.map((item, idx) => (
                          <li key={idx} className="mb-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Recruiter Dashboard Layout Fixed */}

              {/* {confirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Do you want to mark this requirement as completed?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-3 py-1 text-gray-700 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => archiveRequirement(confirmId)}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )} */}

              {showTodayInterviewsModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
                    <button
                      className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => setShowTodayInterviewsModal(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="mb-6 text-xl font-bold text-center dark:text-gray-100">
                      Today's Interviews
                    </div>
                    {todaysInterviews.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-300">
                        No interviews scheduled for today.
                      </div>
                    ) : (
                      <table className="min-w-full text-sm text-left border mb-4">
                        <thead className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <tr>
                            <th className="p-2 border dark:text-gray-200">
                              Candidate
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Position
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Client
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Time
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Type
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {todaysInterviews.map((i, idx) => (
                            <tr
                              key={idx}
                              className="border dark:border-gray-600"
                            >
                              <td className="p-2">{i.candidateName}</td>
                              <td className="p-2">{i.position}</td>
                              <td className="p-2">{i.client}</td>
                              <td className="p-2">{i.interviewTime}</td>
                              <td className="p-2">{i.interviewType}</td>
                              <td className="p-2">
                                <button
                                  className="text-red-600 hover:underline"
                                  onClick={() =>
                                    removeInterview(
                                      allInterviews.findIndex(
                                        (intv) => intv === i
                                      )
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="flex justify-end">
                      <button
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        onClick={() => setShowTodayInterviewsModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showTrackerModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl p-8 w-full max-w-3xl relative">
                    <button
                      className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => setShowTrackerModal(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="mb-6 text-xl font-bold text-center dark:text-gray-100">
                      All Interviews (Pending Cases)
                    </div>
                    {allInterviews.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-300">
                        No interviews found.
                      </div>
                    ) : (
                      <table className="min-w-full text-sm text-left border mb-4">
                        <thead className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-600">
                          <tr>
                            <th className="p-2 border dark:text-gray-200">
                              Candidate
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Position
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Client
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Date
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Status
                            </th>
                            <th className="p-2 border dark:text-gray-200">
                              Edit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allInterviews.map((i) => (
                            <tr
                              key={i._id}
                              className="border dark:border-gray-600"
                            >
                              <td className="p-2">{i.candidateName}</td>
                              <td className="p-2">{i.position}</td>
                              <td className="p-2">{i.client}</td>
                              <td className="p-2">{i.interviewDate}</td>
                              <td className="p-2">{i.finalStatus}</td>
                              <td className="p-2">
                                <button
                                  className="text-blue-600 hover:underline"
                                  onClick={() => setEditInterview(i)}
                                >
                                  Change Status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="flex justify-end">
                      <button
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        onClick={() => setShowTrackerModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Interview Modal */}
              {editInterview && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
                    <button
                      className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => setEditInterview(null)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <div className="mb-6 text-xl font-bold text-center dark:text-gray-100">
                      Change Interview Status
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditInterview(editInterview);
                      }}
                      className="space-y-4"
                    >
                      {/* Display existing data as text */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold dark:text-gray-200">
                            Date & Time:
                          </span>
                          <span className="dark:text-gray-200">
                            {editInterview.interviewDate}{" "}
                            {editInterview.interviewTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold dark:text-gray-200">
                            Interview Type:
                          </span>
                          <span className="dark:text-gray-200">
                            {editInterview.interviewType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold dark:text-gray-200">
                            Interview Round:
                          </span>
                          <span className="dark:text-gray-200">
                            {editInterview.interviewRound}
                          </span>
                        </div>
                      </div>

                      <hr className="my-4" />

                      {/* Interview Feedback */}
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Interview Feedback
                        </label>
                        <select
                          className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          value={editInterview.interviewFeedback || ""}
                          onChange={(e) =>
                            setEditInterview({
                              ...editInterview,
                              interviewFeedback: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Interview Feedback</option>
                          <option>Intro Scheduled</option>
                          <option>Intro Reject</option>
                          <option>Assignment Scheduled</option>
                          <option>Assignment Reject</option>
                          <option>L1 Scheduled</option>
                          <option>L1 Reject</option>
                          <option>L2 Scheduled</option>
                          <option>L2 Reject</option>
                          <option>L3 Scheduled</option>
                          <option>L3 Reject</option>
                          <option>L4 Scheduled</option>
                          <option>L4 Reject</option>
                          <option>L5 Scheduled</option>
                          <option>L5 Reject</option>
                          <option>L6 Scheduled</option>
                          <option>L6 Reject</option>
                          <option>L7 Scheduled</option>
                          <option>L7 Reject</option>
                          <option>HR Round Scheduled</option>
                          <option>HR Round Reject</option>
                          <option>Final Round Scheduled</option>
                          <option>Final Round Reject</option>
                          <option>Offer Discussion Scheduled</option>
                          <option>Offer Discussion Reject</option>
                          <option>Additional Discussion Scheduled</option>
                          <option>Additional Discussion Reject</option>
                          <option>Next Round Schedule Pending</option>
                        </select>
                      </div>

                      {/* Final Status */}
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                          Final Status
                        </label>
                        <select
                          className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          value={editInterview.finalStatus || ""}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setEditInterview({
                              ...editInterview,
                              finalStatus: newStatus,
                              // Clear next interview date/time if status is rejected
                              nextInterviewDate:
                                newStatus === "Rejected"
                                  ? ""
                                  : editInterview.nextInterviewDate,
                              nextInterviewTime:
                                newStatus === "Rejected"
                                  ? ""
                                  : editInterview.nextInterviewTime,
                            });
                          }}
                          required
                        >
                          <option value="">Select Final Status</option>
                          <option>Rejected</option>
                          <option>Position On-Hold</option>
                          <option>Schedule Pending</option>
                          <option>Offer Roll Out</option>
                          <option>Offer Signing Pending</option>
                          <option>Offer & Joining Pending</option>
                          <option>Joined/Closure</option>
                        </select>
                      </div>

                      {/* Conditional Next Interview Date/Time for non-rejected statuses */}
                      {editInterview.finalStatus &&
                        editInterview.finalStatus !== "Rejected" && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium dark:text-gray-200">
                              Next Interview Date & Time
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                className="flex-1 border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                value={editInterview.nextInterviewDate || ""}
                                onChange={(e) =>
                                  setEditInterview({
                                    ...editInterview,
                                    nextInterviewDate: e.target.value,
                                  })
                                }
                                placeholder="Date"
                              />
                              <input
                                type="time"
                                className="flex-1 border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                value={editInterview.nextInterviewTime || ""}
                                onChange={(e) =>
                                  setEditInterview({
                                    ...editInterview,
                                    nextInterviewTime: e.target.value,
                                  })
                                }
                                placeholder="Time"
                              />
                            </div>
                            {/* Display current next interview info if available */}
                            {editInterview.nextInterviewDate &&
                              editInterview.nextInterviewTime && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  Current next interview:{" "}
                                  {editInterview.nextInterviewDate} at{" "}
                                  {editInterview.nextInterviewTime}
                                </div>
                              )}
                          </div>
                        )}

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          type="button"
                          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                          onClick={() => setEditInterview(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {showContributionModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
                  <button
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500 focus:outline-none"
                    onClick={() => setShowContributionModal(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <div className="mb-6 text-xl font-bold text-center dark:text-gray-100">
                    Contribution Details
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold mb-2 dark:text-gray-200">
                      Closures
                    </div>
                    {closures.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-300">
                        No closures yet.
                      </div>
                    ) : (
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 mb-2">
                        {closures.map((c, idx) => (
                          <li key={idx}>
                            {c.name}{" "}
                            <span className="text-xs text-gray-500 ml-2">
                              ({c.date})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold dark:text-gray-200">
                      Last Closure Date
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">
                      {lastClosure ? lastClosure.date : "N/A"}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold dark:text-gray-200 mb-1">
                      Contribution Level
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                      {contributionLevel}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold dark:text-gray-200 mb-1">
                      Message from Team Leader
                    </div>
                    <div className="border rounded p-2 bg-blue-50 dark:bg-blue-900 dark:text-gray-200">
                      {teamLeaderMsg}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold dark:text-gray-200 mb-1">
                      Message from Admin
                    </div>
                    <div className="border rounded p-2 bg-green-50 dark:bg-green-900 dark:text-gray-200">
                      {adminMsg}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      onClick={() => setShowContributionModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === "jobBoard" && (
          <div>

            {/* Main Content */}
            <main className="flex-1 p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Job Board</h1>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search Jobs"
                    className="border border-gray-300 rounded-full px-4 py-1 w-64 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      className={`text-sm font-semibold px-4 py-1 rounded-full ${
                        showHotJobs
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setShowHotJobs(true)}
                    >
                      Hot Jobs
                    </button>
                    <button
                      className={`text-sm font-semibold px-4 py-1 rounded-full ${
                        !showHotJobs
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setShowHotJobs(false)}
                    >
                      All Jobs
                    </button>
                  </div>
                  <SlidersHorizontal className="text-gray-600 cursor-pointer" />
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-6">
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="flex bg-white shadow rounded-xl overflow-hidden"
                  >
                    {/* Logo Section */}
                    <div
                      className={`w-36 flex items-center justify-center ${
                        index % 3 === 0
                          ? "bg-green-100"
                          : index % 3 === 1
                          ? "bg-pink-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <div className="text-center">
                        <img
                          src={job.logo}
                          alt={job.brand}
                          className="h-10 mx-auto mb-2"
                        />
                        <p className="text-sm font-medium">{job.brand}</p>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 p-4">
                      <h2 className="text-md font-semibold text-gray-800">
                        {job.company}
                      </h2>
                      <h3 className="text-lg font-bold text-gray-900">
                        {job.role}
                        {job.hot && (
                          <span className="ml-1 text-red-500">🔥</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Technology Product based hyper growth, Innovative
                        company.
                      </p>

                      <div className="text-sm text-gray-700 mt-2 space-x-4">
                        <span>{job.experience}</span>
                        <span>₹ {job.salary}</span>
                        <span>{job.location}</span>
                        <span>{job.mode}</span>
                        <span>{job.type}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-pink-100 text-gray-700 px-2 py-1 rounded-full">
                          Open Positions ~ {job.openings}
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          Product
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {job.category}
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {job.nature}
                        </span>
                        {job.stack.map((skill) => (
                          <span
                            key={skill}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Posted : {job.posted}
                      </p>
                    </div>

                    {/* View More */}
                    <div className="flex items-end p-4">
                      <button className="bg-[#23395d] text-white text-sm px-4 py-2 rounded-md">
                        View More
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className="w-8 h-8 text-sm font-semibold border rounded-full hover:bg-blue-600 hover:text-white transition"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </main>
          </div>
        )}
        {activeSection === "settings" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Settings
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboardMain;
