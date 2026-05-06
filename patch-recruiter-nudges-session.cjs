const fs = require('fs');

let content = fs.readFileSync('client/src/pages/recruiter-dashboard-2.tsx', 'utf8');

const targetRegex = /  const renderNudgesSession = \(\) => {[\s\S]*?    \);\r?\n  };/m;

const newContent = `  const handleUpdateNudgeConfirm = () => {
    if (!updateModalNudge || !updateDropdown1 || !updateDropdown2) {
      toast({ title: "Error", description: "Please select both options to update the candidate.", variant: "destructive" });
      return;
    }
    
    // Add to local updated list
    setLocalUpdatedNudges(prev => new Set(prev).add(updateModalNudge.id));
    
    toast({
      title: "Update Sent",
      description: "Candidate will receive your update.",
    });
    
    setUpdateModalNudge(null);
    setUpdateDropdown1("");
    setUpdateDropdown2("");
  };

  const renderNudgesSession = () => {
    if (isLoadingNudges) return null;

    // Process and sort nudges
    const processedNudges = realNudges.map(nudge => {
      const isResponded = nudge.isResponded || localUpdatedNudges.has(nudge.id);
      const elapsedHours = getElapsedWorkingHours(nudge.createdAt);
      const isEscalated = !isResponded && elapsedHours >= 6;
      return { ...nudge, isResponded, elapsedHours, isEscalated };
    });

    // Sort: Not responded and not escalated first (sorted by least time remaining), then responded/escalated at bottom
    processedNudges.sort((a, b) => {
      const aDone = a.isResponded || a.isEscalated;
      const bDone = b.isResponded || b.isEscalated;
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      
      // Both are active, sort by elapsed time descending (meaning least remaining time first)
      if (!aDone && !bDone) {
        return b.elapsedHours - a.elapsedHours;
      }
      return 0; // if both are done, don't change order
    });

    return (
      <Card className="bg-white border border-gray-200 mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-gray-900">Nudges</CardTitle>
            <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
              {realNudges.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Role</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Company</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Nudged</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Escalates In</th>
                  <th className="text-left py-2 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Update</th>
                </tr>
              </thead>
              <tbody>
                {processedNudges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm italic">
                      No candidate nudges found for your roles.
                    </td>
                  </tr>
                ) : (
                  processedNudges.map((nudge) => (
                    <tr key={nudge.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="py-2 px-6">
                        <span className="font-semibold text-gray-900 text-sm">{nudge.candidateName}</span>
                      </td>
                      <td className="py-2 px-6">
                        <span className="text-sm font-medium text-gray-700">{nudge.jobTitle}</span>
                      </td>
                      <td className="py-2 px-6">
                        <span className="text-sm text-gray-600">{nudge.company}</span>
                      </td>
                      <td className="py-2 px-6">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                          {nudge.currentStatus}
                        </span>
                      </td>
                      <td className="py-2 px-6">
                        <span className="text-[11px] text-gray-500">{format(new Date(nudge.createdAt), 'hh:mm a')}</span>
                      </td>
                      <td className="py-2 px-6">
                        {nudge.isResponded ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">Updated</Badge>
                        ) : nudge.isEscalated ? (
                          <Badge variant="destructive" className="border-0">Escalated</Badge>
                        ) : (
                          <span className="text-[11px] font-semibold text-orange-600">
                            {formatRemainingWorkingTime(nudge.elapsedHours, 6)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-6">
                        <div className="flex items-center gap-3">
                          <Button 
                            onClick={() => setUpdateModalNudge(nudge)}
                            disabled={nudge.isResponded}
                            size="sm"
                            className="bg-slate-900 hover:bg-slate-800 text-white h-7 text-[10px] px-3"
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Update Dialog */}
        <Dialog open={!!updateModalNudge} onOpenChange={(open) => !open && setUpdateModalNudge(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Candidate</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Select a message to update <span className="font-semibold text-gray-900">{updateModalNudge?.candidateName}</span> for the {updateModalNudge?.jobTitle} role.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateDropdown1}
                    onChange={(e) => setUpdateDropdown1(e.target.value)}
                  >
                    <option value="" disabled>Select a message...</option>
                    <option value="Awaiting feedback. I'll update you within">Awaiting feedback. I'll update you within</option>
                    <option value="Hello! Internal review is in progress. I'll update you within">Hello! Internal review is in progress. I'll update you within</option>
                    <option value="Hi There! Scheduling is in progress. I'll update you within">Hi There! Scheduling is in progress. I'll update you within</option>
                    <option value="Sorry. Unexpected internal delay. Expect an update within">Sorry. Unexpected internal delay. Expect an update within</option>
                    <option value="I have news. I'll connect with you within">I have news. I'll connect with you within</option>
                    <option value="Sorry. Position Seems to be Paused for now. Expect an update within">Sorry. Position Seems to be Paused for now. Expect an update within</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateDropdown2}
                    onChange={(e) => setUpdateDropdown2(e.target.value)}
                  >
                    <option value="" disabled>Select a timeframe...</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="6 Hours">6 Hours</option>
                    <option value="12 Hours">12 Hours</option>
                    <option value="24 Hours">24 Hours</option>
                    <option value="2 Days">2 Days</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                  </select>
                </div>
              </div>
              
              {updateDropdown1 && updateDropdown2 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Preview</p>
                  <p className="text-sm text-gray-900">{updateDropdown1} {updateDropdown2}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUpdateModalNudge(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateNudgeConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!updateDropdown1 || !updateDropdown2}
              >
                Send Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  };`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, newContent);
  fs.writeFileSync('client/src/pages/recruiter-dashboard-2.tsx', content);
  console.log("Successfully replaced renderNudgesSession in recruiter-dashboard-2.tsx");
} else {
  console.log("Could not find the target regex in recruiter-dashboard-2.tsx!");
}
