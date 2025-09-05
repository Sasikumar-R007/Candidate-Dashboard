import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Pause } from "lucide-react";

export default function ClientDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');

  // Sample data for the dashboard
  const dashboardStats = {
    rolesAssigned: 15,
    totalPositions: 6,
    activeRoles: 5,
    successfulHires: 3,
    pausedRoles: 1,
    withdrawnRoles: 1
  };

  const rolesData = [
    {
      roleId: 'STCL12JD13',
      role: 'Full Stack Engineer',
      team: 'Arun',
      recruiter: 'Umar',
      sharedOn: '12-10-2025',
      status: 'Active',
      profilesShared: 6,
      lastActive: '12-09-2025'
    },
    {
      roleId: 'STCL12JD14',
      role: 'Data Scientist',
      team: 'Anusha',
      recruiter: 'Keerthana',
      sharedOn: '18-11-2025',
      status: 'Paused',
      profilesShared: 3,
      lastActive: '14-10-2025'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'Withdrawn':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderMainContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-6 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Roles Assigned</div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{dashboardStats.rolesAssigned}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Positions</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardStats.totalPositions}</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Active Roles</div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">{dashboardStats.activeRoles}</div>
                </CardContent>
              </Card>

              <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">Successful Hires</div>
                  <div className="text-3xl font-bold text-teal-900 dark:text-teal-100">{dashboardStats.successfulHires}</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Pause className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Paused Roles</div>
                  <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{dashboardStats.pausedRoles}</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Withdrawn Roles</div>
                  <div className="text-3xl font-bold text-red-900 dark:text-red-100">{dashboardStats.withdrawnRoles}</div>
                </CardContent>
              </Card>
            </div>

            {/* Roles & Status Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Roles & Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Role ID</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Roles</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Team</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Recruiter</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Shared on</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Profiles Shared</th>
                        <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesData.map((role, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3 text-gray-900 dark:text-white font-medium text-sm">{role.roleId}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{role.role}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{role.team}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{role.recruiter}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{role.sharedOn}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(role.status)}
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                                {role.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm text-center">{role.profilesShared}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{role.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* JD Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">JD Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Drag & Drop Upload */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & Drop A file here or Click to Browse</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Supported PDF, Docx</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Max File Size 5MB</p>
                  </div>

                  {/* Copy & Paste */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Copy & Paste Or Write Your Own JD</p>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Skills</label>
                    <Input 
                      placeholder="Enter here..." 
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Skills</label>
                    <Input 
                      placeholder="Enter here..." 
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Knowledge Only</label>
                    <Input 
                      placeholder="Enter here..." 
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Instructions</label>
                  <Input 
                    placeholder="" 
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8">
                    Preview & Submit
                  </Button>
                  <Button className="bg-cyan-400 hover:bg-cyan-500 text-black px-8">
                    Chat Box
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Requirements Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Requirements management content will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'reports':
        return (
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Reports and analytics content will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Client Portal</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gumlet Marketing Private Limited</p>
        </div>
        
        <nav className="p-6">
          <div className="space-y-2">
            <button
              onClick={() => setSidebarTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                sidebarTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid="sidebar-dashboard"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5" />
                Dashboard
              </div>
            </button>

            <button
              onClick={() => setSidebarTab('requirements')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                sidebarTab === 'requirements' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid="sidebar-requirements"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Requirements
              </div>
            </button>

            <button
              onClick={() => setSidebarTab('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                sidebarTab === 'reports' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid="sidebar-reports"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Reports
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
}