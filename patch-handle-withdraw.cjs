const fs = require('fs');
let content = fs.readFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', 'utf8');

const targetStr = `  const handleWithdraw = (application: JobApplication) => {
    toast({
      title: "Confirm Withdrawal",
      description: \`Are you sure you want to withdraw your application for \${application.jobTitle}?\`,
      variant: "destructive",
      // Add action button to toast or show a separate dialog
    });
  };`;

const newStr = `  const handleWithdraw = (application: any) => {
    setWithdrawApp(application);
  };`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
    console.log("Patched handleWithdraw successfully.");
} else {
    // try a regex approach
    const regex = /  const handleWithdraw = \(application: JobApplication\) => \{[\s\S]*?  \};/;
    if (regex.test(content)) {
        content = content.replace(regex, newStr);
        fs.writeFileSync('client/src/components/dashboard/tabs/my-jobs-tab.tsx', content);
        console.log("Patched handleWithdraw using regex successfully.");
    } else {
        console.log("Could not find handleWithdraw.");
    }
}
