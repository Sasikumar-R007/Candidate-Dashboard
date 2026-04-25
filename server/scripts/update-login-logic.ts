import fs from 'fs';
import path from 'path';

const loginPath = path.resolve('client/src/pages/candidate-login.tsx');
let content = fs.readFileSync(loginPath, 'utf-8');

// Update redirect
if (content.includes("setLocation('/candidate');")) {
  content = content.replace(
    "setLocation('/candidate');",
    "if (response.candidate.registrationStage === 'completed') { setLocation('/candidate'); } else { setLocation('/candidate/upload-resume'); }"
  );
}

fs.writeFileSync(loginPath, content);
console.log('CandidateLogin.tsx updated successfully');
