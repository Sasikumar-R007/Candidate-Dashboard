import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Filter, Search, Upload } from "lucide-react";

export default function MasterDatabase() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Sample data for different database sections
  const resumeDatabase = [
    { id: 1, candidateName: "Aarav Sharma", position: "Frontend Developer", experience: "3 years", skills: "React, JavaScript, CSS", status: "Active", uploadDate: "2025-08-15" },
    { id: 2, candidateName: "Arjun Patel", position: "UI/UX Designer", experience: "2 years", skills: "Figma, Sketch, Adobe XD", status: "Screening", uploadDate: "2025-08-14" },
    { id: 3, candidateName: "Shaurya Kumar", position: "Backend Developer", experience: "4 years", skills: "Node.js, Python, MongoDB", status: "Interview", uploadDate: "2025-08-13" },
    { id: 4, candidateName: "Vihaan Singh", position: "QA Tester", experience: "2 years", skills: "Selenium, Cypress, Jest", status: "Selected", uploadDate: "2025-08-12" },
    { id: 5, candidateName: "Aditya Verma", position: "Mobile Developer", experience: "3 years", skills: "React Native, Flutter", status: "Rejected", uploadDate: "2025-08-11" },
  ];

  const candidateDetails = [
    { id: 1, name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 9876543210", location: "Mumbai", currentStatus: "In-Process", appliedOn: "06-06-2025", company: "TechCorp" },
    { id: 2, name: "Arjun Patel", email: "arjun@example.com", phone: "+91 9876543211", location: "Delhi", currentStatus: "Shortlisted", appliedOn: "08-06-2025", company: "Designify" },
    { id: 3, name: "Shaurya Kumar", email: "shaurya@example.com", phone: "+91 9876543212", location: "Bangalore", currentStatus: "Interview", appliedOn: "20-06-2025", company: "CodeLabs" },
    { id: 4, name: "Vihaan Singh", email: "vihaan@example.com", phone: "+91 9876543213", location: "Pune", currentStatus: "Selected", appliedOn: "01-07-2025", company: "AppLogic" },
    { id: 5, name: "Aditya Verma", email: "aditya@example.com", phone: "+91 9876543214", location: "Hyderabad", currentStatus: "Rejected", appliedOn: "23-07-2025", company: "Bug Catchers" },
  ];

  const employeesDatabase = [
    { id: 1, employeeId: "STTA001", name: "Priya Sharma", role: "Talent Advisor", department: "Recruitment", joiningDate: "01-04-2023", status: "Active", email: "priya@company.com" },
    { id: 2, employeeId: "STTA002", name: "Amit Kumar", role: "Talent Advisor", department: "Recruitment", joiningDate: "15-03-2023", status: "Active", email: "amit@company.com" },
    { id: 3, employeeId: "STTL001", name: "Kumaravel R", role: "Team Leader", department: "Recruitment", joiningDate: "10-02-2023", status: "Active", email: "kumaravel@company.com" },
    { id: 4, employeeId: "STCL001", name: "Rajesh Mehta", role: "Client Manager", department: "Client Relations", joiningDate: "20-01-2023", status: "Active", email: "rajesh@company.com" },
    { id: 5, employeeId: "STTA003", name: "Sowmiya Ravi", role: "Talent Advisor", department: "Recruitment", joiningDate: "05-05-2023", status: "On Leave", email: "sowmiya@company.com" },
  ];

  const requirementsDatabase = [
    { id: 1, position: "Frontend Developer", criticality: "HIGH", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Priya Sharma", status: "Active", createdAt: "2025-08-01" },
    { id: 2, position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Amit Kumar", status: "Interview", createdAt: "2025-08-02" },
    { id: 3, position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Sowmiya Ravi", status: "Screening", createdAt: "2025-08-03" },
    { id: 4, position: "QA Tester", criticality: "MEDIUM", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Priya Sharma", status: "Offer", createdAt: "2025-08-04" },
    { id: 5, position: "Mobile Developer", criticality: "HIGH", company: "Bug Catchers", spoc: "Mel Gibson", talentAdvisor: "Amit Kumar", status: "Active", createdAt: "2025-08-05" },
  ];

  const interviewsDatabase = [
    { id: 1, candidateName: "Aarav Sharma", position: "Frontend Developer", client: "TechCorp", interviewDate: "2025-08-20", interviewTime: "10:00 AM", type: "Video Call", round: "L1", status: "Scheduled" },
    { id: 2, candidateName: "Arjun Patel", position: "UI/UX Designer", client: "Designify", interviewDate: "2025-08-21", interviewTime: "2:00 PM", type: "Phone Call", round: "HR", status: "Completed" },
    { id: 3, candidateName: "Shaurya Kumar", position: "Backend Developer", client: "CodeLabs", interviewDate: "2025-08-22", interviewTime: "11:00 AM", type: "In Person", round: "L2", status: "Scheduled" },
    { id: 4, candidateName: "Vihaan Singh", position: "QA Tester", client: "AppLogic", interviewDate: "2025-08-19", interviewTime: "3:00 PM", type: "Video Call", round: "Final", status: "Completed" },
    { id: 5, candidateName: "Aditya Verma", position: "Mobile Developer", client: "Bug Catchers", interviewDate: "2025-08-23", interviewTime: "9:00 AM", type: "Phone Call", round: "L1", status: "Cancelled" },
  ];

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
              onClick={() => setLocation('/recruiter-dashboard-2')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Master Database</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-export-data">
              <Download size={16} />
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-import-data">
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
          <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-advanced-filter">
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
    </div>
  );
}