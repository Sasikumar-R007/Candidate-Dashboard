const fs = require('fs');
let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

// 1. Add state variable for the withdraw application
content = content.replace(
  "const [showApplicationModal, setShowApplicationModal] = useState(false);",
  "const [showApplicationModal, setShowApplicationModal] = useState(false);\n  const [withdrawApp, setWithdrawApp] = useState<JobApplication | null>(null);\n  const [isWithdrawing, setIsWithdrawing] = useState(false);"
);

// 2. Replace handleWithdraw function
const oldHandleWithdraw = `  const handleWithdraw = (application: JobApplication) => {
    toast({
      title: "Confirm Withdrawal",
      description: \`Are you sure you want to withdraw your application for \${application.jobTitle}?\`,
      variant: "destructive",
      // Add action button to toast or show a separate dialog
    });
  };`;

const newHandleWithdraw = `  const handleWithdraw = (application: JobApplication) => {
    setWithdrawApp(application);
  };

  const executeWithdraw = async () => {
    if (!withdrawApp) return;
    setIsWithdrawing(true);
    try {
      await apiRequest('POST', \`/api/applications/\${withdrawApp.id}/withdraw\`, {});
      toast({
        title: "Application Withdrawn",
        description: \`You have successfully withdrawn from \${withdrawApp.jobTitle}.\`,
      });
      setWithdrawApp(null);
      queryClient.invalidateQueries({ queryKey: ['/api/job-applications'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to withdraw application",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };`;

content = content.replace(oldHandleWithdraw, newHandleWithdraw);

// 3. Append the Dialog at the end of the return statement
const oldReturnEnd = `        </div>
      )}
    </>
  );
}`;

const newReturnEnd = `        </div>
      )}
      
      {/* Withdraw Confirmation Dialog */}
      <Dialog open={!!withdrawApp} onOpenChange={(open) => !open && setWithdrawApp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to withdraw your application for <span className="font-semibold text-gray-900">{withdrawApp?.jobTitle}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. You will not be able to reapply for this specific position once withdrawn.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setWithdrawApp(null)}
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeWithdraw}
              disabled={isWithdrawing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}`;

content = content.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
console.log("Successfully patched my-jobs-tab.tsx");
