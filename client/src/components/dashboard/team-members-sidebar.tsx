import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Employee } from "@shared/schema";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";

const hardcodedTeamMembers = [
  { 
    name: "Deepika", 
    salary: "3,50,000 INR", 
    year: "2024-2025", 
    count: 6, 
    image: "https://images.unsplash.com/photo-1494790108755-2616c0763c52?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "deepika@scaling.com",
    age: 28,
    joiningDate: "2024-01-15",
    lastLogin: "2025-10-03 09:30 AM",
    lastClosure: "2025-10-02",
    tenure: "1.8 years",
    totalClosures: 6,
    quartersAchieved: 2,
    targetAchievement: 75,
    totalRevenue: "8,50,000"
  },
  { 
    name: "Priyanka", 
    salary: "4,30,000 INR", 
    year: "2023-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "priyanka@scaling.com",
    age: 30,
    joiningDate: "2023-01-10",
    lastLogin: "2025-10-03 08:15 AM",
    lastClosure: "2025-10-01",
    tenure: "2.8 years",
    totalClosures: 12,
    quartersAchieved: 3,
    targetAchievement: 82,
    totalRevenue: "14,30,000"
  },
  { 
    name: "Thamarai Selvi", 
    salary: "1,00,000 INR", 
    year: "2022-2025", 
    count: 7, 
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "thamarai@scaling.com",
    age: 26,
    joiningDate: "2022-06-20",
    lastLogin: "2025-10-03 10:00 AM",
    lastClosure: "2025-10-02",
    tenure: "3.3 years",
    totalClosures: 7,
    quartersAchieved: 2,
    targetAchievement: 70,
    totalRevenue: "9,00,000"
  },
  { 
    name: "Kavya", 
    salary: "5,50,000 INR", 
    year: "2020-2025", 
    count: 2, 
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "kavya@scaling.com",
    age: 32,
    joiningDate: "2020-03-15",
    lastLogin: "2025-10-03 07:45 AM",
    lastClosure: "2025-09-30",
    tenure: "5.6 years",
    totalClosures: 2,
    quartersAchieved: 1,
    targetAchievement: 65,
    totalRevenue: "4,50,000"
  },
  { 
    name: "Karthikayan", 
    salary: "3,00,000 INR", 
    year: "2024-2025", 
    count: 11, 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "karthik@scaling.com",
    age: 27,
    joiningDate: "2024-02-10",
    lastLogin: "2025-10-03 08:30 AM",
    lastClosure: "2025-10-02",
    tenure: "1.7 years",
    totalClosures: 11,
    quartersAchieved: 2,
    targetAchievement: 88,
    totalRevenue: "12,00,000"
  },
  { 
    name: "Vishnu Priya", 
    salary: "4,60,000 INR", 
    year: "2019-2025", 
    count: 3, 
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "vishnu@scaling.com",
    age: 31,
    joiningDate: "2019-05-20",
    lastLogin: "2025-10-03 09:00 AM",
    lastClosure: "2025-10-01",
    tenure: "6.4 years",
    totalClosures: 3,
    quartersAchieved: 1,
    targetAchievement: 60,
    totalRevenue: "5,60,000"
  },
  { 
    name: "Helen", 
    salary: "5,50,000 INR", 
    year: "2012-2025", 
    count: 10, 
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "helen@scaling.com",
    age: 35,
    joiningDate: "2012-08-15",
    lastLogin: "2025-10-03 08:00 AM",
    lastClosure: "2025-10-02",
    tenure: "13.2 years",
    totalClosures: 10,
    quartersAchieved: 3,
    targetAchievement: 85,
    totalRevenue: "15,50,000"
  },
  { 
    name: "Kevin", 
    salary: "2,00,000 INR", 
    year: "2023-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    role: "Junior Recruiter",
    department: "Recruitment",
    email: "kevin@scaling.com",
    age: 25,
    joiningDate: "2023-09-10",
    lastLogin: "2025-10-03 09:15 AM",
    lastClosure: "2025-10-02",
    tenure: "2.1 years",
    totalClosures: 12,
    quartersAchieved: 2,
    targetAchievement: 90,
    totalRevenue: "13,20,000"
  },
  { 
    name: "Thrisha", 
    salary: "3,50,000 INR", 
    year: "2021-2025", 
    count: 6, 
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "thrisha@scaling.com",
    age: 29,
    joiningDate: "2021-11-05",
    lastLogin: "2025-10-03 07:30 AM",
    lastClosure: "2025-10-01",
    tenure: "3.9 years",
    totalClosures: 6,
    quartersAchieved: 2,
    targetAchievement: 72,
    totalRevenue: "8,80,000"
  },
  { 
    name: "Megna", 
    salary: "8,30,000 INR", 
    year: "2020-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "megna@scaling.com",
    age: 33,
    joiningDate: "2020-04-12",
    lastLogin: "2025-10-03 08:45 AM",
    lastClosure: "2025-10-02",
    tenure: "5.5 years",
    totalClosures: 12,
    quartersAchieved: 4,
    targetAchievement: 92,
    totalRevenue: "18,30,000"
  }
];

export default function TeamMembersSidebar() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch employees from database
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees']
  });

  // Map employees to team member format, merging with hardcoded data where available
  const teamMembers = useMemo(() => {
    return employees
      .filter(emp => emp.role !== 'admin') // Exclude admin users
      .map((emp) => {
        // Try to find matching hardcoded member by name
        const hardcodedMatch = hardcodedTeamMembers.find(
          hm => hm.name.toLowerCase() === emp.name.toLowerCase()
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
        
        // If match found, use hardcoded detailed data; otherwise use defaults
        return {
          name: emp.name,
          salary: hardcodedMatch?.salary || "0 INR",
          year: hardcodedMatch?.year || new Date().getFullYear().toString(),
          count: hardcodedMatch?.count || 0,
          image: hardcodedMatch?.image || null,
          role: hardcodedMatch?.role || (emp.role === 'recruiter' ? 'Recruiter' : emp.role === 'team_leader' ? 'Team Leader' : emp.role === 'talent_advisor' ? 'Talent Advisor' : 'Client'),
          department: hardcodedMatch?.department || emp.department || 'N/A',
          email: emp.email,
          age: hardcodedMatch?.age || 0,
          joiningDate: hardcodedMatch?.joiningDate || emp.joiningDate || 'N/A',
          lastLogin: hardcodedMatch?.lastLogin || 'N/A',
          lastClosure: hardcodedMatch?.lastClosure || 'N/A',
          tenure: hardcodedMatch?.tenure || '0 years',
          totalClosures: hardcodedMatch?.totalClosures || 0,
          quartersAchieved: hardcodedMatch?.quartersAchieved || 0,
          targetAchievement: hardcodedMatch?.targetAchievement || 0,
          totalRevenue: hardcodedMatch?.totalRevenue || "0",
          teamLeaderName,
          teamLeaderId
        };
      });
  }, [employees]);

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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Users</h3>
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
                placeholder="Search users..."
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
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found' : 'No users available'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member, index) => {
              const isEven = index % 2 === 0;
              
              return (
              <Card 
                key={index} 
                className={`p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                  isEven 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleMemberClick(member)}
                data-testid={`card-member-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 rounded-sm">
                      <AvatarFallback className="rounded-sm bg-blue-600 text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {member.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {member.role}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {member.count}
                    </span>
                  </div>
                </div>
              </Card>
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