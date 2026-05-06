const fs = require('fs');

let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

const regex1 = /<td className="px-4 py-3">\s*\{nudge\.isResponded \? \(\s*<span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">\s*Updated\s*<\/span>\s*\) : nudge\.isEscalated/g;

const replace1 = `<td className="px-4 py-3">
                          {nudge.message ? (
                            <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">
                              {nudge.message}
                            </span>
                          ) : nudge.isResponded ? (
                            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              Updated
                            </span>
                          ) : nudge.isEscalated`;

if (regex1.test(content)) {
  content = content.replace(regex1, replace1);
  fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
  console.log("Patched my-jobs-tab.tsx for Candidate message display successfully");
} else {
  console.log("Could not find the target regex in my-jobs-tab.tsx");
}
