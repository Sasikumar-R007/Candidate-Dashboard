import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, Target, Clock, TrendingUp } from "lucide-react";

const team = {
  name: "Arun KS",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
  members: 4,
  tenure: "4.3",
  qtrsAchieved: 6,
  nextMilestone: "+3",
  // Extended profile details
  email: "arun.ks@gumlat.com",
  age: 32,
  closures: 24,
  status: "online",
  lastLogin: "2025-09-22 09:30 AM",
  lastClosure: "2025-09-20",
  position: "Team Leader",
  department: "Recruitment",
  joiningDate: "2021-04-15",
  totalRevenue: "₹18,50,000",
  targetAchievement: "85%"
};

export default function TeamLeaderTeamBoxes() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Team Details Card - Image 1 */}
      <Card 
        className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200" 
        onClick={() => setIsProfileModalOpen(true)}
        data-testid="card-team-member"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {team.name}
              </h3>
            </div>
            <div className="relative">
              <img 
                src={team.image} 
                alt={team.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                team.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-center">
              <p className="text-xs font-medium text-red-500 mb-1">Members</p>
              <p className="text-xl font-bold text-gray-900">{team.members}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
              <p className="text-xl font-bold text-gray-900">
                {team.tenure} <span className="text-sm text-gray-500">years</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
              <p className="text-xl font-bold text-gray-900">{team.qtrsAchieved}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
              <p className="text-xl font-bold text-gray-900">{team.nextMilestone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Gauge Card - Image 2 */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="w-full h-20">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Background arc */}
              <path d="M 20 90 A 80 80 0 0 1 180 90" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
              
              {/* Colored segments */}
              <path d="M 20 90 A 80 80 0 0 0 60 40" stroke="#ef4444" strokeWidth="8" fill="none"/>
              <path d="M 60 40 A 80 80 0 0 0 100 20" stroke="#eab308" strokeWidth="8" fill="none"/>
              <path d="M 100 20 A 80 80 0 0 0 140 40" stroke="#22c55e" strokeWidth="8" fill="none"/>
              <path d="M 140 40 A 80 80 0 0 0 180 90" stroke="#3b82f6" strokeWidth="8" fill="none"/>
              
              {/* Needle */}
              <line x1="100" y1="90" x2="150" y2="50" stroke="#1f2937" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="100" cy="90" r="4" fill="#1f2937"/>
              
              {/* Labels */}
              <text x="30" y="85" fontSize="8" fill="#6b7280" textAnchor="middle">SLIM</text>
              <text x="70" y="35" fontSize="8" fill="#6b7280" textAnchor="middle">FAIR</text>
              <text x="130" y="35" fontSize="8" fill="#6b7280" textAnchor="middle">GOOD</text>
              <text x="170" y="85" fontSize="8" fill="#6b7280" textAnchor="middle">EXCELLENT</text>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Team Member Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="relative">
                <img 
                  src={team.image} 
                  alt={team.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <Badge 
                  className={`absolute -bottom-1 -right-1 ${
                    team.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  } text-white`}
                  data-testid="badge-member-status"
                >
                  {team.status}
                </Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-member-name">{team.name}</h3>
                <p className="text-lg text-gray-600" data-testid="text-member-position">{team.position}</p>
                <p className="text-sm text-gray-500">{team.department}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium" data-testid="text-member-email">{team.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium" data-testid="text-member-age">{team.age} years</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="font-medium">{team.joiningDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Activity Information</h4>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium" data-testid="text-member-last-login">{team.lastLogin}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Closure</p>
                    <p className="font-medium" data-testid="text-member-last-closure">{team.lastClosure}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tenure</p>
                    <p className="font-medium">{team.tenure} years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Performance Metrics</h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600" data-testid="text-member-closures">{team.closures}</p>
                  <p className="text-sm text-gray-600">Total Closures</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{team.qtrsAchieved}</p>
                  <p className="text-sm text-gray-600">Quarters Achieved</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{team.targetAchievement}</p>
                  <p className="text-sm text-gray-600">Target Achievement</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{team.totalRevenue}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Team Leadership</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Team Members</p>
                    <p className="text-xl font-bold text-gray-900">{team.members}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Milestone</p>
                    <p className="text-xl font-bold text-gray-900">{team.nextMilestone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}