import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

const team = {
  name: "Arun KS",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
  members: 4,
  tenure: "4.3",
  qtrsAchieved: 6,
  nextMilestone: "+3"
};

export default function TeamBoxes() {
  return (
    <Card className="bg-white border border-gray-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {team.name}
            </h3>
            <img 
              src={team.image} 
              alt={team.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
            />
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Members</p>
              <p className="text-3xl font-bold text-gray-900">{team.members}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-1">Tenure</p>
              <p className="text-3xl font-bold text-gray-900">
                {team.tenure} <span className="text-lg font-normal text-gray-500">years</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-green-500 uppercase tracking-wider mb-1">Qtrs Achieved</p>
              <p className="text-3xl font-bold text-gray-900">{team.qtrsAchieved}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-orange-500 uppercase tracking-wider mb-1">Next Milestone</p>
              <p className="text-3xl font-bold text-gray-900">{team.nextMilestone}</p>
            </div>
          </div>

          {/* Speedometer/Gauge Chart */}
          <div className="w-48 h-24 relative">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Background arc */}
              <path d="M 20 90 A 80 80 0 0 1 180 90" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
              
              {/* Colored segments */}
              <path d="M 20 90 A 80 80 0 0 0 60 40" stroke="#ef4444" strokeWidth="8" fill="none"/>
              <path d="M 60 40 A 80 80 0 0 0 100 20" stroke="#eab308" strokeWidth="8" fill="none"/>
              <path d="M 100 20 A 80 80 0 0 0 140 40" stroke="#22c55e" strokeWidth="8" fill="none"/>
              <path d="M 140 40 A 80 80 0 0 0 180 90" stroke="#3b82f6" strokeWidth="8" fill="none"/>
              
              {/* Needle */}
              <line x1="100" y1="90" x2="150" y2="50" stroke="#1f2937" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="100" cy="90" r="4" fill="#1f2937"/>
              
              {/* Labels */}
              <text x="30" y="85" fontSize="10" fill="#6b7280" textAnchor="middle">Slack</text>
              <text x="70" y="35" fontSize="10" fill="#6b7280" textAnchor="middle">Fair</text>
              <text x="130" y="35" fontSize="10" fill="#6b7280" textAnchor="middle">Good</text>
              <text x="170" y="85" fontSize="10" fill="#6b7280" textAnchor="middle">Excellent</text>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}