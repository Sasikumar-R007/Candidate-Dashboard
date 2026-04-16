const fs = require('fs');
const file = 'c:/Users/sasir/OneDrive/Documents/Sasikumar R/StaffOS NEW/Candidate-Dashboard/client/src/pages/team-leader-dashboard.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = "              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${\n                String(job.status || '').toLowerCase() === 'active'\n                  ? 'bg-emerald-100 text-emerald-700'\n      name: member.name,\n      role: member.position || 'Recruiter',\n      status: member.status || 'online'\n    }));";

const replaceStr = `              <span className={\`rounded-full px-3 py-1 text-xs font-semibold \${
                String(job.status || '').toLowerCase() === 'active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }\`}>
                {job.status || 'Unknown'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Experience</p>
                <p className="mt-1 font-medium text-slate-800">{job.experience || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Location</p>
                <p className="mt-1 font-medium text-slate-800">{job.location || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Work Mode</p>
                <p className="mt-1 font-medium text-slate-800">{job.workMode || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Posted Date</p>
                <p className="mt-1 font-medium text-slate-800">{formatSourcingDate(job.postedDate || job.createdAt)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-blue-50 px-3 py-3 text-sm text-slate-700">
              <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Package</p>
              <p className="mt-1 font-medium text-slate-900">{job.salaryPackage || \`\${job.salaryMin ? job.salaryMin/100000 + 'L - ' : ''}\${job.salaryMax ? job.salaryMax/100000 + 'L' : ''}\`}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEditJob(job)}
              >
                <EditIcon className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Static priority distribution - fixed counts that never change
  const priorityDistribution = {
    HIGH: { Easy: 6, Medium: 4, Tough: 2 },
    MEDIUM: { Easy: 5, Medium: 3, Tough: 2 },
    LOW: { Easy: 4, Medium: 3, Tough: 2 },
  };

  // Chat team members are derived from real team members query
  const chatTeamMembers = useMemo(() => {
    return (teamMembers || []).map((member: any) => ({
      id: String(member.id),
      name: member.name,
      role: member.position || 'Recruiter',
      status: member.status || 'online'
    }));`;

if (data.includes(targetStr)) {
  fs.writeFileSync(file, data.replace(targetStr, replaceStr));
  console.log("SUCCESS!");
} else {
  console.log("TARGET STRING NOT FOUND");
}
