import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, Target, Clock, TrendingUp, Users } from "lucide-react";
import PerformanceGauge from "./performance-gauge";

const teamLeader = {
  id: "arun-ks",
  name: "Arun KS",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
  members: 4,
  tenure: "4.3",
  qtrsAchieved: 6,
  nextMilestone: "+3",
  email: "arun.ks@gumlat.com",
  position: "Team Leader",
  department: "Recruitment",
  performanceScore: 77.8
};

const teamMembers = [
  {
    id: "sudharshanan",
    name: "Sudharshanan P",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    members: 0,
    tenure: "3.5",
    qtrsAchieved: 5,
    nextMilestone: "+2",
    email: "sudharshanan.p@gumlat.com",
    age: 28,
    closures: 18,
    status: "online",
    lastLogin: "2025-10-05 09:15 AM",
    lastClosure: "2025-10-03",
    position: "Senior Recruiter",
    department: "Recruitment",
    joiningDate: "2022-01-10",
    totalRevenue: "12,30,000",
    targetAchievement: 78
  },
  {
    id: "muthu",
    name: "Muthu Kumar",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    members: 0,
    tenure: "2.8",
    qtrsAchieved: 4,
    nextMilestone: "+2",
    email: "muthu.kumar@gumlat.com",
    age: 30,
    closures: 15,
    status: "online",
    lastLogin: "2025-10-05 08:45 AM",
    lastClosure: "2025-10-02",
    position: "Recruiter",
    department: "Recruitment",
    joiningDate: "2022-06-20",
    totalRevenue: "9,80,000",
    targetAchievement: 72
  },
  {
    id: "parthiban",
    name: "Parthiban S",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150",
    members: 0,
    tenure: "2.2",
    qtrsAchieved: 3,
    nextMilestone: "+1",
    email: "parthiban.s@gumlat.com",
    age: 26,
    closures: 12,
    status: "online",
    lastLogin: "2025-10-05 10:00 AM",
    lastClosure: "2025-10-01",
    position: "Junior Recruiter",
    department: "Recruitment",
    joiningDate: "2023-02-15",
    totalRevenue: "7,60,000",
    targetAchievement: 68
  },
  {
    id: "manikandan",
    name: "Manikandan R",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
    members: 0,
    tenure: "1.5",
    qtrsAchieved: 2,
    nextMilestone: "+1",
    email: "manikandan.r@gumlat.com",
    age: 25,
    closures: 8,
    status: "away",
    lastLogin: "2025-10-04 05:30 PM",
    lastClosure: "2025-09-28",
    position: "Associate Recruiter",
    department: "Recruitment",
    joiningDate: "2023-09-01",
    totalRevenue: "5,20,000",
    targetAchievement: 62
  }
];

export default function TeamLeaderTeamBoxes() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  
  const handleMemberClick = (member: typeof teamMembers[0]) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="mb-4">
      {/* Team Leader Profile Card */}
      <Card 
        className="bg-white border border-gray-200"
        data-testid="card-team-leader-profile"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left Section - Team Leader Info */}
            <div className="flex items-center gap-4 flex-1">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <img 
                  src={teamLeader.image} 
                  alt={teamLeader.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500"
                  data-testid="img-team-leader-avatar"
                />
              </div>

              {/* Team Leader Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-900" data-testid="text-team-leader-name">
                    {teamLeader.name}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs font-medium text-red-500 mb-1">Members</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-members-count">
                      {teamLeader.members}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-tenure">
                      {teamLeader.tenure} <span className="text-sm text-gray-500">years</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-qtrs-achieved">
                      {teamLeader.qtrsAchieved}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-next-milestone">
                      {teamLeader.nextMilestone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Performance Gauge */}
            <div className="flex-shrink-0">
              <PerformanceGauge value={teamLeader.performanceScore} size={180} />
            </div>
          </div>

          {/* Team Members Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-700">Team Members</h4>
              </div>
              <Badge variant="secondary" className="text-xs">
                {teamMembers.length} members
              </Badge>
            </div>

            {/* Horizontal Scrollable Team Members */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id}
                  onClick={() => handleMemberClick(member)}
                  className="flex-shrink-0 cursor-pointer hover-elevate active-elevate-2 rounded-lg p-3 border border-gray-200 bg-gray-50 transition-all"
                  data-testid={`card-team-member-${index}`}
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="relative">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.position}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-blue-600 font-medium">
                          {member.tenure}y
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {member.closures} closures
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Team Member Profile</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="relative">
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Badge 
                    className={`absolute -bottom-1 -right-1 ${
                      selectedMember.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    } text-white`}
                    data-testid="badge-member-status"
                  >
                    {selectedMember.status}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900" data-testid="text-member-name">{selectedMember.name}</h3>
                  <p className="text-lg text-gray-600" data-testid="text-member-position">{selectedMember.position}</p>
                  <p className="text-sm text-gray-500">{selectedMember.department}</p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Daily Activity */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 pb-2 border-b">Daily Activity</h4>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <Badge className="bg-green-100 text-green-800 text-xs mb-1">Active Now</Badge>
                      <p className="text-sm font-medium text-gray-900" data-testid="text-member-last-login">
                        {selectedMember.lastLogin}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Last Closure</p>
                      <p className="text-sm font-medium text-gray-900" data-testid="text-member-last-closure">
                        {selectedMember.lastClosure}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Tenure</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMember.tenure} Years
                      </p>
                    </div>
                  </div>
                </div>

                {/* General Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 pb-2 border-b">General details</h4>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 break-all" data-testid="text-member-email">
                        {selectedMember.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900" data-testid="text-member-age">
                        {selectedMember.age} <span className="text-gray-500 text-xs">Years</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Joined Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMember.joiningDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="bg-white p-6 rounded-lg text-center">
                  <p className="text-4xl font-bold text-gray-900" data-testid="text-member-closures">
                    {selectedMember.closures}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Closure Made</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg text-center">
                  <p className="text-4xl font-bold text-gray-900" data-testid="text-member-qtrs-achieved">
                    {selectedMember.qtrsAchieved}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Quarter Achieved</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
