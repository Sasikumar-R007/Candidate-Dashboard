const fs = require('fs');

let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

const targetLines = [
  `  const { data: candidateNudges = [] } = useQuery<any[]>({`,
  `    queryKey: ['/api/candidate/nudges'],`,
  `  });`,
  `  const [showAllNudgesDialog, setShowAllNudgesDialog] = useState(false);`
];

const targetStrLF = targetLines.join('\\n');
const targetStrCRLF = targetLines.join('\\r\\n');

const duplicateLF = targetStrLF + '\\n' + targetStrLF;
const duplicateCRLF = targetStrCRLF + '\\r\\n' + targetStrCRLF;

if (content.includes(duplicateLF)) {
  content = content.replace(duplicateLF, targetStrLF);
  fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
  console.log("Removed duplicate declaration (LF)");
} else if (content.includes(duplicateCRLF)) {
  content = content.replace(duplicateCRLF, targetStrCRLF);
  fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
  console.log("Removed duplicate declaration (CRLF)");
} else {
  // Try line by line approach
  const lines = content.split(/\\r?\\n/);
  const newLines = [];
  let foundDecl = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const { data: candidateNudges = [] } = useQuery')) {
      if (foundDecl) {
        // Skip the next 3 lines as well
        i += 3;
        continue;
      }
      foundDecl = true;
    }
    newLines.push(lines[i]);
  }
  fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', newLines.join('\\n'));
  console.log("Removed duplicate declaration (line-by-line fallback)");
}
