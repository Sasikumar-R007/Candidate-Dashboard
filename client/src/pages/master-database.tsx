import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Filter, Search, Trash2, X, Share2, Download } from "lucide-react";

type ProfileType = 'resume' | 'employee' | 'client';

type ResumeStatus = 'Inbound' | 'Existed' | 'Archived' | 'Looking for Jobs' | 'In working';
type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Resigned';
type ClientStatus = 'Active' | 'Inactive' | 'On Hold' | 'Terminated';

interface ResumeData {
  id: number;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: ResumeStatus;
  uploadedDate: string;
}

interface EmployeeData {
  id: number;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: EmployeeStatus;
  uploadedDate: string;
}

interface ClientData {
  id: number;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: ClientStatus;
  uploadedDate: string;
}

export default function MasterDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>('resume');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isResumeDrawerOpen, setIsResumeDrawerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeData | EmployeeData | ClientData | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    position: "",
    experience: "",
    skills: "",
    source: ""
  });

  // Sample data for resumes
  const resumeData: ResumeData[] = [
    { id: 1, name: "Adhitya", position: "Software Engineer", experience: "1 year", skills: "Python, Java, React", source: "LinkedIn", status: "Inbound", uploadedDate: "12-10-25" },
    { id: 2, name: "kavin", position: "Project Manager", experience: "1 year, 2 moths", skills: "Agile, Scrum, Leadership", source: "Naukri", status: "Existed", uploadedDate: "11-10-25" },
    { id: 3, name: "Pravin Kumar", position: "Financial Analyst", experience: "3 years", skills: "Excel, Financial Modeling, SQL", source: "Indeed", status: "Existed", uploadedDate: "07-10-25" },
    { id: 4, name: "Vimal", position: "Sales Executive", experience: "2 years", skills: "Salesforce, CRM, Negotiation", source: "Referral", status: "Inbound", uploadedDate: "01-10-25" },
    { id: 5, name: "Keerthana", position: "Content Writer", experience: "1 year", skills: "WordPress, SEO, Copywriting", source: "LinkedIn", status: "Existed", uploadedDate: "30-09-25" },
    { id: 6, name: "Shivani", position: "Graphic Designer", experience: "5 years", skills: "Figma, Adobe XD, Illustrator", source: "Behance", status: "Inbound", uploadedDate: "22-09-25" },
    { id: 7, name: "Adhitya", position: "Software Engineer", experience: "1 year", skills: "Python, Java, React", source: "LinkedIn", status: "Inbound", uploadedDate: "12-10-25" },
    { id: 8, name: "Vaishnavi", position: "Project Manager", experience: "4 years", skills: "Slack, Jira, Agile", source: "Monster", status: "Existed", uploadedDate: "12-09-25" },
    { id: 9, name: "Pravin Kumar", position: "Financial Analyst", experience: "3 years", skills: "Excel, Financial Modeling, SQL", source: "Indeed", status: "Existed", uploadedDate: "07-10-25" },
    { id: 10, name: "kavin", position: "Project Manager", experience: "1 year, 2 moths", skills: "Agile, Scrum, Leadership", source: "Naukri", status: "Existed", uploadedDate: "11-10-25" },
  ];

  // Sample data for employees
  const employeeData: EmployeeData[] = [
    { id: 1, name: "Priya Sharma", position: "Talent Advisor", experience: "2 years", skills: "Recruitment, Sourcing", source: "Direct", status: "Active", uploadedDate: "01-04-23" },
    { id: 2, name: "Amit Kumar", position: "Talent Advisor", experience: "3 years", skills: "Hiring, Screening", source: "Direct", status: "Active", uploadedDate: "15-03-23" },
    { id: 3, name: "Kumaravel R", position: "Team Leader", experience: "5 years", skills: "Leadership, Management", source: "Direct", status: "Active", uploadedDate: "10-02-23" },
    { id: 4, name: "Rajesh Mehta", position: "Client Manager", experience: "4 years", skills: "Client Relations, Sales", source: "Direct", status: "Active", uploadedDate: "20-01-23" },
    { id: 5, name: "Sowmiya Ravi", position: "Talent Advisor", experience: "1 year", skills: "Recruitment, LinkedIn", source: "Direct", status: "On Leave", uploadedDate: "05-05-23" },
    { id: 6, name: "Deepak Singh", position: "HR Manager", experience: "6 years", skills: "HR Operations, Payroll", source: "Direct", status: "Active", uploadedDate: "12-06-23" },
    { id: 7, name: "Ananya Desai", position: "Recruiter", experience: "2 years", skills: "Campus Hiring, Screening", source: "Direct", status: "Inactive", uploadedDate: "18-07-23" },
    { id: 8, name: "Vikram Patel", position: "Operations Head", experience: "8 years", skills: "Operations, Strategy", source: "Direct", status: "Active", uploadedDate: "22-08-23" },
  ];

  // Sample data for clients
  const clientData: ClientData[] = [
    { id: 1, name: "TechCorp Ltd", position: "Technology", experience: "10 years", skills: "Software Development", source: "Referral", status: "Active", uploadedDate: "05-01-24" },
    { id: 2, name: "FinServe Inc", position: "Finance", experience: "15 years", skills: "Financial Services", source: "Direct", status: "Active", uploadedDate: "12-02-24" },
    { id: 3, name: "HealthPlus", position: "Healthcare", experience: "8 years", skills: "Medical Services", source: "Marketing", status: "On Hold", uploadedDate: "20-03-24" },
    { id: 4, name: "EduLearn", position: "Education", experience: "5 years", skills: "E-Learning", source: "Referral", status: "Active", uploadedDate: "15-04-24" },
    { id: 5, name: "RetailMax", position: "Retail", experience: "12 years", skills: "E-commerce", source: "Direct", status: "Inactive", uploadedDate: "10-05-24" },
    { id: 6, name: "BuildPro", position: "Construction", experience: "20 years", skills: "Infrastructure", source: "Partnership", status: "Active", uploadedDate: "25-06-24" },
    { id: 7, name: "FoodHub", position: "Food & Beverage", experience: "6 years", skills: "Restaurant Chain", source: "Marketing", status: "Active", uploadedDate: "08-07-24" },
  ];

  // Get current data based on profile type
  const getCurrentData = () => {
    switch (profileType) {
      case 'resume':
        return resumeData;
      case 'employee':
        return employeeData;
      case 'client':
        return clientData;
      default:
        return resumeData;
    }
  };

  // Get status options based on profile type
  const getStatusOptions = () => {
    switch (profileType) {
      case 'resume':
        return ['Inbound', 'Existed', 'Archived', 'Looking for Jobs', 'In working'];
      case 'employee':
        return ['Active', 'On Leave', 'Inactive', 'Resigned'];
      case 'client':
        return ['Active', 'Inactive', 'On Hold', 'Terminated'];
      default:
        return [];
    }
  };

  // Filter data based on search, status, and advanced filters
  const filteredData = getCurrentData().filter(item => {
    // Exclude deleted items
    if (deletedIds.includes(item.id)) {
      return false;
    }
    
    const searchMatch = searchQuery === "" || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const statusMatch = statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Advanced filter matches
    const positionMatch = !advancedFilters.position || 
      item.position.toLowerCase().includes(advancedFilters.position.toLowerCase());
    
    const experienceMatch = !advancedFilters.experience || 
      item.experience.toLowerCase().includes(advancedFilters.experience.toLowerCase());
    
    const skillsMatch = !advancedFilters.skills || 
      item.skills.toLowerCase().includes(advancedFilters.skills.toLowerCase());
    
    const sourceMatch = !advancedFilters.source || 
      item.source.toLowerCase().includes(advancedFilters.source.toLowerCase());
    
    // Date range filtering
    let dateMatch = true;
    if (advancedFilters.dateFrom || advancedFilters.dateTo) {
      const parseDate = (dateStr: string) => {
        // Handle DD-MM-YY format
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = 2000 + parseInt(parts[2]); // Assuming 20xx
          return new Date(year, month, day);
        }
        return new Date(dateStr);
      };
      
      const itemDate = parseDate(item.uploadedDate);
      
      if (advancedFilters.dateFrom) {
        const fromDate = new Date(advancedFilters.dateFrom);
        dateMatch = dateMatch && itemDate >= fromDate;
      }
      
      if (advancedFilters.dateTo) {
        const toDate = new Date(advancedFilters.dateTo);
        dateMatch = dateMatch && itemDate <= toDate;
      }
    }
    
    return searchMatch && statusMatch && positionMatch && experienceMatch && 
           skillsMatch && sourceMatch && dateMatch;
  });
  
  // Handle apply advanced filters
  const handleApplyFilters = () => {
    setIsAdvancedFilterOpen(false);
  };
  
  // Handle clear advanced filters
  const handleClearFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      position: "",
      experience: "",
      skills: "",
      source: ""
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    // Resume statuses
    if (lowerStatus === 'inbound') return 'bg-green-500 text-white';
    if (lowerStatus === 'existed') return 'bg-blue-500 text-white';
    if (lowerStatus === 'archived') return 'bg-gray-500 text-white';
    if (lowerStatus === 'looking for jobs') return 'bg-orange-500 text-white';
    if (lowerStatus === 'in working') return 'bg-purple-500 text-white';
    
    // Employee statuses
    if (lowerStatus === 'active') return 'bg-green-500 text-white';
    if (lowerStatus === 'on leave') return 'bg-yellow-500 text-white';
    if (lowerStatus === 'inactive') return 'bg-gray-500 text-white';
    if (lowerStatus === 'resigned') return 'bg-red-500 text-white';
    
    // Client statuses
    if (lowerStatus === 'on hold') return 'bg-orange-500 text-white';
    if (lowerStatus === 'terminated') return 'bg-red-500 text-white';
    
    return 'bg-gray-500 text-white';
  };

  // Get profile type label
  const getProfileTypeLabel = () => {
    switch (profileType) {
      case 'resume':
        return 'Resume';
      case 'employee':
        return 'Employee';
      case 'client':
        return 'Client';
      default:
        return 'Resume';
    }
  };

  // Handle row click to open resume drawer
  const handleRowClick = (item: ResumeData | EmployeeData | ClientData) => {
    // Only open drawer for resume profile type
    if (profileType === 'resume') {
      setSelectedResume(item);
      setIsResumeDrawerOpen(true);
    }
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setIsResumeDrawerOpen(false);
    setSelectedResume(null);
  };

  // Handle delete row
  const handleDeleteRow = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setDeletedIds(prev => [...prev, itemId]);
    // Close drawer if the deleted item is currently selected
    if (selectedResume && selectedResume.id === itemId) {
      setIsResumeDrawerOpen(false);
      setSelectedResume(null);
    }
  };

  // Handle share resume
  const handleShareResume = () => {
    // Frontend only - just show a toast or alert
    alert('Share functionality - Frontend only');
  };

  // Handle download resume
  const handleDownloadResume = () => {
    // Frontend only - just show a toast or alert
    alert('Download functionality - Frontend only');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="icon"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Master Database</h1>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search across all database......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800"
              data-testid="input-search"
            />
          </div>
          
          <Select value={profileType} onValueChange={(value) => {
            setProfileType(value as ProfileType);
            setStatusFilter("all");
          }}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800" data-testid="select-profile-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800" data-testid="select-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {getStatusOptions().map(status => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white dark:bg-gray-800" 
            onClick={() => setIsAdvancedFilterOpen(true)}
            data-testid="button-advanced-filter"
          >
            <Filter size={16} />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Main Content Area - Side by Side Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table Section */}
        <div className={`p-6 overflow-auto ${
          isResumeDrawerOpen ? 'flex-1' : 'w-full'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200 dark:bg-blue-900">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Experience</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Skills</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Source</th>
                    {!isResumeDrawerOpen && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Uploaded Date</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      onClick={() => handleRowClick(item)}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-750'
                      } ${profileType === 'resume' ? 'cursor-pointer hover-elevate' : ''}`}
                      data-testid={`row-${profileType}-${item.id}`}
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100" data-testid={`text-name-${item.id}`}>
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.position}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.experience}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                        {item.skills.split(',')[0]}...
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.source}</td>
                      {!isResumeDrawerOpen && (
                        <>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusBadgeColor(item.status)} rounded-full px-3 py-1`}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.uploadedDate}</td>
                        </>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => handleDeleteRow(e, item.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resume Display Section - Side Panel */}
        {isResumeDrawerOpen && selectedResume && (
          <div className="w-full max-w-md h-screen border-l-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-col">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Candidate Profile Header - Redesigned */}
              <div className="flex items-start justify-between gap-4">
                {/* Left Side: Profile Info */}
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={selectedResume.name} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {getInitials(selectedResume.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100" data-testid="text-candidate-name">
                        {selectedResume.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-candidate-position">
                        {selectedResume.position}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getStatusBadgeColor(selectedResume.status)} rounded-full px-3 py-1 text-xs`}>
                        {selectedResume.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right Side: Close Button */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDrawer}
                    className="h-8 w-8 rounded-full"
                    data-testid="button-close-drawer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Resume Display Area */}
              <div className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-8 min-h-[400px] flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resume</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Resume Not Available</p>
                  </div>
                  
                  {/* Share and Download Buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShareResume}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                      data-testid="button-share-resume"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDownloadResume}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                      data-testid="button-download-resume"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Uploaded Date Badge - Moved Below Resume */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    Uploaded: {selectedResume.uploadedDate}
                  </Badge>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter Dialog */}
      <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-advanced-filter">
          <DialogHeader>
            <DialogTitle>Advanced Filter</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={advancedFilters.dateFrom}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                data-testid="input-date-from"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={advancedFilters.dateTo}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                data-testid="input-date-to"
              />
            </div>
            
            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Position/Role</Label>
              <Input
                id="position"
                type="text"
                placeholder="e.g. Software Engineer"
                value={advancedFilters.position}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, position: e.target.value }))}
                data-testid="input-position"
              />
            </div>
            
            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                type="text"
                placeholder="e.g. 2 years, 3-5 years"
                value={advancedFilters.experience}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, experience: e.target.value }))}
                data-testid="input-experience"
              />
            </div>
            
            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                type="text"
                placeholder="e.g. Python, React, SQL"
                value={advancedFilters.skills}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, skills: e.target.value }))}
                data-testid="input-skills"
              />
            </div>
            
            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select 
                value={advancedFilters.source} 
                onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger data-testid="select-source">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Naukri">Naukri</SelectItem>
                  <SelectItem value="Indeed">Indeed</SelectItem>
                  <SelectItem value="Monster">Monster</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Behance">Behance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
            <Button 
              onClick={handleApplyFilters}
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
