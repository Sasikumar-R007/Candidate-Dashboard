import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Calendar, Target, TrendingUp, DollarSign, Users, Clock, User } from "lucide-react";

interface TeamMemberProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    name: string;
    role: string;
    department: string;
    image: string | null;
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
    teamLeaderName?: string;
    teamLeaderId?: string;
  };
}

export default function TeamMemberProfileModal({ open, onOpenChange, member }: TeamMemberProfileModalProps) {
  // Determine modal title based on role
  const getModalTitle = () => {
    const roleLower = member.role?.toLowerCase() || '';
    if (roleLower.includes('recruiter') || roleLower.includes('talent') || roleLower.includes('advisor')) {
      return 'Recruiter Profile';
    } else if (roleLower.includes('team leader') || roleLower.includes('team_leader') || roleLower.includes('teamlead')) {
      return 'Team Leader Profile';
    } else if (roleLower.includes('client')) {
      return 'Client Profile';
    }
    return 'Team Member Profile';
  };

  // Check if Team Leader info should be shown (only for Recruiters/Talent Advisors)
  const shouldShowTeamLeader = () => {
    const roleLower = member.role?.toLowerCase() || '';
    return (roleLower.includes('recruiter') || roleLower.includes('talent') || roleLower.includes('advisor')) 
           && (member.teamLeaderName || member.teamLeaderId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide" data-testid="dialog-team-member-profile">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">{getModalTitle()}</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 flex items-center justify-between border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {member.image ? (
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                  data-testid="img-member-avatar"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center border-2 border-blue-600 dark:border-blue-500" data-testid="img-member-avatar">
                  <span className="text-white text-lg font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100" data-testid="text-member-name">
                {member.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-member-role">
                {member.role}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500" data-testid="text-member-department">
                {member.department}
              </p>
            </div>
          </div>
          {shouldShowTeamLeader() && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Team Leader</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-team-leader">
                {member.teamLeaderName || 'N/A'}
                {member.teamLeaderId && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">({member.teamLeaderId})</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-email">
                    {member.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-age">
                    {member.age} years
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
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
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Activity Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-last-login">
                    {member.lastLogin}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Closure</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-member-last-closure">
                    {member.lastClosure}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
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
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-closures">
                {member.totalClosures}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Closures</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-quarters-achieved">
                {member.quartersAchieved}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Quarters Achieved</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-target-achievement">
                {member.targetAchievement}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Target Achievement</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-revenue">
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
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100" data-testid="text-team-size">
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
