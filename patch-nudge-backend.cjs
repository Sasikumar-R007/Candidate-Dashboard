const fs = require('fs');

// 1. Update server/storage.ts
let storageContent = fs.readFileSync('server/storage.ts', 'utf8');
storageContent = storageContent.replace(
  'markNudgeAsResponded(id: string): Promise<Nudge | undefined>;',
  'markNudgeAsResponded(id: string, message?: string): Promise<Nudge | undefined>;'
);
// Also update MemStorage if it exists
storageContent = storageContent.replace(
  /async markNudgeAsResponded\(id: string\): Promise<Nudge \| undefined> \{/g,
  'async markNudgeAsResponded(id: string, message?: string): Promise<Nudge | undefined> {'
);
storageContent = storageContent.replace(
  /const updatedNudge = \{ \.\.\.nudge, isResponded: true, isRead: true \};/g,
  'const updatedNudge = { ...nudge, isResponded: true, isRead: true, message: message || nudge.message };'
);
fs.writeFileSync('server/storage.ts', storageContent);

// 2. Update server/database-storage.ts
let dbStorageContent = fs.readFileSync('server/database-storage.ts', 'utf8');
dbStorageContent = dbStorageContent.replace(
  'async markNudgeAsResponded(id: string): Promise<Nudge | undefined> {',
  'async markNudgeAsResponded(id: string, message?: string): Promise<Nudge | undefined> {'
);
const dbUpdateTarget = `.set({ isResponded: true, isRead: true })`;
const dbUpdateReplace = `.set({ isResponded: true, isRead: true, ...(message ? { message } : {}) })`;
dbStorageContent = dbStorageContent.replace(dbUpdateTarget, dbUpdateReplace);
fs.writeFileSync('server/database-storage.ts', dbStorageContent);

// 3. Update server/routes.ts
let routesContent = fs.readFileSync('server/routes.ts', 'utf8');
const routeTarget = `  app.post("/api/nudges/:id/respond", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const nudge = await storage.markNudgeAsResponded(id);`;
const routeReplace = `  app.post("/api/nudges/:id/respond", requireEmployeeAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body || {};
      const nudge = await storage.markNudgeAsResponded(id, message);`;
routesContent = routesContent.replace(routeTarget, routeReplace);
fs.writeFileSync('server/routes.ts', routesContent);

// 4. Update client/src/pages/recruiter-dashboard-2.tsx
let clientContent = fs.readFileSync('client/src/pages/recruiter-dashboard-2.tsx', 'utf8');
const mutationTarget = `  const respondMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      const res = await apiRequest('POST', \`/api/nudges/\${nudgeId}/respond\`, {});`;
const mutationReplace = `  const respondMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string, message: string }) => {
      const res = await apiRequest('POST', \`/api/nudges/\${id}/respond\`, { message });`;
clientContent = clientContent.replace(mutationTarget, mutationReplace);

const handleTarget = `  const handleUpdateNudgeConfirm = () => {
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
  };`;
const handleReplace = `  const handleUpdateNudgeConfirm = () => {
    if (!updateModalNudge || !updateDropdown1 || !updateDropdown2) {
      toast({ title: "Error", description: "Please select both options to update the candidate.", variant: "destructive" });
      return;
    }
    
    const message = \`\${updateDropdown1} \${updateDropdown2}\`;
    
    // Fire API call
    respondMutation.mutate({ id: updateModalNudge.id, message });
    
    // Optimistic UI update
    setLocalUpdatedNudges(prev => new Set(prev).add(updateModalNudge.id));
    
    setUpdateModalNudge(null);
    setUpdateDropdown1("");
    setUpdateDropdown2("");
  };`;
clientContent = clientContent.replace(handleTarget, handleReplace);

fs.writeFileSync('client/src/pages/recruiter-dashboard-2.tsx', clientContent);
console.log("Patched all backend endpoints and client for nudge message persistence");
