import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, X, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Employee } from "@shared/schema";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    // Robust parsing: try to handle yyyy-mm-dd, mm/dd/yyyy, and ISO strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/ /g, '-'); // e.g., 04-May-2026
  } catch (e) {
    return 'N/A';
  }
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/,/g, '').replace(/ /g, (match, offset) => offset < 11 ? '-' : ' '); 
    // e.g., 04-May-2026 02:00 PM
  } catch (e) {
    return 'N/A';
  }
};

export default function TeamMembersSidebar() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch employees from database
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees']
  });

  // Fetch team performance data for recruiters
  const { data: teamPerformanceData = [] } = useQuery<Array<{
    id: string;
    talentAdvisor: string;
    joiningDate: string;
    tenure: string;
    closures: number;
    lastClosure: string;
    qtrsAchieved: number;
    targetAchievement: number;
    totalRevenue: string;
  }>>({
    queryKey: ['/api/admin/team-performance']
  });
  const { data: revenueMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/revenue-mappings']
  });

  // Map employees to team member format, using performance data from API
  // Filter to show only Talent Advisors (Recruiters)
  const teamMembers = useMemo(() => {
    return employees
      .filter(emp => emp.role === 'recruiter' || emp.role === 'talent_advisor') // Only show Talent Advisors (Recruiters)
      .map((emp) => {
        // Find performance data for this employee
        const performanceData = teamPerformanceData.find(
          perf => perf.id === emp.id || perf.talentAdvisor.toLowerCase() === emp.name.toLowerCase()
        );
        
        // Find Team Leader for Recruiters (only if reportingTo exists and matches a team_leader employee)
        let teamLeaderName: string | undefined;
        let teamLeaderId: string | undefined;
        
        if (emp.reportingTo && (emp.role === 'recruiter' || emp.role === 'talent_advisor')) {
          const teamLeader = employees.find(
            tl => tl.employeeId === emp.reportingTo && tl.role === 'team_leader'
          );
          if (teamLeader) {
            teamLeaderName = teamLeader.name;
            teamLeaderId = teamLeader.employeeId;
          }
        }

        // Calculate tenure
        let tenure = '0 years';
        if (emp.joiningDate) {
          try {
            const joinDate = new Date(emp.joiningDate);
            if (!isNaN(joinDate.getTime())) {
              const now = new Date();
              const years = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
              const months = Math.floor(((now.getTime() - joinDate.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
              tenure = years > 0 ? `${years} year${years > 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}` : `${months} month${months !== 1 ? 's' : ''}`;
            }
          } catch (e) {
            tenure = '0 years';
          }
        }

        // Get last login
        const lastLogin = formatDateTime(emp.lastLoginAt);
        
        const revenueFromMappings = revenueMappings
          .filter((rm: any) =>
            rm.talentAdvisorId === emp.id ||
            (rm.talentAdvisorName || '').toLowerCase() === emp.name.toLowerCase()
          )
          .reduce((sum: number, rm: any) => sum + (Number(rm.revenue) || 0), 0);

        const totalRevenueValue = Number(
          String(performanceData?.totalRevenue || '').replace(/[^0-9.-]/g, '')
        ) || revenueFromMappings;
        const formattedRevenue = `₹${Math.round(totalRevenueValue).toLocaleString('en-IN')}`;

        return {
          name: emp.name,
          salary: formattedRevenue,
          count: performanceData?.closures || 0,
          image: emp.profilePicture || null,
          role: emp.role === 'recruiter' ? 'Recruiter' : emp.role === 'team_leader' ? 'Team Leader' : emp.role === 'talent_advisor' ? 'Talent Advisor' : 'Client',
          department: emp.department || 'N/A',
          email: emp.email,
          age: emp.age || 0,
          joiningDate: formatDate(emp.joiningDate),
          lastLogin: lastLogin,
          lastClosure: performanceData?.lastClosure || 'N/A',
          tenure: performanceData?.tenure || tenure,
          totalClosures: performanceData?.closures || 0,
          quartersAchieved: performanceData?.qtrsAchieved || 0,
          targetAchievement: performanceData?.targetAchievement || 0,
          totalRevenue: totalRevenueValue.toLocaleString('en-IN'),
          teamLeaderName,
          teamLeaderId
        };
      });
  }, [employees, teamPerformanceData, revenueMappings]);

  // Filter team members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers;
    
    const query = searchQuery.toLowerCase();
    return teamMembers.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  return (
    <>
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{height: 'calc(100vh - 4rem)'}}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Members</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="h-8 w-8"
                data-testid="button-search-toggle"
              >
                {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isSearchOpen && (
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-search-users"
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading team members...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No team members found' : 'No team members available'}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredMembers.map((member, index) => {
              const isTeamLeader = member.role && member.role.includes('Leader');
              
              return (
              <div
                key={index}
                className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer border-b border-blue-100 dark:border-blue-900/20 ${
                  index === filteredMembers.length - 1 ? 'border-b-0' : ''
                }`}
                onClick={() => handleMemberClick(member)}
                data-testid={`card-member-${index}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Square profile picture with rounded corners */}
                    <div className="relative flex-shrink-0">
                      {member.image ? (
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-12 h-12 rounded-lg object-cover" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Star icon for team leaders */}
                      {isTeamLeader && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                          <Star className="h-3 w-3 text-yellow-900 fill-yellow-900" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {member.name}
                        </h4>
                        {isTeamLeader && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">(TL)</span>
                        )}
                      </div>
                      {member.salary && (
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">{member.salary}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {String(member.count || 0).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>

    {selectedMember && (
      <TeamMemberProfileModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        member={{
          name: selectedMember.name,
          role: selectedMember.role,
          department: selectedMember.department,
          image: selectedMember.image,
          email: selectedMember.email,
          age: selectedMember.age,
          joiningDate: selectedMember.joiningDate,
          lastLogin: selectedMember.lastLogin,
          lastClosure: selectedMember.lastClosure,
          tenure: selectedMember.tenure,
          totalClosures: selectedMember.totalClosures,
          quartersAchieved: selectedMember.quartersAchieved,
          targetAchievement: selectedMember.targetAchievement,
          totalRevenue: selectedMember.totalRevenue,
          teamLeaderName: selectedMember.teamLeaderName,
          teamLeaderId: selectedMember.teamLeaderId
        }}
      />
    )}
    </>
  );
}