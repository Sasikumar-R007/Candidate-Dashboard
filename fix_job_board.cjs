const fs = require('fs');
const path = 'c:\\Users\\sasir\\OneDrive\\Documents\\Sasikumar R\\StaffOS NEW\\Candidate-Dashboard\\client\\src\\components\\dashboard\\tabs\\job-board-tab.tsx';
let content = fs.readFileSync(path, 'utf8');

// The issue is a premature closing tag and misplaced filters.
// We want to move filters into the sidebar and fix the nesting.

// 1. Remove the extra </div> at line 547 (approximately)
// 2. Remove the filters and closure at line 740.

// Let's look for the specific broken transition.
const brokenTransition = /<\/div>\s*<\/div>\s*\r?\n\s*\r?\n\s*{\/\* Role Category Filter \*\/}/;
const correctTransition = '\n            {/* Role Category Filter */}';

if (content.match(brokenTransition)) {
    console.log('Found broken sidebar transition. Fixing...');
    content = content.replace(brokenTransition, correctTransition);
} else {
    console.log('Broken transition not found with regex. Trying literal match...');
}

// Also fix the end of filters / start of main content
const filterEnd = /<\/div>\s*<\/div>\s*\r?\n\s*{\/\* Main Content Split View/;
const correctFilterEnd = '          </div>\n        </div>\n\n        {/* Main Content Split View';

if (content.match(filterEnd)) {
    console.log('Found broken filter end. Fixing...');
    content = content.replace(filterEnd, correctFilterEnd);
}

fs.writeFileSync(path, content);
console.log('File patched successfully.');
