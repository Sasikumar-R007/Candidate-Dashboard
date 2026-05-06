const fs = require('fs');

let c = fs.readFileSync('server/routes.ts', 'utf8');

const targetLines = [
  '  app.post("/api/nudges/:id/respond", requireEmployeeAuth, async (req, res) => {',
  '    try {',
  '      const { id } = req.params;',
  '      const nudge = await storage.markNudgeAsResponded(id);'
];

const replaceLines = [
  '  app.post("/api/nudges/:id/respond", requireEmployeeAuth, async (req, res) => {',
  '    try {',
  '      const { id } = req.params;',
  '      const { message } = req.body;',
  '      const nudge = await storage.markNudgeAsResponded(id, message);'
];

const targetLF = targetLines.join('\\n');
const targetCRLF = targetLines.join('\\r\\n');

const replaceLF = replaceLines.join('\\n');
const replaceCRLF = replaceLines.join('\\r\\n');

if (c.includes(targetLF)) {
  c = c.replace(targetLF, replaceLF);
  fs.writeFileSync('server/routes.ts', c);
  console.log("Patched server/routes.ts (LF)");
} else if (c.includes(targetCRLF)) {
  c = c.replace(targetCRLF, replaceCRLF);
  fs.writeFileSync('server/routes.ts', c);
  console.log("Patched server/routes.ts (CRLF)");
} else {
  console.log("Could not find target block in server/routes.ts");
}
