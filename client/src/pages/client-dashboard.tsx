import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, FileText, Clock, CheckCircle, XCircle, Pause, User, MapPin, HandHeart, Upload, Edit3, MessageSquare, Minus, Users, Play, Trophy, ArrowLeft, Send } from "lucide-react";

interface ChatUser {
  id: number;
  name: string;
  requirements: number;
  closures: number;
  avatar: string;
  status: string;
}

export default function ClientDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [chatView, setChatView] = useState<'list' | 'chat'>('list');
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');

  // Sample data for the dashboard
  const dashboardStats = {
    rolesAssigned: 15,
    totalPositions: 6,
    activeRoles: 5,
    successfulHires: 3,
    pausedRoles: 1,
    withdrawnRoles: 1
  };

  // Recent chats data
  const recentChats: ChatUser[] = [
    {
      id: 1,
      name: 'Deepika',
      requirements: 5,
      closures: 6,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    },
    {
      id: 2,
      name: 'Priyanka',
      requirements: 7,
      closures: 12,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    },
    {
      id: 3,
      name: 'Thamarai Selvi',
      requirements: 3,
      closures: 7,
      avatar: '/api/placeholder/40/40',
      status: 'online'
    }
  ];

  const allRolesData = [
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
    },
    {
      roleId: 'STCL12JD15',
      role: 'Frontend Developer',
      team: 'Arun',
      recruiter: 'Priya',
      sharedOn: '15-11-2025',
      status: 'Active',
      profilesShared: 8,
      lastActive: '16-11-2025'
    },
    {
      roleId: 'STCL12JD16',
      role: 'DevOps Engineer',
      team: 'Anusha',
      recruiter: 'Raj',
      sharedOn: '20-11-2025',
      status: 'Withdrawn',
      profilesShared: 2,
      lastActive: '21-11-2025'
    },
    {
      roleId: 'STCL12JD17',
      role: 'UI/UX Designer',
      team: 'Arun',
      recruiter: 'Maya',
      sharedOn: '22-11-2025',
      status: 'Active',
      profilesShared: 4,
      lastActive: '23-11-2025'
    },
    {
      roleId: 'STCL12JD18',
      role: 'Backend Developer',
      team: 'Anusha',
      recruiter: 'Kiran',
      sharedOn: '25-11-2025',
      status: 'Paused',
      profilesShared: 5,
      lastActive: '26-11-2025'
    }
  ];

  // Only show top 2 roles in dashboard
  const rolesData = allRolesData.slice(0, 2);

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
          <div className="h-full overflow-y-auto">
            {/* Company Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">Gumlet Marketing Private Limited</h1>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Stats Cards - Dark Blue Theme */}
              <div className="bg-slate-700 rounded-lg p-6">
                <div className="grid grid-cols-6 gap-6 text-white">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Briefcase className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Roles Assigned</div>
                    <div className="text-2xl font-bold">{dashboardStats.rolesAssigned}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Total Positions</div>
                    <div className="text-2xl font-bold">{dashboardStats.totalPositions}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Play className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Active Roles</div>
                    <div className="text-2xl font-bold">{dashboardStats.activeRoles}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-green-300" />
                    </div>
                    <div className="text-sm font-medium mb-1 text-green-300">Successful Hires</div>
                    <div className="text-2xl font-bold text-green-300">{dashboardStats.successfulHires}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Pause className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium mb-1">Paused Roles</div>
                    <div className="text-2xl font-bold">{dashboardStats.pausedRoles}</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Minus className="h-8 w-8 text-orange-300" />
                    </div>
                    <div className="text-sm font-medium mb-1 text-orange-300">Withdrawn Roles</div>
                    <div className="text-2xl font-bold text-orange-300">{dashboardStats.withdrawnRoles}</div>
                  </div>
                </div>
              </div>

              {/* Roles & Status Table */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Roles & Status</h3>
                  <button 
                    onClick={() => setIsRolesModalOpen(true)}
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shared on</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles Shared</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rolesData.map((role, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.team}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.recruiter}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.sharedOn}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                              {role.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{role.profilesShared}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JD Upload Section */}
              <div className="bg-white rounded border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">JD Upload</h3>
                  <span className="text-red-500 text-sm">●</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Drag & Drop Upload - Minimized */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32">
                        <div className="mb-2">
                          <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Drag & Drop A file here or Click to Browse</p>
                        <p className="text-xs text-gray-500 mb-1">Supported PDF,Docx</p>
                        <p className="text-xs text-gray-500">Max File Size 5MB</p>
                        {uploadedFile && (
                          <p className="text-xs text-green-600 mt-2 font-medium">
                            {uploadedFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Copy & Paste - Minimized */}
                    <div className="relative">
                      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center h-32 flex flex-col justify-center">
                        <div className="mb-2">
                          <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Edit3 className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Copy & Paste Or Write Your Own JD</p>
                        <textarea
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          placeholder="Paste JD content here..."
                          className="mt-2 w-full h-16 text-xs border border-gray-200 rounded p-2 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skills</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Skills</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Only</label>
                      <Input 
                        placeholder="Enter here..." 
                        className="bg-white border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <Input 
                      placeholder="" 
                      className="bg-white border-gray-300 rounded"
                    />
                  </div>
                  
                  {/* Preview & Submit Button */}
                  <div className="flex justify-end">
                    <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-8 py-2 rounded">
                      Preview & Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Dark Blue Theme */}
      <div className="w-16 bg-slate-700 flex flex-col items-center py-6 space-y-6">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-slate-700 font-bold text-lg">X</span>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => setSidebarTab('dashboard')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'dashboard' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <User className="h-6 w-6 text-white" />
          </button>
          
          <button 
            onClick={() => setSidebarTab('requirements')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'requirements' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <MapPin className="h-6 w-6 text-white" />
          </button>
          
          <button 
            onClick={() => setSidebarTab('reports')}
            className={`p-3 rounded-lg transition-colors ${
              sidebarTab === 'reports' ? 'bg-slate-600' : 'hover:bg-slate-600'
            }`}
          >
            <HandHeart className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Middle Section */}
        <div className="flex-1 bg-white">
          {renderMainContent()}
        </div>
        
        {/* Right Sidebar - Chats */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {chatView === 'list' ? (
            // Chat List View
            <>
              {/* Recent Chats Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Recent Chats</h3>
              </div>
              
              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {recentChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setActiveChatUser(chat);
                      setChatView('chat');
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={chat.avatar} alt={chat.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {chat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.status === 'online' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{chat.name}</h4>
                          <span className="text-lg font-bold text-gray-900">{chat.closures}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">{chat.requirements} Requirements</p>
                          <span className="text-xs text-gray-400">Closures</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chat Box Button */}
              <div className="p-4 border-t border-gray-200">
                <Button 
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-3 rounded"
                  onClick={() => setChatView('chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Box
                </Button>
              </div>
            </>
          ) : (
            // Chat Interface View
            <>
              {/* Chat Header */}
              <div className="bg-cyan-400 p-4 flex items-center">
                <button 
                  onClick={() => setChatView('list')}
                  className="mr-3 p-1 hover:bg-cyan-300 rounded"
                >
                  <ArrowLeft className="h-5 w-5 text-black" />
                </button>
                <MessageSquare className="h-5 w-5 text-black mr-2" />
                <span className="text-black font-medium">Chat Box</span>
              </div>
              
              {activeChatUser && (
                <div className="bg-cyan-100 p-3 border-b border-cyan-200 flex items-center">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src={activeChatUser.avatar} alt={activeChatUser.name} />
                    <AvatarFallback className="bg-cyan-200 text-cyan-700 text-sm">
                      {activeChatUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{activeChatUser.name}</h4>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-600">Online</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Sample Messages */}
                <div className="flex justify-end">
                  <div className="bg-cyan-400 text-black px-4 py-2 rounded-lg max-w-xs">
                    Hello! How can I help you today?
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    Hi, I need some information about the job requirements.
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-cyan-400 text-black px-4 py-2 rounded-lg max-w-xs">
                    Sure! I'd be happy to help. What specific details do you need?
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    Can you tell me about the experience required?
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-cyan-400 text-black px-4 py-2 rounded-lg max-w-xs">
                    The position requires 3-5 years of experience in full-stack development.
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    Thank you for the information!
                  </div>
                </div>
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Type a message here"
                    className="flex-1 border-gray-300 rounded"
                  />
                  <Button className="bg-cyan-400 hover:bg-cyan-500 text-black p-2 rounded">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Roles Modal */}
      <Dialog open={isRolesModalOpen} onOpenChange={setIsRolesModalOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Roles & Status</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Shared on</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profiles Shared</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allRolesData.map((role, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.roleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.recruiter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.sharedOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(role.status)}`}>
                        {role.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{role.profilesShared}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}