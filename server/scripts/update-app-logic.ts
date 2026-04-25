import fs from 'fs';
import path from 'path';

const appPath = path.resolve('client/src/App.tsx');
let content = fs.readFileSync(appPath, 'utf-8');

// Add import
if (!content.includes('CandidateResumeUpload')) {
  content = content.replace(
    "import CandidateRegistration from \"@/pages/candidate-registration\";",
    "import CandidateRegistration from \"@/pages/candidate-registration\";\nimport CandidateResumeUpload from \"@/pages/candidate-resume-upload\";"
  );
}

// Add route
if (!content.includes('/candidate/upload-resume')) {
  content = content.replace(
    '<Route path="/candidate-registration" component={CandidateRegistration} />',
    '<Route path="/candidate-registration" component={CandidateRegistration} />\n      <Route path="/candidate/upload-resume" component={CandidateResumeUpload} />'
  );
}

fs.writeFileSync(appPath, content);
console.log('App.tsx updated successfully');
