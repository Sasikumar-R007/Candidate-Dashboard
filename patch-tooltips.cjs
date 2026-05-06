const fs = require('fs');

let clientContent = fs.readFileSync('client/src/pages/recruiter-dashboard-2.tsx', 'utf8');

const badgeTarget1 = `<Badge className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200">Updated</Badge>`;
const badgeReplace1 = `<Badge className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200" title={nudge.message || "Updated candidate"}>Updated</Badge>`;

const badgeTarget2 = `<Badge className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200">Escalated</Badge>`;
const badgeReplace2 = `<Badge className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200" title={nudge.message || "Escalated due to no response"}>Escalated</Badge>`;

if (clientContent.includes(badgeTarget1)) {
    clientContent = clientContent.replace(badgeTarget1, badgeReplace1);
    clientContent = clientContent.replace(badgeTarget2, badgeReplace2);
    fs.writeFileSync('client/src/pages/recruiter-dashboard-2.tsx', clientContent);
    console.log("Patched recruiter-dashboard-2.tsx with title tooltips");
}

let nudgesTabContent = fs.readFileSync('client/src/components/dashboard/tabs/nudges-tab.tsx', 'utf8');

// The new row we added in nudges-tab.tsx:
const spanTarget1 = `<span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">{nudge.message}</span>`;
const spanReplace1 = `<span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded" title={nudge.message}>{nudge.message.length > 20 ? nudge.message.substring(0, 20) + '...' : nudge.message}</span>`;

const spanTarget2 = `<span className="text-xs text-green-700 font-medium">Updated</span>`;
const spanReplace2 = `<span className="text-xs text-green-700 font-medium" title={nudge.message || "Updated"}>Updated</span>`;

if (nudgesTabContent.includes(spanTarget1)) {
    nudgesTabContent = nudgesTabContent.replace(spanTarget1, spanReplace1);
    nudgesTabContent = nudgesTabContent.replace(spanTarget2, spanReplace2);
    fs.writeFileSync('client/src/components/dashboard/tabs/nudges-tab.tsx', nudgesTabContent);
    console.log("Patched nudges-tab.tsx with title tooltips");
}
