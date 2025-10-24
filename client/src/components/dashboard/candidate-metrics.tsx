export default function CandidateMetrics() {
  // Mock data for demonstration - in a real app, this would come from API
  const metrics = [
    {
      label: 'TAT',
      sublabel: 'Recruiter reply time',
      value: '24',
      bgColor: 'bg-cyan-50',
      textColor: 'text-gray-700'
    },
    {
      label: 'JOBS',
      sublabel: 'Applied',
      value: '24',
      bgColor: 'bg-cyan-50',
      textColor: 'text-gray-700'
    },
    {
      label: 'REJECTED',
      sublabel: 'On Applications',
      value: '14',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      label: 'INTERVIEWS',
      sublabel: 'In Process',
      value: '10',
      bgColor: 'bg-cyan-50',
      textColor: 'text-gray-700'
    },
    {
      label: 'FEEDBACK',
      sublabel: 'Received',
      value: '9',
      bgColor: 'bg-cyan-50',
      textColor: 'text-gray-700'
    },
    {
      label: 'PENDING',
      sublabel: 'Feedback',
      value: '3',
      bgColor: 'bg-cyan-50',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Candidate Metrics
      </h2>
      <div className="space-y-0">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className={`${metric.bgColor} p-4 border-b border-gray-200 last:border-b-0`}
            data-testid={`metric-${metric.label.toLowerCase()}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-800 dark:text-gray-900">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-700">
                  {metric.sublabel}
                </div>
              </div>
              <div className={`text-3xl font-bold ${metric.textColor}`}>
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
