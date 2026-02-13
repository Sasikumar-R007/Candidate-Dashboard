import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  salary: string;
  year: string;
  profilesCount: string;
  position?: string;
  department?: string;
  joiningDate?: string;
  tenure?: string;
  closures?: number;
  status?: string;
  profilePicture?: string | null;
}

export default function TeamLeaderSidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data: teamMembersData = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-leader/team-members'],
  });

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  const filteredMembers = teamMembersData.filter((member: TeamMember) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{height: 'calc(100vh - 4rem)'}}>
        <div className="h-full flex flex-col">
          <div className="p-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Members</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                data-testid="input-search-members"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredMembers.map((member: TeamMember, index: number) => {
                  const isTeamLead = member.position?.includes('Leader') || member.position?.includes('TL');
                  const memberSalary = member.salary || "0";
                  const memberYear = member.year || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
                  const memberCount = member.profilesCount || member.closures || 0;
                  
                  return (
                    <div
                      key={member.id || index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                      data-testid={`card-team-member-${index}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Square profile picture with rounded corners */}
                        <div className="relative flex-shrink-0">
                          {member.profilePicture ? (
                            <img 
                              src={member.profilePicture} 
                              alt={member.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* TL indicator */}
                          {isTeamLead && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                              <span className="text-[8px] font-bold text-yellow-900">TL</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Member Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                              {member.name}
                            </h4>
                            {isTeamLead && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">(TL)</span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">
                            ₹{memberSalary.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{memberYear}</p>
                        </div>
                      </div>
                      
                      {/* Count */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {String(memberCount).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {filteredMembers.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">
                      {teamMembersData.length === 0 
                        ? "No team members assigned yet" 
                        : "No members found"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Team Member Profile</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="relative">
                  {selectedMember.profilePicture ? (
                    <img 
                      src={selectedMember.profilePicture} 
                      alt={selectedMember.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-blue-600 dark:text-blue-300 font-bold text-2xl">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <Badge 
                    className={`absolute -bottom-1 -right-1 ${
                      selectedMember.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    } text-white`}
                    data-testid="badge-member-status"
                  >
                    {selectedMember.status || 'offline'}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-member-name">{selectedMember.name}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300" data-testid="text-member-position">{selectedMember.position || 'Recruiter'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMember.department || 'Recruitment'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b dark:border-gray-700">Performance</h4>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMember.salary}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profiles Handled</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMember.profilesCount} profiles
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMember.year}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b dark:border-gray-700">General Details</h4>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all" data-testid="text-member-email">
                      {selectedMember.email || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Joined Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMember.joiningDate || '-'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tenure</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMember.tenure || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="text-member-profiles">
                    {selectedMember.profilesCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Profiles</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="text-member-closures">
                    {selectedMember.closures || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Closures Made</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}