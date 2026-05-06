const fs = require('fs');
const lines = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{nudge.isResponded ? (')) {
    lines[i] = lines[i].replace('{nudge.isResponded ? (', '{nudge.message ? ( <span className="inline-block px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200">{nudge.message}</span> ) : nudge.isResponded ? (');
  }
}

fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', lines.join('\n'));
console.log('Patched candidate message UI simple way');
