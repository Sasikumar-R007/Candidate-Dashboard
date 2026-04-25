import { useJobApplications } from "@/hooks/use-job-applications";

export default function CandidateMetrics() {
  const { data: jobApplications = [] } = useJobApplications();

  // Logic to calculate real metrics
  const appliedCount = jobApplications.length;
  const rejectedCount = jobApplications.filter(a => a.status === 'Rejected').length;
  const interviewCount = jobApplications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Shortlisted').length;
  
  // TAT and Feedback set to 0 as requested for later implementation
  const tatValue = "0"; 
  const feedbackReceived = jobApplications.filter(a => a.status === 'Feedback Received').length || 0;
  const pendingFeedback = jobApplications.filter(a => a.status === 'Pending Feedback').length || 0;

  const metrics = [
    {
      label: 'TAT',
      sublabel: 'Recruiter reply time',
      value: tatValue,
      bgColor: 'bg-[#F2F4F7]',
      textColor: 'text-[#344054]',
      disabled: true
    },
    {
      label: 'JOBS',
      sublabel: 'Applied',
      value: appliedCount,
      bgColor: 'bg-[#EFF8FF]',
      textColor: 'text-[#175CD3]'
    },
    {
      label: 'REJECTED',
      sublabel: 'On Applications',
      value: rejectedCount,
      bgColor: 'bg-[#F2F4F7]',
      textColor: 'text-[#D92D20]'
    },
    {
      label: 'INTERVIEWS',
      sublabel: 'In Process',
      value: interviewCount,
      bgColor: 'bg-[#EFF8FF]',
      textColor: 'text-[#175CD3]'
    },
    {
      label: 'FEEDBACK',
      sublabel: 'Received',
      value: feedbackReceived,
      bgColor: 'bg-[#F2F4F7]',
      textColor: 'text-[#344054]'
    },
    {
      label: 'PENDING',
      sublabel: 'Feedback',
      value: pendingFeedback,
      bgColor: 'bg-[#EFF8FF]',
      textColor: 'text-[#175CD3]'
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-6 font-poppins">
        Candidate Metrics
      </h2>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className={`${metric.bgColor} p-4 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-all cursor-default ${metric.disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <div className={`flex items-center justify-between ${metric.disabled ? 'select-none' : ''}`}>
              <div>
                <span className="text-lg font-bold text-gray-800">{metric.label}</span>
                <span className="text-xs text-gray-500 ml-2 font-medium">{metric.sublabel}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.textColor}`}>
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
