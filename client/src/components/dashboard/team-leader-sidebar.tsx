import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const teamMembers = [
  {
    id: "sudharshanan",
    name: "Sudharshanan P",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    tenure: "3.5",
    closures: 18,
    status: "online",
    position: "Senior Recruiter",
    email: "sudharshanan.p@gumlat.com",
    age: 28,
    lastLogin: "2025-10-05 09:15 AM",
    lastClosure: "2025-10-03",
    department: "Recruitment",
    joiningDate: "2022-01-10",
    totalRevenue: "12,30,000",
    targetAchievement: 78,
    qtrsAchieved: 5,
    nextMilestone: "+2"
  },
  {
    id: "muthu",
    name: "Muthu Kumar",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    tenure: "2.8",
    closures: 15,
    status: "online",
    position: "Recruiter",
    email: "muthu.kumar@gumlat.com",
    age: 30,
    lastLogin: "2025-10-05 08:45 AM",
    lastClosure: "2025-10-02",
    department: "Recruitment",
    joiningDate: "2022-06-20",
    totalRevenue: "9,80,000",
    targetAchievement: 72,
    qtrsAchieved: 4,
    nextMilestone: "+2"
  },
  {
    id: "parthiban",
    name: "Parthiban S",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150",
    tenure: "2.2",
    closures: 12,
    status: "online",
    position: "Junior Recruiter",
    email: "parthiban.s@gumlat.com",
    age: 26,
    lastLogin: "2025-10-05 10:00 AM",
    lastClosure: "2025-10-01",
    department: "Recruitment",
    joiningDate: "2023-02-15",
    totalRevenue: "7,60,000",
    targetAchievement: 68,
    qtrsAchieved: 3,
    nextMilestone: "+1"
  },
  {
    id: "manikandan",
    name: "Manikandan R",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
    tenure: "1.5",
    closures: 8,
    status: "away",
    position: "Associate Recruiter",
    email: "manikandan.r@gumlat.com",
    age: 25,
    lastLogin: "2025-10-04 05:30 PM",
    lastClosure: "2025-09-28",
    department: "Recruitment",
    joiningDate: "2023-09-01",
    totalRevenue: "5,20,000",
    targetAchievement: 62,
    qtrsAchieved: 2,
    nextMilestone: "+1"
  }
];

export default function TeamLeaderSidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);

  const handleMemberClick = (member: typeof teamMembers[0]) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{height: 'calc(100vh - 4rem)'}}>
        <div className="h-full flex flex-col">
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Members</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs" data-testid="badge-members-count">
                  {teamMembers.length} members
                </Badge>
                {!isSearchOpen ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="h-8 w-8"
                    data-testid="button-search-toggle"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="h-8 w-8"
                    data-testid="button-search-close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {isSearchOpen && (
              <div className="mb-3">
                <Input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  data-testid="input-search-members"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="space-y-3">
              {filteredMembers.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="p-3 hover-elevate active-elevate-2 cursor-pointer transition-all bg-gray-50 dark:bg-gray-800"
                  onClick={() => handleMemberClick(member)}
                  data-testid={`card-team-member-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {member.position}
                      </p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <span className="text-green-500">●</span> {member.tenure}y
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {member.closures} closures
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No members found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                    <div className={`h-2 w-2 rounded-full ${
                      selectedMember.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                        {selectedMember.status === 'online' ? 'Active Now' : 'Away'}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900" data-testid="text-member-last-login">
                        {selectedMember.lastLogin}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Last Closure</p>
                    <p className="text-sm font-medium text-gray-900" data-testid="text-member-last-closure">
                      {selectedMember.lastClosure}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Tenure</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMember.tenure} Years
                    </p>
                  </div>
                </div>

                {/* General Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 pb-2 border-b">General details</h4>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-all" data-testid="text-member-email">
                      {selectedMember.email}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="text-sm font-medium text-gray-900" data-testid="text-member-age">
                      {selectedMember.age} Years
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Joined Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMember.joiningDate}
                    </p>
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
    </>
  );
}