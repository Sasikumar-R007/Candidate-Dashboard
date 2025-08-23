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
        <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {team.name}
                </h3>
              </div>
              <img 
                src={team.image} 
                alt={team.name}
                className="w-12 h-12 rounded object-cover border-2 border-blue-200 dark:border-blue-800"
              />
            </div>
            
            <div className="flex items-center justify-center text-center">
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team.members}</p>
              </div>
              <div className="mx-4 text-gray-400">|</div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tenure</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {team.tenure} <span className="text-sm font-normal">years</span>
                </p>
              </div>
              <div className="mx-4 text-gray-400">|</div>
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Qtrs Achieved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team.qtrsAchieved}</p>
              </div>
              <div className="mx-4 text-gray-400">|</div>
              <div>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">Next Milestone</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team.nextMilestone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}