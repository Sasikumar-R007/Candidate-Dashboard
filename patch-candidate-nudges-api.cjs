const fs = require('fs');

let content = fs.readFileSync('server/routes.ts', 'utf8');

const targetRegex = /  app\.get\("\/api\/candidate\/applications", requireCandidateAuth, async \(req, res\) => \{[\s\S]*?    \}\n  \}\);/m;

const newEndpoint = `
  app.get("/api/candidate/nudges", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.user?.id;
      if (!candidateId) return res.status(401).json({ message: "Unauthorized" });

      const allNudges = await storage.getActiveNudges();
      const candidateNudges = allNudges.filter(n => n.candidateId === candidateId);
      
      // Sort by latest first
      candidateNudges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(candidateNudges);
    } catch (error) {
      console.error('Fetch candidate nudges error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });`;

if (targetRegex.test(content)) {
  const match = content.match(targetRegex)[0];
  content = content.replace(targetRegex, match + newEndpoint);
  fs.writeFileSync('server/routes.ts', content);
  console.log("Patched server/routes.ts to add /api/candidate/nudges");
} else {
  // Try another place if not found
  const fallbackRegex = /  app\.get\("\/api\/nudges", requireEmployeeAuth, async \(req, res\) => \{/m;
  if (fallbackRegex.test(content)) {
    content = content.replace(fallbackRegex, newEndpoint.trim() + '\n\n  app.get("/api/nudges", requireEmployeeAuth, async (req, res) => {');
    fs.writeFileSync('server/routes.ts', content);
    console.log("Patched server/routes.ts to add /api/candidate/nudges (fallback location)");
  } else {
    console.log("Could not find suitable place to patch server/routes.ts");
  }
}
