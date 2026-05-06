const fs = require('fs');

let clientContent = fs.readFileSync('client/src/pages/recruiter-dashboard-2.tsx', 'utf8');

const target1 = `<Badge className="bg-green-100 hover:bg-green-100 text-green-700 border-0 pointer-events-none">Updated</Badge>`;
const replace1 = `<Badge className="bg-green-100 hover:bg-green-100 text-green-700 border-0" title={nudge.message || "Updated candidate"}>Updated</Badge>`;

const target2 = `<Badge className="bg-red-100 hover:bg-red-100 text-red-700 border-0 pointer-events-none">Escalated</Badge>`;
const replace2 = `<Badge className="bg-red-100 hover:bg-red-100 text-red-700 border-0" title={nudge.message || "Escalated due to no response"}>Escalated</Badge>`;

if (clientContent.includes(target1)) {
    clientContent = clientContent.replace(target1, replace1);
    clientContent = clientContent.replace(target2, replace2);
    fs.writeFileSync('client/src/pages/recruiter-dashboard-2.tsx', clientContent);
    console.log("Patched recruiter-dashboard-2.tsx with title tooltips (removed pointer-events-none)");
} else {
    console.log("Could not find targets in recruiter-dashboard-2.tsx");
}
