const fs = require('fs');
let content = fs.readFileSync('client/src/pages/admin-dashboard.tsx', 'utf8');

// Insert import
content = content.replace(
  "import { ChatDock } from '@/components/chat/chat-dock';",
  "import { ChatDock } from '@/components/chat/chat-dock';\nimport NudgesTab from '@/components/dashboard/tabs/NudgesTab';"
);

// Insert switch case
const targetCase = "      case 'dashboard':\r\n        // Dashboard shows the Team section with tabs (team, requirements, pipeline, etc.)\r\n        return (\r\n          <div className=\"flex flex-col h-full\">\r\n            <div className=\"flex-1 overflow-y-auto admin-scrollbar\">\r\n              {renderTabContent()}\r\n            </div>\r\n          </div>\r\n        );";
const replacementCase = "      case 'dashboard':\r\n        // Dashboard shows the Team section with tabs (team, requirements, pipeline, etc.)\r\n        return (\r\n          <div className=\"flex flex-col h-full\">\r\n            <div className=\"flex-1 overflow-y-auto admin-scrollbar\">\r\n              {renderTabContent()}\r\n            </div>\r\n          </div>\r\n        );\r\n      case 'nudges':\r\n        return <NudgesTab />;";

if (content.includes(targetCase)) {
  content = content.replace(targetCase, replacementCase);
  console.log("Successfully replaced target case.");
} else {
  // Try with just \n
  const targetCaseUnix = targetCase.replace(/\r\n/g, '\n');
  const replacementCaseUnix = replacementCase.replace(/\r\n/g, '\n');
  if (content.includes(targetCaseUnix)) {
    content = content.replace(targetCaseUnix, replacementCaseUnix);
    console.log("Successfully replaced target case (Unix endings).");
  } else {
    console.log("Target case not found!");
  }
}

fs.writeFileSync('client/src/pages/admin-dashboard.tsx', content);
