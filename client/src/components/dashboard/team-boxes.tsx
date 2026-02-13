import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, TrendingUp, Hourglass, ChevronRight, ChevronLeft } from "lucide-react";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";
import { useQuery } from "@tanstack/react-query";
import { type Employee } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamLeader {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  age: string | number;
  department: string;
  joiningDate: string;
  reportingTo: string;
  members: number;
  tenure: string;
  qtrsAchieved: number;
  nextMilestone: string;
  totalClosures: number;
  targetAchievement: number;
  totalRevenue: string;
  role: string;
  image: string | null;
  lastLogin: string;
  lastClosure: string;
}

export default function TeamBoxes() {
  const [selectedMember, setSelectedMember] = useState<TeamLeader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch team leaders from the database
  const { data: teamLeaders = [], isLoading } = useQuery<TeamLeader[]>({
    queryKey: ['/api/admin/team-leaders']
  });

  // Fetch all employees to get team member details
  const { data: allEmployees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees']
  });

  const handleTeamBoxClick = (team: TeamLeader) => {
    setSelectedMember(team);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // Get team members (recruiters) for each team leader
  const getTeamMembers = (teamLeaderId: string) => {
    return allEmployees.filter(
      (emp: Employee) => emp.role === 'recruiter' && emp.reportingTo === teamLeaderId
    ).slice(0, 3); // Show max 3 avatars
  };

  // Parse tenure to get years
  const getTenureYears = (team: TeamLeader) => {
    const tenureMatch = team.tenure?.match(/(\d+)y/);
    return tenureMatch ? parseInt(tenureMatch[1]) : 3;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white border border-gray-200 flex-shrink-0 w-80">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show message if no team leaders exist
  if (teamLeaders.length === 0) {
    return (
      <div className="mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No team leaders found. Create a new team leader to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 relative">
        {/* Scroll buttons */}
        {teamLeaders.length > 4 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:bg-gray-100 rounded-full h-10 w-10"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:bg-gray-100 rounded-full h-10 w-10"
              onClick={scrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Horizontal scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teamLeaders.map((team, index) => {
            const teamMembers = getTeamMembers(team.employeeId);
            const remainingMembers = Math.max(0, team.members - 3);
            const qtrsAchieved = team.qtrsAchieved || 6;
            const nextMilestone = team.nextMilestone?.replace('+', '') || '3';
            const tenureYears = getTenureYears(team);

            return (
              <Card
                key={team.id}
                className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex-shrink-0 w-[340px] rounded-lg"
                onClick={() => handleTeamBoxClick(team)}
                data-testid={`card-team-${index}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Left: Profile Picture and Name/Role */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {team.image ? (
                          <img
                            src={team.image}
                            alt={team.name}
                            className="w-14 h-14 rounded-full object-cover"
                            data-testid={`img-team-avatar-${index}`}
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center"
                            data-testid={`img-team-avatar-${index}`}
                          >
                            <span className="text-lg font-bold text-blue-600">
                              {team.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Name and Role */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1" data-testid={`text-team-name-${index}`}>
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Team Leader</span>
                          <Crown className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                    </div>

                    {/* Right: Team Members */}
                    <div className="flex-shrink-0 ml-3">
                      <div className="flex -space-x-1.5 mb-1.5">
                        {teamMembers.map((member, idx) => (
                          <Avatar
                            key={member.id}
                            className="w-7 h-7 border-2 border-white"
                          >
                            <AvatarFallback className="bg-blue-500 text-white text-[10px]">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {remainingMembers > 0 && (
                          <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-white">
                            +{remainingMembers}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">Team Members</span>
                    </div>
                  </div>

                  {/* Three Metric Boxes */}
                  <div className="flex gap-2">
                    {/* Qtrs Achieved - Greenish Yellow */}
                    <div className="bg-yellow-100 rounded-lg px-2.5 py-2.5 flex-1 text-center relative min-w-0">
                      <Trophy className="h-4 w-4 text-gray-600 absolute top-1.5 left-1/2 -translate-x-1/2" />
                      <p className="text-xl font-bold text-gray-900 mt-3 mb-1">{qtrsAchieved}</p>
                      <p className="text-[10px] font-medium text-gray-600">Qtrs Achieved</p>
                    </div>

                    {/* Next Milestone - Light Orange */}
                    <div className="bg-orange-100 rounded-lg px-2.5 py-2.5 flex-1 text-center relative min-w-0">
                      <TrendingUp className="h-4 w-4 text-gray-600 absolute top-1.5 right-2" />
                      <p className="text-xl font-bold text-gray-900 mt-3 mb-1">{nextMilestone}</p>
                      <p className="text-[10px] font-medium text-gray-600">Next Milestone</p>
                    </div>

                    {/* Tenure - Light Blue */}
                    <div className="bg-blue-100 rounded-lg px-2.5 py-2.5 flex-1 text-center relative min-w-0">
                      <Hourglass className="h-4 w-4 text-gray-600 absolute top-1.5 right-2" />
                      <div className="mt-3 mb-1">
                        <span className="text-xl font-bold text-gray-900">{tenureYears}</span>
                        <span className="text-xs text-gray-600 ml-0.5">years</span>
                      </div>
                      <p className="text-[10px] font-medium text-gray-600">Tenure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation dots */}
        {teamLeaders.length > 4 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(teamLeaders.length / 4) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gray-300"
              />
            ))}
          </div>
        )}
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
            tenure: `${selectedMember.tenure} years`,
            totalClosures: selectedMember.totalClosures,
            quartersAchieved: selectedMember.qtrsAchieved,
            targetAchievement: selectedMember.targetAchievement,
            totalRevenue: selectedMember.totalRevenue,
            teamMembers: selectedMember.members
          }}
        />
      )}
    </>
  );
}
