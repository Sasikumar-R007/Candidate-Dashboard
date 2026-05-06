const fs = require('fs');
let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

// 1. Inject query
const queryTarget = `  const { data: jobApplications = [], isLoading } = useJobApplications();`;
const queryReplace = `  const { data: jobApplications = [], isLoading } = useJobApplications();
  const { data: candidateNudges = [] } = useQuery<any[]>({
    queryKey: ['/api/candidate/nudges'],
  });
  const [showAllNudgesDialog, setShowAllNudgesDialog] = useState(false);`;

if (content.includes(queryTarget)) {
    content = content.replace(queryTarget, queryReplace);
}

// 2. Inject UI above Applied Jobs
const uiTarget = `        <div className="p-4 space-y-4 max-w-full">
          {/* Applied Jobs Section - Pipeline Layout */}`;

const uiReplace = `        <div className="p-4 space-y-4 max-w-full">
          {/* Candidate Nudges Updates Section */}
          {candidateNudges.length > 0 && (
            <div className="bg-white rounded-md p-4 shadow-sm relative border border-gray-100 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> Nudge Updates
                </h2>
                {candidateNudges.length > 5 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllNudgesDialog(true)} className="text-blue-600 hover:text-blue-700 font-medium">
                    View More
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                      <th className="px-4 py-2 font-medium">Job Title</th>
                      <th className="px-4 py-2 font-medium">Company</th>
                      <th className="px-4 py-2 font-medium">Nudged On</th>
                      <th className="px-4 py-2 font-medium">Recruiter Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateNudges.slice(0, 5).map((nudge: any) => (
                      <tr key={nudge.id} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{nudge.jobTitle}</td>
                        <td className="px-4 py-3 text-gray-600">{nudge.company}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(nudge.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {nudge.message ? (
                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">
                              {nudge.message}
                            </span>
                          ) : nudge.isResponded ? (
                            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              Updated
                            </span>
                          ) : nudge.isEscalated ? (
                            <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                              Escalated
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applied Jobs Section - Pipeline Layout */}`;

if (content.includes(uiTarget)) {
    content = content.replace(uiTarget, uiReplace);
}

// 3. Inject Dialog at the bottom
const dialogReplace = `      {/* Full Nudge Logs Dialog */}
      <Dialog open={showAllNudgesDialog} onOpenChange={setShowAllNudgesDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> All Nudge Logs
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Job Title</th>
                  <th className="px-4 py-2 font-medium">Company</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Response</th>
                </tr>
              </thead>
              <tbody>
                {candidateNudges.map((nudge: any) => (
                  <tr key={nudge.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(nudge.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{nudge.jobTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{nudge.company}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{nudge.currentStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      {nudge.message ? (
                        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">
                          {nudge.message}
                        </span>
                      ) : nudge.isResponded ? (
                        <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                          Updated
                        </span>
                      ) : nudge.isEscalated ? (
                        <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                          Escalated
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}`;

content = content.replace(/    <\/>\n  \);\n\}$/m, dialogReplace);

fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
console.log("Patched my-jobs-tab.tsx with real Candidate Nudges UI.");
