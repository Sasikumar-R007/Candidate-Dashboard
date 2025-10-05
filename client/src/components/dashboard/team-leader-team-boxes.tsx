import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Calendar, Target, Clock, TrendingUp } from "lucide-react";

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
    totalRevenue: "₹12,30,000",
    targetAchievement: "78%"
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
    totalRevenue: "₹9,80,000",
    targetAchievement: "72%"
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
    totalRevenue: "₹7,60,000",
    targetAchievement: "68%"
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
    totalRevenue: "₹5,20,000",
    targetAchievement: "62%"
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
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Team Member Cards */}
      {teamMembers.map((member, index) => (
        <Card 
          key={member.id}
          className="bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200" 
          onClick={() => handleMemberClick(member)}
          data-testid={`card-team-member-${index}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
              </div>
              <div className="relative">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="text-center">
                <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                <p className="text-xl font-bold text-gray-900">
                  {member.tenure} <span className="text-sm text-gray-500">yrs</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
                <p className="text-xl font-bold text-gray-900">{member.qtrsAchieved}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-orange-500 mb-1">Closures</p>
                <p className="text-xl font-bold text-gray-900">{member.closures}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Team Member Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Team Member Profile</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
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

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium" data-testid="text-member-email">{selectedMember.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium" data-testid="text-member-age">{selectedMember.age} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Joining Date</p>
                      <p className="font-medium">{selectedMember.joiningDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Activity Information</h4>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium" data-testid="text-member-last-login">{selectedMember.lastLogin}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Last Closure</p>
                      <p className="font-medium" data-testid="text-member-last-closure">{selectedMember.lastClosure}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="font-medium">{selectedMember.tenure} years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Performance Metrics</h4>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600" data-testid="text-member-closures">{selectedMember.closures}</p>
                    <p className="text-sm text-gray-600">Total Closures</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedMember.qtrsAchieved}</p>
                    <p className="text-sm text-gray-600">Quarters Achieved</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedMember.targetAchievement}</p>
                    <p className="text-sm text-gray-600">Target Achievement</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedMember.totalRevenue}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}