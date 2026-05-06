const fs = require('fs');
let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

const regex = /\{nudge\.isResponded \? \([\s\S]*?<span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">[\s\S]*?Updated[\s\S]*?<\/span>[\s\S]*?\) : nudge\.isEscalated \? \(/g;

const replacement = `{nudge.message ? (
                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">
                              {nudge.message}
                            </span>
                          ) : nudge.isResponded ? (
                            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              Updated
                            </span>
                          ) : nudge.isEscalated ? (`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
    console.log("Patched candidate message UI");
} else {
    console.log("Could not find the target to patch");
}
