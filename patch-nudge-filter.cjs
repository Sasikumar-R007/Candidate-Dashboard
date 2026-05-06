const fs = require('fs');
let content = fs.readFileSync('server/routes.ts', 'utf8');

const target = `      const candidateUuid = candidate.id;

      const allNudges = await storage.getActiveNudges();
      const candidateNudges = allNudges.filter(n => n.candidateId === candidateUuid);`;

const replace = `      const candidateUuid = candidate.id;

      const allNudges = await storage.getActiveNudges();
      const candidateNudges = allNudges.filter(n => 
        n.candidateId === candidate.id || 
        n.candidateId === candidate.candidateId || 
        n.candidateId === candidateStringId
      );`;

if (content.includes(target)) {
  content = content.replace(target, replace);
  fs.writeFileSync('server/routes.ts', content);
  console.log("Patched filter in /api/candidate/nudges");
} else {
  console.log("Could not find target in routes.ts");
}
