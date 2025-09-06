import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

const teams = [
  {
    name: "Arun KS",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    members: 4,
    tenure: "4.3",
    qtrsAchieved: 6,
    nextMilestone: "+3"
  },
  {
    name: "Anusha Jayabal",
    image: "https://images.unsplash.com/photo-1494790108755-2616c0763c52?auto=format&fit=crop&w=150&h=150",
    members: 4,
    tenure: "4.3",
    qtrsAchieved: 6,
    nextMilestone: "+3"
  }
];

export default function TeamBoxes() {
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {teams.map((team, index) => (
        <Card key={index} className="bg-white border border-gray-200">
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
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
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
      ))}
    </div>
  );
}