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
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-semibold text-gray-900">
                  {team.name}
                </h3>
              </div>
              <img 
                src={team.image} 
                alt={team.name}
                className="w-12 h-12 rounded object-cover border-2 border-teal-400"
              />
            </div>
            
            <div className="flex items-center justify-between mt-4 text-center">
              <div>
                <p className="text-xs font-medium text-red-500 uppercase tracking-wider">Members</p>
                <p className="text-2xl font-bold text-gray-900">{team.members}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-500 uppercase tracking-wider">Tenure</p>
                <p className="text-2xl font-bold text-gray-900">
                  {team.tenure} <span className="text-sm font-normal text-gray-500">years</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-500 uppercase tracking-wider">Qtrs Achieved</p>
                <p className="text-2xl font-bold text-gray-900">{team.qtrsAchieved}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-orange-500 uppercase tracking-wider">Next Milestone</p>
                <p className="text-2xl font-bold text-gray-900">{team.nextMilestone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}