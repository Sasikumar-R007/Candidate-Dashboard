import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch team leaders from the database
  const { data: teamLeaders = [], isLoading } = useQuery<TeamLeader[]>({
    queryKey: ['/api/admin/team-leaders']
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no team leaders exist
  if (teamLeaders.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-6 mb-6">
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
      <div className="grid grid-cols-2 gap-6 mb-6">
        {teamLeaders.map((team, index) => (
          <Card 
            key={team.id} 
            className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleTeamBoxClick(team)}
            data-testid={`card-team-${index}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-team-name-${index}`}>
                    {team.name}
                  </h3>
                </div>
                {team.image ? (
                  <img 
                    src={team.image} 
                    alt={team.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    data-testid={`img-team-avatar-${index}`}
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-semibold"
                    data-testid={`img-team-avatar-${index}`}
                  >
                    {team.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center border-r border-gray-200">
                  <p className="text-xs font-medium text-red-500 mb-1">Members</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-members-${index}`}>{team.members}</p>
                </div>
                <div className="text-center border-r border-gray-200">
                  <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-tenure-${index}`}>
                    {team.tenure} <span className="text-sm text-gray-500">yrs</span>
                  </p>
                </div>
                <div className="text-center border-r border-gray-200">
                  <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-qtrs-${index}`}>{team.qtrsAchieved}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-milestone-${index}`}>{team.nextMilestone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
