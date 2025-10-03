import { useState } from "react";
import { Card } from "@/components/ui/card";
import TeamMemberProfileModal from "./modals/team-member-profile-modal";

const teamMembers = [
  { 
    name: "Deepika", 
    salary: "3,50,000 INR", 
    year: "2024-2025", 
    count: 6, 
    image: "https://images.unsplash.com/photo-1494790108755-2616c0763c52?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "deepika@scaling.com",
    age: 28,
    joiningDate: "2024-01-15",
    lastLogin: "2025-10-03 09:30 AM",
    lastClosure: "2025-10-02",
    tenure: "1.8 years",
    totalClosures: 6,
    quartersAchieved: 2,
    targetAchievement: 75,
    totalRevenue: "8,50,000"
  },
  { 
    name: "Priyanka", 
    salary: "4,30,000 INR", 
    year: "2023-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "priyanka@scaling.com",
    age: 30,
    joiningDate: "2023-01-10",
    lastLogin: "2025-10-03 08:15 AM",
    lastClosure: "2025-10-01",
    tenure: "2.8 years",
    totalClosures: 12,
    quartersAchieved: 3,
    targetAchievement: 82,
    totalRevenue: "14,30,000"
  },
  { 
    name: "Thamarai Selvi", 
    salary: "1,00,000 INR", 
    year: "2022-2025", 
    count: 7, 
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "thamarai@scaling.com",
    age: 26,
    joiningDate: "2022-06-20",
    lastLogin: "2025-10-03 10:00 AM",
    lastClosure: "2025-10-02",
    tenure: "3.3 years",
    totalClosures: 7,
    quartersAchieved: 2,
    targetAchievement: 70,
    totalRevenue: "9,00,000"
  },
  { 
    name: "Kavya", 
    salary: "5,50,000 INR", 
    year: "2020-2025", 
    count: 2, 
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "kavya@scaling.com",
    age: 32,
    joiningDate: "2020-03-15",
    lastLogin: "2025-10-03 07:45 AM",
    lastClosure: "2025-09-30",
    tenure: "5.6 years",
    totalClosures: 2,
    quartersAchieved: 1,
    targetAchievement: 65,
    totalRevenue: "4,50,000"
  },
  { 
    name: "Karthikayan", 
    salary: "3,00,000 INR", 
    year: "2024-2025", 
    count: 11, 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "karthik@scaling.com",
    age: 27,
    joiningDate: "2024-02-10",
    lastLogin: "2025-10-03 08:30 AM",
    lastClosure: "2025-10-02",
    tenure: "1.7 years",
    totalClosures: 11,
    quartersAchieved: 2,
    targetAchievement: 88,
    totalRevenue: "12,00,000"
  },
  { 
    name: "Vishnu Priya", 
    salary: "4,60,000 INR", 
    year: "2019-2025", 
    count: 3, 
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "vishnu@scaling.com",
    age: 31,
    joiningDate: "2019-05-20",
    lastLogin: "2025-10-03 09:00 AM",
    lastClosure: "2025-10-01",
    tenure: "6.4 years",
    totalClosures: 3,
    quartersAchieved: 1,
    targetAchievement: 60,
    totalRevenue: "5,60,000"
  },
  { 
    name: "Helen", 
    salary: "5,50,000 INR", 
    year: "2012-2025", 
    count: 10, 
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&h=150",
    role: "Senior Recruiter",
    department: "Recruitment",
    email: "helen@scaling.com",
    age: 35,
    joiningDate: "2012-08-15",
    lastLogin: "2025-10-03 08:00 AM",
    lastClosure: "2025-10-02",
    tenure: "13.2 years",
    totalClosures: 10,
    quartersAchieved: 3,
    targetAchievement: 85,
    totalRevenue: "15,50,000"
  },
  { 
    name: "Kevin", 
    salary: "2,00,000 INR", 
    year: "2023-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    role: "Junior Recruiter",
    department: "Recruitment",
    email: "kevin@scaling.com",
    age: 25,
    joiningDate: "2023-09-10",
    lastLogin: "2025-10-03 09:15 AM",
    lastClosure: "2025-10-02",
    tenure: "2.1 years",
    totalClosures: 12,
    quartersAchieved: 2,
    targetAchievement: 90,
    totalRevenue: "13,20,000"
  },
  { 
    name: "Thrisha", 
    salary: "3,50,000 INR", 
    year: "2021-2025", 
    count: 6, 
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150",
    role: "Recruitment Executive",
    department: "Recruitment",
    email: "thrisha@scaling.com",
    age: 29,
    joiningDate: "2021-11-05",
    lastLogin: "2025-10-03 07:30 AM",
    lastClosure: "2025-10-01",
    tenure: "3.9 years",
    totalClosures: 6,
    quartersAchieved: 2,
    targetAchievement: 72,
    totalRevenue: "8,80,000"
  },
  { 
    name: "Megna", 
    salary: "8,30,000 INR", 
    year: "2020-2025", 
    count: 12, 
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150",
    role: "Lead Recruiter",
    department: "Recruitment",
    email: "megna@scaling.com",
    age: 33,
    joiningDate: "2020-04-12",
    lastLogin: "2025-10-03 08:45 AM",
    lastClosure: "2025-10-02",
    tenure: "5.5 years",
    totalClosures: 12,
    quartersAchieved: 4,
    targetAchievement: 92,
    totalRevenue: "18,30,000"
  }
];

export default function TeamMembersSidebar() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberClick = (member: typeof teamMembers[0]) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  return (
    <>
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{height: 'calc(100vh - 4rem)'}}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Members</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          <div className="space-y-1">
            {teamMembers.map((member, index) => {
              const isEven = index % 2 === 0;
              
              return (
              <Card 
                key={index} 
                className={`p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                  isEven 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleMemberClick(member)}
                data-testid={`card-member-${index}`}
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
          tenure: selectedMember.tenure,
          totalClosures: selectedMember.totalClosures,
          quartersAchieved: selectedMember.quartersAchieved,
          targetAchievement: selectedMember.targetAchievement,
          totalRevenue: selectedMember.totalRevenue
        }}
      />
    )}
    </>
  );
}