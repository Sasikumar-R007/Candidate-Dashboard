import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Filter, Search, Upload, CalendarIcon, Plus } from "lucide-react";
import BulkResumeUpload from "@/components/dashboard/bulk-resume-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MasterDatabase() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState("profile");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    location: "",
    experience: "",
    qualification: ""
  });
  
  const [resumeFormData, setResumeFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    whatsappNumber: '',
    primaryEmail: '',
    secondaryEmail: '',
    highestQualification: '',
    collegeName: '',
    linkedin: '',
    pedigreeLevel: '',
    currentLocation: '',
    noticePeriod: '',
    website: '',
    portfolio1: '',
    currentCompany: '',
    portfolio2: '',
    currentRole: '',
    portfolio3: '',
    companyDomain: '',
    companyLevel: '',
    skills: ['', '', '', '', '']
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Client modal and form state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientStartDate, setClientStartDate] = useState<Date>();
  const [clientForm, setClientForm] = useState({
    clientCode: '',
    brandName: '',
    incorporatedName: '',
    gstin: '',
    address: '',
    location: '',
    spoc: '',
    email: '',
    password: '',
    website: '',
    linkedin: '',
    agreement: '',
    percentage: '',
    category: '',
    paymentTerms: '',
    source: '',
    startDate: '',
    currentStatus: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: typeof clientForm) => {
      return await apiRequest('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      setIsClientModalOpen(false);
      // Reset form
      setClientForm({
        clientCode: '',
        brandName: '',
        incorporatedName: '',
        gstin: '',
        address: '',
        location: '',
        spoc: '',
        email: '',
        password: '',
        website: '',
        linkedin: '',
        agreement: '',
        percentage: '',
        category: '',
        paymentTerms: '',
        source: '',
        startDate: '',
        currentStatus: ''
      });
      setClientStartDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    }
  });

  // Sample data for different database sections
  const resumeDatabaseAll = [
    { id: 1, candidateName: "Aarav Sharma", position: "Frontend Developer", experience: "3 years", skills: "React, JavaScript, CSS", status: "Active", uploadDate: "2025-08-15" },
    { id: 2, candidateName: "Arjun Patel", position: "UI/UX Designer", experience: "2 years", skills: "Figma, Sketch, Adobe XD", status: "Screening", uploadDate: "2025-08-14" },
    { id: 3, candidateName: "Shaurya Kumar", position: "Backend Developer", experience: "4 years", skills: "Node.js, Python, MongoDB", status: "Interview", uploadDate: "2025-08-13" },
    { id: 4, candidateName: "Vihaan Singh", position: "QA Tester", experience: "2 years", skills: "Selenium, Cypress, Jest", status: "Selected", uploadDate: "2025-08-12" },
    { id: 5, candidateName: "Aditya Verma", position: "Mobile Developer", experience: "3 years", skills: "React Native, Flutter", status: "Rejected", uploadDate: "2025-08-11" },
  ];

  const candidateDetailsAll = [
    { id: 1, name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 9876543210", location: "Mumbai", currentStatus: "In-Process", appliedOn: "06-06-2025", company: "TechCorp" },
    { id: 2, name: "Arjun Patel", email: "arjun@example.com", phone: "+91 9876543211", location: "Delhi", currentStatus: "Shortlisted", appliedOn: "08-06-2025", company: "Designify" },
    { id: 3, name: "Shaurya Kumar", email: "shaurya@example.com", phone: "+91 9876543212", location: "Bangalore", currentStatus: "Interview", appliedOn: "20-06-2025", company: "CodeLabs" },
    { id: 4, name: "Vihaan Singh", email: "vihaan@example.com", phone: "+91 9876543213", location: "Pune", currentStatus: "Selected", appliedOn: "01-07-2025", company: "AppLogic" },
    { id: 5, name: "Aditya Verma", email: "aditya@example.com", phone: "+91 9876543214", location: "Hyderabad", currentStatus: "Rejected", appliedOn: "23-07-2025", company: "Bug Catchers" },
  ];

  const employeesDatabaseAll = [
    { id: 1, employeeId: "STTA001", name: "Priya Sharma", role: "Talent Advisor", department: "Recruitment", joiningDate: "01-04-2023", status: "Active", email: "priya@company.com" },
    { id: 2, employeeId: "STTA002", name: "Amit Kumar", role: "Talent Advisor", department: "Recruitment", joiningDate: "15-03-2023", status: "Active", email: "amit@company.com" },
    { id: 3, employeeId: "STTL001", name: "Kumaravel R", role: "Team Leader", department: "Recruitment", joiningDate: "10-02-2023", status: "Active", email: "kumaravel@company.com" },
    { id: 4, employeeId: "STCL001", name: "Rajesh Mehta", role: "Client Manager", department: "Client Relations", joiningDate: "20-01-2023", status: "Active", email: "rajesh@company.com" },
    { id: 5, employeeId: "STTA003", name: "Sowmiya Ravi", role: "Talent Advisor", department: "Recruitment", joiningDate: "05-05-2023", status: "On Leave", email: "sowmiya@company.com" },
  ];

  const requirementsDatabaseAll = [
    { id: 1, position: "Frontend Developer", criticality: "HIGH", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Priya Sharma", status: "Active", createdAt: "2025-08-01" },
    { id: 2, position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Amit Kumar", status: "Interview", createdAt: "2025-08-02" },
    { id: 3, position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Sowmiya Ravi", status: "Screening", createdAt: "2025-08-03" },
    { id: 4, position: "QA Tester", criticality: "MEDIUM", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Priya Sharma", status: "Offer", createdAt: "2025-08-04" },
    { id: 5, position: "Mobile Developer", criticality: "HIGH", company: "Bug Catchers", spoc: "Mel Gibson", talentAdvisor: "Amit Kumar", status: "Active", createdAt: "2025-08-05" },
  ];

  const interviewsDatabaseAll = [
    { id: 1, candidateName: "Aarav Sharma", position: "Frontend Developer", client: "TechCorp", interviewDate: "2025-08-20", interviewTime: "10:00 AM", type: "Video Call", round: "L1", status: "Scheduled" },
    { id: 2, candidateName: "Arjun Patel", position: "UI/UX Designer", client: "Designify", interviewDate: "2025-08-21", interviewTime: "2:00 PM", type: "Phone Call", round: "HR", status: "Completed" },
    { id: 3, candidateName: "Shaurya Kumar", position: "Backend Developer", client: "CodeLabs", interviewDate: "2025-08-22", interviewTime: "11:00 AM", type: "In Person", round: "L2", status: "Scheduled" },
    { id: 4, candidateName: "Vihaan Singh", position: "QA Tester", client: "AppLogic", interviewDate: "2025-08-19", interviewTime: "3:00 PM", type: "Video Call", round: "Final", status: "Completed" },
    { id: 5, candidateName: "Aditya Verma", position: "Mobile Developer", client: "Bug Catchers", interviewDate: "2025-08-23", interviewTime: "9:00 AM", type: "Phone Call", round: "L1", status: "Cancelled" },
  ];

  // Filter function
  const filterData = <T extends Record<string, any>>(data: T[], query: string, statusFilter: string): T[] => {
    return data.filter(item => {
      const searchMatch = query === "" || Object.values(item).some(value => 
        String(value).toLowerCase().includes(query.toLowerCase())
      );
      
      const statusMatch = statusFilter === "all" || 
        (item.status && item.status.toLowerCase() === statusFilter.toLowerCase()) ||
        (item.currentStatus && item.currentStatus.toLowerCase() === statusFilter.toLowerCase());
      
      // Advanced filter matching
      const locationMatch = !advancedFilters.location || 
        (item.location && item.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) ||
        (item.currentLocation && item.currentLocation.toLowerCase().includes(advancedFilters.location.toLowerCase()));
      
      const experienceMatch = !advancedFilters.experience || 
        (item.experience && item.experience.toLowerCase().includes(advancedFilters.experience.toLowerCase()));
      
      const qualificationMatch = !advancedFilters.qualification || 
        (item.highestQualification && item.highestQualification.toLowerCase().includes(advancedFilters.qualification.toLowerCase()));
      
      // Date range filtering
      let dateMatch = true;
      if (advancedFilters.dateFrom || advancedFilters.dateTo) {
        const itemDate = item.uploadDate || item.appliedOn || item.createdAt || item.interviewDate || item.joiningDate;
        if (itemDate) {
          // Convert date string to Date object for comparison
          const parseDate = (dateStr: string) => {
            // Handle various date formats (DD-MM-YYYY, YYYY-MM-DD, etc.)
            if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              if (parts[0].length === 4) {
                // YYYY-MM-DD format
                return new Date(dateStr);
              } else {
                // DD-MM-YYYY format
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              }
            }
            return new Date(dateStr);
          };
          
          const itemDateObj = parseDate(itemDate);
          
          if (advancedFilters.dateFrom) {
            const fromDate = new Date(advancedFilters.dateFrom);
            dateMatch = dateMatch && itemDateObj >= fromDate;
          }
          
          if (advancedFilters.dateTo) {
            const toDate = new Date(advancedFilters.dateTo);
            dateMatch = dateMatch && itemDateObj <= toDate;
          }
        } else {
          // If date filters are set but item has no date, exclude it
          dateMatch = false;
        }
      }
      
      return searchMatch && statusMatch && locationMatch && experienceMatch && qualificationMatch && dateMatch;
    });
  };

  // Apply filters
  const resumeDatabase = filterData(resumeDatabaseAll, searchQuery, filterStatus);
  const candidateDetails = filterData(candidateDetailsAll, searchQuery, filterStatus);
  const employeesDatabase = filterData(employeesDatabaseAll, searchQuery, filterStatus);
  const requirementsDatabase = filterData(requirementsDatabaseAll, searchQuery, filterStatus);
  const interviewsDatabase = filterData(interviewsDatabaseAll, searchQuery, filterStatus);

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Scheduled':
        return 'bg-green-100 text-green-800';
      case 'Interview':
      case 'Screening':
        return 'bg-blue-100 text-blue-800';
      case 'Selected':
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
              className="flex items-center"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Master Database</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-export-data">
              <Download size={16} />
              Export Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              data-testid="button-import-data"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload size={16} />
              Import Data
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search across all databases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-database"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={() => setIsAdvancedFilterOpen(true)}
            data-testid="button-advanced-filter"
          >
            <Filter size={16} />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="resumes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumes" data-testid="tab-resumes">Resume Database</TabsTrigger>
            <TabsTrigger value="candidates" data-testid="tab-candidates">Candidate Details</TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees">Employees Master</TabsTrigger>
            <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            <TabsTrigger value="interviews" data-testid="tab-interviews">Interviews</TabsTrigger>
          </TabsList>

          {/* Resume Database Tab */}
          <TabsContent value="resumes">
            <Card>
              <CardHeader>
                <CardTitle>Resume Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Skills</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Upload Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumeDatabase.map((resume) => (
                        <tr key={resume.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium" data-testid={`text-candidate-${resume.id}`}>{resume.candidateName}</td>
                          <td className="py-3 px-4 text-gray-900">{resume.position}</td>
                          <td className="py-3 px-4 text-gray-900">{resume.experience}</td>
                          <td className="py-3 px-4 text-gray-900">{resume.skills}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(resume.status)}`}>
                              {resume.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{resume.uploadDate}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" data-testid={`button-view-resume-${resume.id}`}>View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidate Details Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Applied On</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateDetails.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium" data-testid={`text-candidate-name-${candidate.id}`}>{candidate.name}</td>
                          <td className="py-3 px-4 text-gray-900">{candidate.email}</td>
                          <td className="py-3 px-4 text-gray-900">{candidate.phone}</td>
                          <td className="py-3 px-4 text-gray-900">{candidate.location}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.currentStatus)}`}>
                              {candidate.currentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{candidate.appliedOn}</td>
                          <td className="py-3 px-4 text-gray-900">{candidate.company}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Master Tab */}
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employees Master</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Employee ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Joining Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesDatabase.map((employee) => (
                        <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium" data-testid={`text-employee-id-${employee.id}`}>{employee.employeeId}</td>
                          <td className="py-3 px-4 text-gray-900">{employee.name}</td>
                          <td className="py-3 px-4 text-gray-900">{employee.role}</td>
                          <td className="py-3 px-4 text-gray-900">{employee.department}</td>
                          <td className="py-3 px-4 text-gray-900">{employee.joiningDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(employee.status)}`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{employee.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Requirements Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Criticality</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">SPOC</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Talent Advisor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirementsDatabase.map((requirement) => (
                        <tr key={requirement.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium" data-testid={`text-requirement-position-${requirement.id}`}>{requirement.position}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCriticalityBadge(requirement.criticality)}`}>
                              {requirement.criticality}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{requirement.company}</td>
                          <td className="py-3 px-4 text-gray-900">{requirement.spoc}</td>
                          <td className="py-3 px-4 text-gray-900">{requirement.talentAdvisor}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(requirement.status)}`}>
                              {requirement.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{requirement.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interviews Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Candidate Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Interview Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Round</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviewsDatabase.map((interview) => (
                        <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium" data-testid={`text-interview-candidate-${interview.id}`}>{interview.candidateName}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.position}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.client}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.interviewDate}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.interviewTime}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.type}</td>
                          <td className="py-3 px-4 text-gray-900">{interview.round}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(interview.status)}`}>
                              {interview.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Data Modal with Two Tabs */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          
          <Tabs value={importTab} onValueChange={setImportTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" data-testid="tab-profile-upload">Profile Upload</TabsTrigger>
              <TabsTrigger value="bulk" data-testid="tab-bulk-upload">Bulk Upload</TabsTrigger>
            </TabsList>

            {/* Profile Upload Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.firstName}
                      onChange={(e) => setResumeFormData({...resumeFormData, firstName: e.target.value})}
                      placeholder="First Name *"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.lastName}
                      onChange={(e) => setResumeFormData({...resumeFormData, lastName: e.target.value})}
                      placeholder="Last Name *"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.mobileNumber}
                      onChange={(e) => setResumeFormData({...resumeFormData, mobileNumber: e.target.value})}
                      placeholder="Mobile Number *"
                      data-testid="input-mobile-number"
                    />
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.whatsappNumber}
                      onChange={(e) => setResumeFormData({...resumeFormData, whatsappNumber: e.target.value})}
                      placeholder="WhatsApp Number"
                      data-testid="input-whatsapp-number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="email"
                      value={resumeFormData.primaryEmail}
                      onChange={(e) => setResumeFormData({...resumeFormData, primaryEmail: e.target.value})}
                      placeholder="Primary Email *"
                      data-testid="input-primary-email"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      value={resumeFormData.secondaryEmail}
                      onChange={(e) => setResumeFormData({...resumeFormData, secondaryEmail: e.target.value})}
                      placeholder="Secondary Email"
                      data-testid="input-secondary-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={resumeFormData.highestQualification}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, highestQualification: value})}
                    >
                      <SelectTrigger data-testid="select-highest-qualification">
                        <SelectValue placeholder="Highest Qualification *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.collegeName}
                      onChange={(e) => setResumeFormData({...resumeFormData, collegeName: e.target.value})}
                      placeholder="College Name *"
                      data-testid="input-college-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.linkedin}
                      onChange={(e) => setResumeFormData({...resumeFormData, linkedin: e.target.value})}
                      placeholder="LinkedIn Profile URL"
                      data-testid="input-linkedin"
                    />
                  </div>
                  <div>
                    <Select
                      value={resumeFormData.pedigreeLevel}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, pedigreeLevel: value})}
                    >
                      <SelectTrigger data-testid="select-pedigree-level">
                        <SelectValue placeholder="Pedigree Level *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tier 1">Tier 1</SelectItem>
                        <SelectItem value="Tier 2">Tier 2</SelectItem>
                        <SelectItem value="Tier 3">Tier 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={resumeFormData.currentLocation}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, currentLocation: value})}
                    >
                      <SelectTrigger data-testid="select-current-location">
                        <SelectValue placeholder="Current Location *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Chennai">Chennai</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={resumeFormData.noticePeriod}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, noticePeriod: value})}
                    >
                      <SelectTrigger data-testid="select-notice-period">
                        <SelectValue placeholder="Notice Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="15 days">15 days</SelectItem>
                        <SelectItem value="30 days">30 days</SelectItem>
                        <SelectItem value="60 days">60 days</SelectItem>
                        <SelectItem value="90 days">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.website}
                      onChange={(e) => setResumeFormData({...resumeFormData, website: e.target.value})}
                      placeholder="Website URL"
                      data-testid="input-website"
                    />
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.portfolio1}
                      onChange={(e) => setResumeFormData({...resumeFormData, portfolio1: e.target.value})}
                      placeholder="Portfolio 1 URL"
                      data-testid="input-portfolio1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.currentCompany}
                      onChange={(e) => setResumeFormData({...resumeFormData, currentCompany: e.target.value})}
                      placeholder="Current Company *"
                      data-testid="input-current-company"
                    />
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.portfolio2}
                      onChange={(e) => setResumeFormData({...resumeFormData, portfolio2: e.target.value})}
                      placeholder="Portfolio 2 URL"
                      data-testid="input-portfolio2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={resumeFormData.currentRole}
                      onChange={(e) => setResumeFormData({...resumeFormData, currentRole: e.target.value})}
                      placeholder="Current Role *"
                      data-testid="input-current-role"
                    />
                  </div>
                  <div>
                    <Input
                      value={resumeFormData.portfolio3}
                      onChange={(e) => setResumeFormData({...resumeFormData, portfolio3: e.target.value})}
                      placeholder="Portfolio 3 URL"
                      data-testid="input-portfolio3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={resumeFormData.companyDomain}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, companyDomain: value})}
                    >
                      <SelectTrigger data-testid="select-company-domain">
                        <SelectValue placeholder="Company Domain *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={resumeFormData.companyLevel}
                      onValueChange={(value) => setResumeFormData({...resumeFormData, companyLevel: value})}
                    >
                      <SelectTrigger data-testid="select-company-level">
                        <SelectValue placeholder="Company Level *" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Mid-size">Mid-size</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">Skills * (Add up to 15 skills)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {resumeFormData.skills.slice(0, 15).map((skill, index) => (
                      <Input
                        key={index}
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...resumeFormData.skills];
                          newSkills[index] = e.target.value;
                          setResumeFormData({...resumeFormData, skills: newSkills});
                        }}
                        placeholder={`Skill ${index + 1}`}
                        data-testid={`input-skill-${index}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setResumeFile(file);
                    }}
                    data-testid="input-resume-file"
                  />
                  <div className="text-sm text-gray-500 mt-1">Upload Resume (Optional)</div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsImportModalOpen(false)}
                    data-testid="button-cancel-profile"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle profile upload submission here
                      console.log('Profile data:', resumeFormData);
                      console.log('Resume file:', resumeFile);
                      setIsImportModalOpen(false);
                    }}
                    data-testid="button-submit-profile"
                  >
                    Submit Profile
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Bulk Upload Tab */}
            <TabsContent value="bulk" className="mt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-900 mb-2">Bulk Upload Instructions</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload up to 500 resumes at once</li>
                    <li>• Accepted formats: PDF (.pdf) and Word (.docx)</li>
                    <li>• Maximum file size: 10MB per resume</li>
                    <li>• Files will be automatically parsed and stored in Master Database</li>
                  </ul>
                </div>
                
                <BulkResumeUpload />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advanced Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Location"
                  value={advancedFilters.location}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, location: e.target.value})}
                  data-testid="input-filter-location"
                />
              </div>
              <div>
                <Input
                  placeholder="Experience (e.g., '3 years')"
                  value={advancedFilters.experience}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, experience: e.target.value})}
                  data-testid="input-filter-experience"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Qualification"
                  value={advancedFilters.qualification}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, qualification: e.target.value})}
                  data-testid="input-filter-qualification"
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Date From"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                  data-testid="input-filter-date-from"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  placeholder="Date To"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                  data-testid="input-filter-date-to"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdvancedFilters({
                    dateFrom: "",
                    dateTo: "",
                    location: "",
                    experience: "",
                    qualification: ""
                  });
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setIsAdvancedFilterOpen(false)}
                data-testid="button-apply-filters"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Client Modal - Comprehensive Form */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  placeholder="Client Code (Auto-generated)" 
                  className="input-styled rounded bg-gray-100 cursor-not-allowed" 
                  value={clientForm.clientCode || "Will be auto-generated"}
                  readOnly
                  disabled
                  data-testid="input-client-code"
                />
              </div>
              <div>
                <Input 
                  placeholder="Brand Name *" 
                  className="input-styled rounded" 
                  value={clientForm.brandName}
                  onChange={(e) => setClientForm({...clientForm, brandName: e.target.value})}
                  data-testid="input-brand-name"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  placeholder="Incorporated Name" 
                  className="input-styled rounded" 
                  value={clientForm.incorporatedName}
                  onChange={(e) => setClientForm({...clientForm, incorporatedName: e.target.value})}
                  data-testid="input-incorporated-name"
                />
              </div>
              <div>
                <Input 
                  placeholder="GSTIN" 
                  className="input-styled rounded" 
                  value={clientForm.gstin}
                  onChange={(e) => setClientForm({...clientForm, gstin: e.target.value})}
                  data-testid="input-gstin"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  placeholder="Address" 
                  className="input-styled rounded" 
                  value={clientForm.address}
                  onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
                  data-testid="input-address"
                />
              </div>
              <div>
                <Input 
                  placeholder="Location" 
                  className="input-styled rounded" 
                  value={clientForm.location}
                  onChange={(e) => setClientForm({...clientForm, location: e.target.value})}
                  data-testid="input-location"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  placeholder="SPOC" 
                  className="input-styled rounded" 
                  value={clientForm.spoc}
                  onChange={(e) => setClientForm({...clientForm, spoc: e.target.value})}
                  data-testid="input-spoc"
                />
              </div>
              <div>
                <Input 
                  placeholder="Email *" 
                  type="email" 
                  className="input-styled rounded" 
                  value={clientForm.email}
                  onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  data-testid="input-email"
                />
              </div>
            </div>

            {/* Row 4b - Password */}
            <div>
              <Input 
                placeholder="Password *" 
                type="password" 
                className="input-styled rounded" 
                value={clientForm.password}
                onChange={(e) => setClientForm({...clientForm, password: e.target.value})}
                data-testid="input-password"
              />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  placeholder="Website" 
                  className="input-styled rounded" 
                  value={clientForm.website}
                  onChange={(e) => setClientForm({...clientForm, website: e.target.value})}
                  data-testid="input-website"
                />
              </div>
              <div>
                <Input 
                  placeholder="LinkedIn" 
                  className="input-styled rounded" 
                  value={clientForm.linkedin}
                  onChange={(e) => setClientForm({...clientForm, linkedin: e.target.value})}
                  data-testid="input-linkedin"
                />
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select 
                  value={clientForm.agreement}
                  onValueChange={(value) => setClientForm({...clientForm, agreement: value})}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-agreement">
                    <SelectValue placeholder="Agreement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signup Pending">Signup Pending</SelectItem>
                    <SelectItem value="Signup Completed">Signup Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input 
                  placeholder="Percentage" 
                  type="number"
                  min="0"
                  max="100"
                  className="input-styled rounded pr-8" 
                  value={clientForm.percentage}
                  onChange={(e) => setClientForm({...clientForm, percentage: e.target.value})}
                  data-testid="input-percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select 
                  value={clientForm.category}
                  onValueChange={(value) => setClientForm({...clientForm, category: value})}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input 
                  placeholder="Payment terms" 
                  className="input-styled rounded" 
                  value={clientForm.paymentTerms}
                  onChange={(e) => setClientForm({...clientForm, paymentTerms: e.target.value})}
                  data-testid="input-payment-terms"
                />
              </div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select 
                  value={clientForm.source}
                  onValueChange={(value) => setClientForm({...clientForm, source: value})}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outbound Lead (Sales)">Outbound Lead (Sales)</SelectItem>
                    <SelectItem value="Client Referral">Client Referral</SelectItem>
                    <SelectItem value="VC Referral">VC Referral</SelectItem>
                    <SelectItem value="Inbound Lead">Inbound Lead</SelectItem>
                    <SelectItem value="Other Referral">Other Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal input-styled rounded"
                      data-testid="button-start-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {clientStartDate ? format(clientStartDate, "PPP") : <span className="text-gray-500">Start Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={clientStartDate}
                      onSelect={(date) => {
                        setClientStartDate(date);
                        setClientForm({...clientForm, startDate: date ? format(date, "yyyy-MM-dd") : ''});
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 9 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select 
                  value={clientForm.currentStatus}
                  onValueChange={(value) => setClientForm({...clientForm, currentStatus: value})}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-current-status">
                    <SelectValue placeholder="Current Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div></div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-2 rounded"
                onClick={() => {
                  if (!clientForm.brandName || !clientForm.email || !clientForm.password) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in Brand Name, Email, and Password (required fields)",
                      variant: "destructive",
                    });
                    return;
                  }
                  createClientMutation.mutate(clientForm);
                }}
                disabled={createClientMutation.isPending}
                data-testid="button-submit-client"
              >
                {createClientMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}