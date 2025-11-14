import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import PerformanceGauge from "./performance-gauge";

const teamLeader = {
  id: "arun-ks",
  name: "Arun KS",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
  members: 4,
  tenure: "4.3",
  qtrsAchieved: 6,
  nextMilestone: "+3",
  email: "arun.ks@gumlat.com",
  position: "Team Leader",
  department: "Recruitment",
  performanceScore: 77.8
};

export default function TeamLeaderTeamBoxes() {
  return (
    <div className="mb-4">
      {/* Team Leader Profile Card */}
      <Card 
        className="bg-white border border-gray-200"
        data-testid="card-team-leader-profile"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left Section - Team Leader Info */}
            <div className="flex items-center gap-4 flex-1">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <img 
                  src={teamLeader.image} 
                  alt={teamLeader.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500"
                  data-testid="img-team-leader-avatar"
                />
              </div>

              {/* Team Leader Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-900" data-testid="text-team-leader-name">
                    {teamLeader.name}
                  </h3>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs font-medium text-red-500 mb-1">Members</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-members-count">
                      {teamLeader.members}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-tenure">
                      {teamLeader.tenure} <span className="text-sm text-gray-500">years</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-qtrs-achieved">
                      {teamLeader.qtrsAchieved}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-next-milestone">
                      {teamLeader.nextMilestone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Performance Gauge */}
            <div className="flex-shrink-0">
              <PerformanceGauge value={teamLeader.performanceScore} size={180} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
