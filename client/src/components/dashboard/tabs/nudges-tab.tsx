import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Nudge {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  currentStatus: string;
  isRead: boolean;
  isResponded: boolean;
  createdAt: string;
  escalationLevel: string;
  message?: string;
  respondedAt?: string;
}

export default function NudgeLogsTab() {
  const { data: nudges = [], isLoading } = useQuery<Nudge[]>({
    queryKey: ['/api/nudges/logs'],
  });


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Candidate Nudge Logs</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Full history of all candidate nudges</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Escalation Level</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Response on</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Updates</th>
                </tr>
              </thead>
              <tbody>
                {nudges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm italic">
                      No nudge history found.
                    </td>
                  </tr>
                ) : (
                  nudges.map((nudge) => (
                    <tr key={nudge.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="py-3 px-6">
                        <span className="text-sm font-medium text-gray-700">
                          {format(new Date(nudge.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="font-semibold text-gray-900 text-sm">{nudge.candidateName}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-700">{nudge.jobTitle}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">{nudge.company}</span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          {nudge.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <Badge className="text-xs capitalize" variant={nudge.escalationLevel === 'recruiter' ? 'secondary' : 'destructive'}>
                          {nudge.escalationLevel.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-[11px] text-gray-500 italic">
                          {nudge.respondedAt ? format(new Date(nudge.respondedAt), 'MMM d, hh:mm a') : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        {nudge.message ? (
                          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded" title={nudge.message}>{nudge.message.length > 20 ? nudge.message.substring(0, 20) + '...' : nudge.message}</span>
                        ) : nudge.isResponded ? (
                          <span className="text-xs text-green-700 font-medium" title={nudge.message || "Responded"}>Responded</span>
                        ) : nudge.isEscalated ? (
                          <span className="text-xs text-red-600 font-medium">Escalated</span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
