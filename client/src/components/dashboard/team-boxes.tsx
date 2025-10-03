import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";

const teams = [
  {
    name: "Arun KS",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    members: 4,
    tenure: "4.3",
    qtrsAchieved: 6,
    nextMilestone: "+3",
    role: "Team Leader",
    department: "Recruitment",
    email: "arun.ks@gumlat.com",
    age: 32,
    joiningDate: "2021-04-15",
    lastLogin: "2025-09-22 09:30 AM",
    lastClosure: "2025-09-20",
    tenureText: "4.3 years",
    totalClosures: 24,
    quartersAchieved: 6,
    targetAchievement: 85,
    totalRevenue: "18,50,000"
  },
  {
    name: "Anusha Jayabal",
    image: "https://images.unsplash.com/photo-1494790108755-2616c0763c52?auto=format&fit=crop&w=150&h=150",
    members: 4,
    tenure: "4.3",
    qtrsAchieved: 6,
    nextMilestone: "+3",
    role: "Team Leader",
    department: "Recruitment",
    email: "anusha.j@gumlat.com",
    age: 29,
    joiningDate: "2021-04-15",
    lastLogin: "2025-09-22 08:15 AM",
    lastClosure: "2025-09-21",
    tenureText: "4.3 years",
    totalClosures: 20,
    quartersAchieved: 6,
    targetAchievement: 78,
    totalRevenue: "15,20,000"
  }
];

export default function TeamBoxes() {
  const [selectedMember, setSelectedMember] = useState<typeof teams[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTeamBoxClick = (team: typeof teams[0]) => {
    setSelectedMember(team);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {teams.map((team, index) => (
          <Card 
            key={index} 
            className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleTeamBoxClick(team)}
            data-testid={`card-team-${index}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {team.name}
                  </h3>
                </div>
                <img 
                  src={team.image} 
                  alt={team.name}
                  className="w-12 h-12 object-cover"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center border-r border-gray-200">
                  <p className="text-xs font-medium text-red-500 mb-1">Members</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-members-${index}`}>{team.members}</p>
                </div>
                <div className="text-center border-r border-gray-200">
                  <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                  <p className="text-xl font-bold text-gray-900" data-testid={`text-team-tenure-${index}`}>
                    {team.tenure} <span className="text-sm text-gray-500">years</span>
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
          onOpenChange={setIsModalOpen}
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
            tenure: selectedMember.tenureText,
            totalClosures: selectedMember.totalClosures,
            quartersAchieved: selectedMember.quartersAchieved,
            targetAchievement: selectedMember.targetAchievement,
            totalRevenue: selectedMember.totalRevenue,
            teamMembers: selectedMember.members
          }}
        />
      )}
    </>
  );
}
