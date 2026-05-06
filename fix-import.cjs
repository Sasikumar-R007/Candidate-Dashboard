const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin-dashboard.tsx', 'utf8');

// Replace the bad import with the correct one
content = content.replace(
  "import NudgesTab from '@/components/dashboard/tabs/NudgesTab';",
  "import NudgesTab from '@/components/dashboard/tabs/nudges-tab';"
);

fs.writeFileSync('client/src/pages/admin-dashboard.tsx', content);
console.log("Replaced import successfully.");
