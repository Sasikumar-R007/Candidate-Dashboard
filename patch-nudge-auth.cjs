const fs = require('fs');

let content = fs.readFileSync('server/routes.ts', 'utf8');

const targetRoute = `app.get("/api/candidate/nudges", requireCandidateAuth, async (req, res) => {
    try {
      const candidateId = req.user?.id;
      if (!candidateId) return res.status(401).json({ message: "Unauthorized" });

      const allNudges = await storage.getActiveNudges();
      const candidateNudges = allNudges.filter(n => n.candidateId === candidateId);`;

const replaceRoute = `app.get("/api/candidate/nudges", requireCandidateAuth, async (req, res) => {
    try {
      const candidateStringId = req.session.candidateId;
      if (!candidateStringId) return res.status(401).json({ message: "Unauthorized" });
      
      const candidate = await storage.getCandidateByCandidateId(candidateStringId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const candidateUuid = candidate.id;

      const allNudges = await storage.getActiveNudges();
      const candidateNudges = allNudges.filter(n => n.candidateId === candidateUuid);`;

if (content.includes(targetRoute)) {
  content = content.replace(targetRoute, replaceRoute);
  fs.writeFileSync('server/routes.ts', content);
  console.log("Patched /api/candidate/nudges auth logic.");
} else {
  console.log("Target route not found. Might need to use regex or another string.");
}
