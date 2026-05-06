const fs = require('fs');
let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

// 1. Add withdrawReason state
content = content.replace(
  "const [isWithdrawing, setIsWithdrawing] = useState(false);",
  "const [isWithdrawing, setIsWithdrawing] = useState(false);\n  const [withdrawReason, setWithdrawReason] = useState<string>(\"\");"
);

// 2. Update executeWithdraw
const oldExecuteWithdraw = `  const executeWithdraw = async () => {
    if (!withdrawApp) return;
    setIsWithdrawing(true);
    try {
      await apiRequest('POST', \`/api/applications/\${withdrawApp.id}/withdraw\`, {});`;

const newExecuteWithdraw = `  const executeWithdraw = async () => {
    if (!withdrawApp) return;
    if (!withdrawReason) {
      toast({ title: "Error", description: "Please select a reason for withdrawal.", variant: "destructive" });
      return;
    }
    setIsWithdrawing(true);
    try {
      await apiRequest('POST', \`/api/applications/\${withdrawApp.id}/withdraw\`, { reason: withdrawReason });`;

content = content.replace(oldExecuteWithdraw, newExecuteWithdraw);

// 3. Update DialogContent
const oldDialogContent = `          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to withdraw your application for <span className="font-semibold text-gray-900">{withdrawApp?.jobTitle}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. You will not be able to reapply for this specific position once withdrawn.
            </p>
          </div>
          <div className="flex justify-end gap-3">`;

const newDialogContent = `          <div className="py-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Are you sure you want to withdraw your application for <span className="font-semibold text-gray-900">{withdrawApp?.jobTitle}</span>?
            </p>
            
            <div className="space-y-2">
              <label htmlFor="withdraw-reason" className="text-sm font-medium text-gray-700">
                Please select a reason <span className="text-red-500">*</span>
              </label>
              <select
                id="withdraw-reason"
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                disabled={isWithdrawing}
              >
                <option value="" disabled>Select an option</option>
                <option value="Accepted another offer">Accepted another offer</option>
                <option value="Compensation mismatch">Compensation mismatch</option>
                <option value="Role mismatch">Role mismatch</option>
                <option value="Delay in process">Delay in process</option>
                <option value="Lack of updates">Lack of updates</option>
                <option value="Personal reasons">Personal reasons</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <p className="text-xs text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
              Note: This action cannot be undone. You will not be able to reapply for this specific position once withdrawn.
            </p>
          </div>
          <div className="flex justify-end gap-3">`;

content = content.replace(oldDialogContent, newDialogContent);

// Reset reason on close
const oldDialogReset = `      <Dialog open={!!withdrawApp} onOpenChange={(open) => !open && setWithdrawApp(null)}>`;
const newDialogReset = `      <Dialog open={!!withdrawApp} onOpenChange={(open) => {
        if (!open) {
          setWithdrawApp(null);
          setWithdrawReason("");
        }
      }}>`;

content = content.replace(oldDialogReset, newDialogReset);

const oldCancelBtn = `onClick={() => setWithdrawApp(null)}`;
const newCancelBtn = `onClick={() => { setWithdrawApp(null); setWithdrawReason(""); }}`;
content = content.replace(oldCancelBtn, newCancelBtn);

fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
console.log("Patched my-jobs-tab.tsx successfully.");
