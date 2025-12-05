import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import PerformanceGauge from "./performance-gauge";
import TeamLeaderProfileModal from "./modals/team-leader-profile-modal";

interface TeamLeaderProfile {
  id: string;
  name: string;
  image: string | null;
  members: number;
  tenure: string;
  qtrsAchieved: number;
  nextMilestone: string;
  email: string;
  position: string;
  department: string;
  performanceScore: number;
}

export default function TeamLeaderTeamBoxes() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { data: teamLeaderStats } = useQuery<TeamLeaderProfile>({
    queryKey: ['/api/team-leader/stats'],
  });

  const teamLeader = teamLeaderStats || {
    id: "",
    name: "-",
    image: null,
    members: 0,
    tenure: "0",
    qtrsAchieved: 0,
    nextMilestone: "0",
    email: "-",
    position: "Team Leader",
    department: "Recruitment",
    performanceScore: 0
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Section */}
        <Card 
          className="bg-white border border-gray-200 hover-elevate cursor-pointer"
          data-testid="card-team-leader-profile"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Name and Stats */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-900" data-testid="text-team-leader-name">
                    {teamLeader.name}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1">Members</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-members-count">
                      {teamLeader.members}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-tenure">
                      {teamLeader.tenure} <span className="text-sm text-gray-500">years</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-qtrs-achieved">
                      {teamLeader.qtrsAchieved}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-next-milestone">
                      {teamLeader.nextMilestone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section - Profile Picture */}
              <div className="relative flex-shrink-0">
                {teamLeader.image ? (
                  <img 
                    src={teamLeader.image} 
                    alt={teamLeader.name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-blue-500"
                    data-testid="img-team-leader-avatar"
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-lg bg-blue-100 border-2 border-blue-500 flex items-center justify-center"
                    data-testid="img-team-leader-avatar"
                  >
                    <span className="text-2xl font-bold text-blue-600">
                      {teamLeader.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Gauge Section */}
        <Card 
          className="bg-white border border-gray-200"
          data-testid="card-performance-gauge"
        >
          <CardContent className="p-6 flex items-center justify-center">
            <PerformanceGauge value={teamLeader.performanceScore} size={180} />
          </CardContent>
        </Card>
      </div>

      <TeamLeaderProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        teamLeader={teamLeader}
      />
    </>
  );
}
