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
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Team Details Card - Image 1 */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {team.name}
              </h3>
            </div>
            <img 
              src={team.image} 
              alt={team.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-center">
              <p className="text-xs font-medium text-red-500 mb-1">Members</p>
              <p className="text-xl font-bold text-gray-900">{team.members}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-blue-500 mb-1">Tenure</p>
              <p className="text-xl font-bold text-gray-900">
                {team.tenure} <span className="text-sm text-gray-500">years</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-green-500 mb-1">Qtrs Achieved</p>
              <p className="text-xl font-bold text-gray-900">{team.qtrsAchieved}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-orange-500 mb-1">Next Milestone</p>
              <p className="text-xl font-bold text-gray-900">{team.nextMilestone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Gauge Card - Image 2 */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="w-full h-20">
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
              <text x="30" y="85" fontSize="8" fill="#6b7280" textAnchor="middle">SLIM</text>
              <text x="70" y="35" fontSize="8" fill="#6b7280" textAnchor="middle">FAIR</text>
              <text x="130" y="35" fontSize="8" fill="#6b7280" textAnchor="middle">GOOD</text>
              <text x="170" y="85" fontSize="8" fill="#6b7280" textAnchor="middle">EXCELLENT</text>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}