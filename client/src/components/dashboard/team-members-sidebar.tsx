import { Card } from "@/components/ui/card";

const teamMembers = [
  { name: "Deepika", salary: "3,50,000 INR", year: "2024-2025", count: 6, image: "https://images.unsplash.com/photo-1494790108755-2616c0763c52?auto=format&fit=crop&w=150&h=150" },
  { name: "Priyanka", salary: "4,30,000 INR", year: "2023-2025", count: 12, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150" },
  { name: "Thamarai Selvi", salary: "1,00,000 INR", year: "2022-2025", count: 7, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150" },
  { name: "Kavya", salary: "5,50,000 INR", year: "2020-2025", count: 2, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150" },
  { name: "Karthikayan", salary: "3,00,000 INR", year: "2024-2025", count: 11, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150" },
  { name: "Vishnu Priya", salary: "4,60,000 INR", year: "2019-2025", count: 3, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150" },
  { name: "Helen", salary: "5,50,000 INR", year: "2012-2025", count: 10, image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&h=150" },
  { name: "Kevin", salary: "2,00,000 INR", year: "2023-2025", count: 12, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150" },
  { name: "Thrisha", salary: "3,50,000 INR", year: "2021-2025", count: 6, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150" },
  { name: "Megna", salary: "8,30,000 INR", year: "2020-2025", count: 12, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150" }
];

export default function TeamMembersSidebar() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{height: 'calc(100vh - 4rem)'}}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Members</h3>
        </div>
        
        <div className="flex-1 px-4 pb-4">
          <div className="space-y-1">
            {teamMembers.slice(0, 4).map((member, index) => {
              const isEven = index % 2 === 0;
              
              return (
              <Card 
                key={index} 
                className={`p-3 hover:shadow-md transition-shadow duration-200 ${
                  isEven 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-10 h-10 rounded-sm object-cover"
                      style={{ borderRadius: '2px' }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {member.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {member.salary}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {member.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {member.count}
                    </span>
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}