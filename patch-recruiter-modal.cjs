const fs = require('fs');

let content = fs.readFileSync('client/src/pages/recruiter-dashboard-2.tsx', 'utf8');

const targetDropdowns = `              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white transition-colors hover:border-gray-400"
                    value={updateDropdown1}
                    onChange={(e) => setUpdateDropdown1(e.target.value)}
                  >
                    <option value="" disabled>Select a message...</option>
                    <option value="Awaiting feedback. I'll update you within">Awaiting feedback. I'll update you within</option>
                    <option value="Hello! Internal review is in progress. I'll update you within">Hello! Internal review is in progress. I'll update you within</option>
                    <option value="Hi There! Scheduling is in progress. I'll update you within">Hi There! Scheduling is in progress. I'll update you within</option>
                    <option value="Sorry. Unexpected internal delay. Expect an update within">Sorry. Unexpected internal delay. Expect an update within</option>
                    <option value="I have news. I'll connect with you within">I have news. I'll connect with you within</option>
                    <option value="Sorry. Position Seems to be Paused for now. Expect an update within">Sorry. Position Seems to be Paused for now. Expect an update within</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white transition-colors hover:border-gray-400"
                    value={updateDropdown2}
                    onChange={(e) => setUpdateDropdown2(e.target.value)}
                  >
                    <option value="" disabled>Select a timeframe...</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="6 Hours">6 Hours</option>
                    <option value="12 Hours">12 Hours</option>
                    <option value="24 Hours">24 Hours</option>
                    <option value="2 Days">2 Days</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2 Weeks">2 Weeks</option>
                  </select>
                </div>
              </div>`;

const newDropdowns = `              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Message Template</Label>
                  <Select value={updateDropdown1} onValueChange={setUpdateDropdown1}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 rounded-full h-11 text-sm bg-white">
                      <SelectValue placeholder="Select a message..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Awaiting feedback. I'll update you within">Awaiting feedback. I'll update you within</SelectItem>
                      <SelectItem value="Hello! Internal review is in progress. I'll update you within">Hello! Internal review is in progress. I'll update you within</SelectItem>
                      <SelectItem value="Hi There! Scheduling is in progress. I'll update you within">Hi There! Scheduling is in progress. I'll update you within</SelectItem>
                      <SelectItem value="Sorry. Unexpected internal delay. Expect an update within">Sorry. Unexpected internal delay. Expect an update within</SelectItem>
                      <SelectItem value="I have news. I'll connect with you within">I have news. I'll connect with you within</SelectItem>
                      <SelectItem value="Sorry. Position Seems to be Paused for now. Expect an update within">Sorry. Position Seems to be Paused for now. Expect an update within</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Timeframe</Label>
                  <Select value={updateDropdown2} onValueChange={setUpdateDropdown2}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500 rounded-full h-11 text-sm bg-white">
                      <SelectValue placeholder="Select a timeframe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2 Hours">2 Hours</SelectItem>
                      <SelectItem value="6 Hours">6 Hours</SelectItem>
                      <SelectItem value="12 Hours">12 Hours</SelectItem>
                      <SelectItem value="24 Hours">24 Hours</SelectItem>
                      <SelectItem value="2 Days">2 Days</SelectItem>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>`;

if (content.includes(targetDropdowns)) {
    content = content.replace(targetDropdowns, newDropdowns);
    // also remove any arbitrary max-h from DialogContent if present, or add overflow-visible
    content = content.replace('<DialogContent className="sm:max-w-md">', '<DialogContent className="sm:max-w-md overflow-visible">');
    fs.writeFileSync('client/src/pages/recruiter-dashboard-2.tsx', content);
    console.log("Patched recruiter-dashboard-2.tsx successfully.");
} else {
    console.log("Could not find dropdowns in recruiter-dashboard-2.tsx");
}

let nudgesTabContent = fs.readFileSync('client/src/components/dashboard/tabs/nudges-tab.tsx', 'utf8');
const targetHeader = `                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Escalation Level</th>
                </tr>`;
const newHeader = `                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Escalation Level</th>
                  <th className="text-left py-3 px-6 font-bold text-gray-700 text-[11px] uppercase tracking-wider">Updates</th>
                </tr>`;

const targetRow = `                      <td className="py-3 px-6">
                        <Badge className="text-xs capitalize" variant={nudge.escalationLevel === 'recruiter' ? 'secondary' : 'destructive'}>
                          {nudge.escalationLevel.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>`;
const newRow = `                      <td className="py-3 px-6">
                        <Badge className="text-xs capitalize" variant={nudge.escalationLevel === 'recruiter' ? 'secondary' : 'destructive'}>
                          {nudge.escalationLevel.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        {nudge.message ? (
                          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">{nudge.message}</span>
                        ) : nudge.isResponded ? (
                          <span className="text-xs text-green-700 font-medium">Updated</span>
                        ) : nudge.isEscalated ? (
                          <span className="text-xs text-red-600 font-medium">Escalated</span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>`;

if (nudgesTabContent.includes(targetHeader)) {
    nudgesTabContent = nudgesTabContent.replace(targetHeader, newHeader);
    nudgesTabContent = nudgesTabContent.replace(targetRow, newRow);
    fs.writeFileSync('client/src/components/dashboard/tabs/nudges-tab.tsx', nudgesTabContent);
    console.log("Patched nudges-tab.tsx successfully.");
} else {
    console.log("Could not find header in nudges-tab.tsx");
}
