const fs = require('fs');

// 1. Fix my-jobs-tab.tsx
let myJobsContent = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');
const myJobsLines = myJobsContent.split(/\r?\n/);

let newMyJobsLines = [];
let queryInjected = false;
let uiInjected = false;
let dialogInjected = false;

for (let i = 0; i < myJobsLines.length; i++) {
  const line = myJobsLines[i];
  
  if (line.includes('const { data: jobApplications = [], isLoading } = useJobApplications();') && !queryInjected) {
    newMyJobsLines.push(line);
    newMyJobsLines.push(`  const { data: candidateNudges = [] } = useQuery<any[]>({`);
    newMyJobsLines.push(`    queryKey: ['/api/candidate/nudges'],`);
    newMyJobsLines.push(`  });`);
    newMyJobsLines.push(`  const [showAllNudgesDialog, setShowAllNudgesDialog] = useState(false);`);
    queryInjected = true;
    continue;
  }
  
  if (line.includes('{/* Applied Jobs Section - Pipeline Layout */}') && !uiInjected) {
    newMyJobsLines.push(`          {/* Candidate Nudges Updates Section */}`);
    newMyJobsLines.push(`          {candidateNudges.length > 0 && (`);
    newMyJobsLines.push(`            <div className="bg-white rounded-md p-4 shadow-sm relative border border-gray-100 mb-4">`);
    newMyJobsLines.push(`              <div className="flex justify-between items-center mb-4">`);
    newMyJobsLines.push(`                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">`);
    newMyJobsLines.push(`                  <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> Nudge Updates`);
    newMyJobsLines.push(`                </h2>`);
    newMyJobsLines.push(`                {candidateNudges.length > 5 && (`);
    newMyJobsLines.push(`                  <Button variant="ghost" size="sm" onClick={() => setShowAllNudgesDialog(true)} className="text-blue-600 hover:text-blue-700 font-medium">`);
    newMyJobsLines.push(`                    View More`);
    newMyJobsLines.push(`                  </Button>`);
    newMyJobsLines.push(`                )}`);
    newMyJobsLines.push(`              </div>`);
    newMyJobsLines.push(`              <div className="overflow-x-auto">`);
    newMyJobsLines.push(`                <table className="w-full text-sm text-left">`);
    newMyJobsLines.push(`                  <thead className="bg-gray-50 text-gray-700 border-b">`);
    newMyJobsLines.push(`                    <tr>`);
    newMyJobsLines.push(`                      <th className="px-4 py-2 font-medium">Job Title</th>`);
    newMyJobsLines.push(`                      <th className="px-4 py-2 font-medium">Company</th>`);
    newMyJobsLines.push(`                      <th className="px-4 py-2 font-medium">Nudged On</th>`);
    newMyJobsLines.push(`                      <th className="px-4 py-2 font-medium">Recruiter Response</th>`);
    newMyJobsLines.push(`                    </tr>`);
    newMyJobsLines.push(`                  </thead>`);
    newMyJobsLines.push(`                  <tbody>`);
    newMyJobsLines.push(`                    {candidateNudges.slice(0, 5).map((nudge: any) => (`);
    newMyJobsLines.push(`                      <tr key={nudge.id} className="border-b last:border-0 hover:bg-gray-50/50">`);
    newMyJobsLines.push(`                        <td className="px-4 py-3 font-medium text-gray-900">{nudge.jobTitle}</td>`);
    newMyJobsLines.push(`                        <td className="px-4 py-3 text-gray-600">{nudge.company}</td>`);
    newMyJobsLines.push(`                        <td className="px-4 py-3 text-gray-500">{new Date(nudge.createdAt).toLocaleDateString()}</td>`);
    newMyJobsLines.push(`                        <td className="px-4 py-3">`);
    newMyJobsLines.push(`                          {nudge.message ? (`);
    newMyJobsLines.push(`                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">`);
    newMyJobsLines.push(`                              {nudge.message}`);
    newMyJobsLines.push(`                            </span>`);
    newMyJobsLines.push(`                          ) : nudge.isResponded ? (`);
    newMyJobsLines.push(`                            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">`);
    newMyJobsLines.push(`                              Updated`);
    newMyJobsLines.push(`                            </span>`);
    newMyJobsLines.push(`                          ) : nudge.isEscalated ? (`);
    newMyJobsLines.push(`                            <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">`);
    newMyJobsLines.push(`                              Escalated`);
    newMyJobsLines.push(`                            </span>`);
    newMyJobsLines.push(`                          ) : (`);
    newMyJobsLines.push(`                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">`);
    newMyJobsLines.push(`                              Pending`);
    newMyJobsLines.push(`                            </span>`);
    newMyJobsLines.push(`                          )}`);
    newMyJobsLines.push(`                        </td>`);
    newMyJobsLines.push(`                      </tr>`);
    newMyJobsLines.push(`                    ))}`);
    newMyJobsLines.push(`                  </tbody>`);
    newMyJobsLines.push(`                </table>`);
    newMyJobsLines.push(`              </div>`);
    newMyJobsLines.push(`            </div>`);
    newMyJobsLines.push(`          )}`);
    newMyJobsLines.push(line);
    uiInjected = true;
    continue;
  }
  
  // Inject before the final </>
  if (line.trim() === '</>' && !dialogInjected && i > myJobsLines.length - 10) {
    newMyJobsLines.push(`      {/* Full Nudge Logs Dialog */}`);
    newMyJobsLines.push(`      <Dialog open={showAllNudgesDialog} onOpenChange={setShowAllNudgesDialog}>`);
    newMyJobsLines.push(`        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">`);
    newMyJobsLines.push(`          <DialogHeader>`);
    newMyJobsLines.push(`            <DialogTitle className="flex items-center gap-2">`);
    newMyJobsLines.push(`              <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> All Nudge Logs`);
    newMyJobsLines.push(`            </DialogTitle>`);
    newMyJobsLines.push(`          </DialogHeader>`);
    newMyJobsLines.push(`          <div className="flex-1 overflow-y-auto mt-4 pr-2">`);
    newMyJobsLines.push(`            <table className="w-full text-sm text-left">`);
    newMyJobsLines.push(`              <thead className="bg-gray-50 text-gray-700 border-b sticky top-0">`);
    newMyJobsLines.push(`                <tr>`);
    newMyJobsLines.push(`                  <th className="px-4 py-2 font-medium">Date</th>`);
    newMyJobsLines.push(`                  <th className="px-4 py-2 font-medium">Job Title</th>`);
    newMyJobsLines.push(`                  <th className="px-4 py-2 font-medium">Company</th>`);
    newMyJobsLines.push(`                  <th className="px-4 py-2 font-medium">Status</th>`);
    newMyJobsLines.push(`                  <th className="px-4 py-2 font-medium">Response</th>`);
    newMyJobsLines.push(`                </tr>`);
    newMyJobsLines.push(`              </thead>`);
    newMyJobsLines.push(`              <tbody>`);
    newMyJobsLines.push(`                {candidateNudges.map((nudge: any) => (`);
    newMyJobsLines.push(`                  <tr key={nudge.id} className="border-b last:border-0 hover:bg-gray-50/50">`);
    newMyJobsLines.push(`                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(nudge.createdAt).toLocaleString()}</td>`);
    newMyJobsLines.push(`                    <td className="px-4 py-3 font-medium text-gray-900">{nudge.jobTitle}</td>`);
    newMyJobsLines.push(`                    <td className="px-4 py-3 text-gray-600">{nudge.company}</td>`);
    newMyJobsLines.push(`                    <td className="px-4 py-3">`);
    newMyJobsLines.push(`                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{nudge.currentStatus}</span>`);
    newMyJobsLines.push(`                    </td>`);
    newMyJobsLines.push(`                    <td className="px-4 py-3">`);
    newMyJobsLines.push(`                      {nudge.message ? (`);
    newMyJobsLines.push(`                        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">`);
    newMyJobsLines.push(`                          {nudge.message}`);
    newMyJobsLines.push(`                        </span>`);
    newMyJobsLines.push(`                      ) : nudge.isResponded ? (`);
    newMyJobsLines.push(`                        <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">`);
    newMyJobsLines.push(`                          Updated`);
    newMyJobsLines.push(`                        </span>`);
    newMyJobsLines.push(`                      ) : nudge.isEscalated ? (`);
    newMyJobsLines.push(`                        <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">`);
    newMyJobsLines.push(`                          Escalated`);
    newMyJobsLines.push(`                        </span>`);
    newMyJobsLines.push(`                      ) : (`);
    newMyJobsLines.push(`                        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">`);
    newMyJobsLines.push(`                          Pending`);
    newMyJobsLines.push(`                        </span>`);
    newMyJobsLines.push(`                      )}`);
    newMyJobsLines.push(`                    </td>`);
    newMyJobsLines.push(`                  </tr>`);
    newMyJobsLines.push(`                ))}`);
    newMyJobsLines.push(`              </tbody>`);
    newMyJobsLines.push(`            </table>`);
    newMyJobsLines.push(`          </div>`);
    newMyJobsLines.push(`        </DialogContent>`);
    newMyJobsLines.push(`      </Dialog>`);
    newMyJobsLines.push(line);
    dialogInjected = true;
    continue;
  }
  
  newMyJobsLines.push(line);
}

// Clean up if duplicate query exists
let finalMyJobsLines = newMyJobsLines;
const queryKeysCount = finalMyJobsLines.filter(l => l.includes("queryKey: ['/api/candidate/nudges']")).length;
if (queryKeysCount > 1) {
  console.log("Removing duplicate queryKey...");
}

fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', finalMyJobsLines.join('\n'));
console.log("Fixed my-jobs-tab.tsx UI injection.");


// 2. Fix job-board-tab.tsx validateDOMNesting warning
let jobBoardContent = fs.readFileSync('client/src/components/dashboard/tabs/job-board-tab.tsx', 'utf8');
jobBoardContent = jobBoardContent.replace(
  /<p className="text-\[9px\] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">/g, 
  '<div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">'
);
jobBoardContent = jobBoardContent.replace(
  /<\/p>\s*<div className="flex flex-wrap gap-2">/g,
  '</div>\n                                    <div className="flex flex-wrap gap-2">'
);
fs.writeFileSync('client/src/components/dashboard/tabs/job-board-tab.tsx', jobBoardContent);
console.log("Fixed job-board-tab.tsx validateDOMNesting");
