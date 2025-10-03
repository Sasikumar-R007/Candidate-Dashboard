import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Calendar, Target, TrendingUp, DollarSign, Users } from "lucide-react";

interface TeamMemberProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    name: string;
    role: string;
    department: string;
    image: string;
    email: string;
    age: number;
    joiningDate: string;
    lastLogin: string;
    lastClosure: string;
    tenure: string;
    totalClosures: number;
    quartersAchieved: number;
    targetAchievement: number;
    totalRevenue: string;
    teamMembers?: number;
  };
}

export default function TeamMemberProfileModal({ open, onOpenChange, member }: TeamMemberProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide" data-testid="dialog-team-member-profile">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Team Member Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 flex items-center space-x-4">
          <div className="relative">
            <img 
              src={member.image}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover"
              data-testid="img-member-avatar"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium" data-testid="status-online">
              online
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-member-name">
              {member.name}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300" data-testid="text-member-role">
              {member.role}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-member-department">
              {member.department}
            </p>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-email">
                    {member.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-age">
                    {member.age} years
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joining Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-joining-date">
                    {member.joiningDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Activity Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-last-login">
                    {member.lastLogin}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Closure</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-last-closure">
                    {member.lastClosure}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tenure</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-tenure">
                    {member.tenure}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-closures">
                {member.totalClosures}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Closures</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-quarters-achieved">
                {member.quartersAchieved}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Quarters Achieved</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-target-achievement">
                {member.targetAchievement}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Target Achievement</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-revenue">
                ₹{member.totalRevenue}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Team Leadership */}
        {member.teamMembers !== undefined && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Team Leadership
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-team-size">
                    {member.teamMembers} Members
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
