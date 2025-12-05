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
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Members</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs" data-testid="badge-members-count">
                  {teamMembersData.length} members
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member: TeamMember, index: number) => (
                  <Card 
                    key={member.id} 
                    className="p-3 hover-elevate active-elevate-2 cursor-pointer transition-all bg-gray-50 dark:bg-gray-800"
                    onClick={() => handleMemberClick(member)}
                    data-testid={`card-team-member-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {member.profilePicture ? (
                          <img 
                            src={member.profilePicture} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {member.position || 'Recruiter'}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            <span className="text-green-500">&#9679;</span> {member.profilesCount} profiles
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {member.salary}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
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