import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Calendar, Target, TrendingUp, DollarSign, Users, Shield } from "lucide-react";

interface TeamLeaderProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamLeader: {
    name: string;
    position: string;
    department: string;
    image: string;
    email: string;
    members: number;
    tenure: string;
    qtrsAchieved: number;
    nextMilestone: string;
    performanceScore: number;
  };
}

export default function TeamLeaderProfileModal({ open, onOpenChange, teamLeader }: TeamLeaderProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide" data-testid="dialog-team-leader-profile">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Team Leader Profile</DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 flex items-center gap-4">
          <div className="relative">
            <img 
              src={teamLeader.image}
              alt={teamLeader.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-blue-500"
              data-testid="img-leader-avatar"
            />
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full" data-testid="icon-leader-badge">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-leader-name">
              {teamLeader.name}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300" data-testid="text-leader-position">
              {teamLeader.position}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-leader-department">
              {teamLeader.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-email">
                    {teamLeader.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tenure</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-tenure">
                    {teamLeader.tenure} years
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-members">
                    {teamLeader.members} members
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quarters Achieved</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-qtrs">
                    {teamLeader.qtrsAchieved} quarters
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Next Milestone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-milestone">
                    {teamLeader.nextMilestone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Performance Score</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="text-leader-performance">
                    {teamLeader.performanceScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
