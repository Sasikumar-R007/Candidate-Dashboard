export default function CandidateMetrics() {
  // Mock data for demonstration - in a real app, this would come from API
  const metrics = [
    {
      label: 'TAT',
      sublabel: 'Recruiter reply time',
      value: '24',
      bgColor: 'bg-white',
      textColor: 'text-gray-800'
    },
    {
      label: 'JOBS',
      sublabel: 'Applied',
      value: '24',
      bgColor: 'bg-white',
      textColor: 'text-gray-800'
    },
    {
      label: 'REJECTED',
      sublabel: 'On Applications',
      value: '14',
      bgColor: 'bg-white',
      textColor: 'text-orange-600'
    },
    {
      label: 'INTERVIEWS',
      sublabel: 'In Process',
      value: '10',
      bgColor: 'bg-white',
      textColor: 'text-gray-800'
    },
    {
      label: 'FEEDBACK',
      sublabel: 'Received',
      value: '9',
      bgColor: 'bg-white',
      textColor: 'text-gray-800'
    },
    {
      label: 'PENDING',
      sublabel: 'Feedback',
      value: '3',
      bgColor: 'bg-white',
      textColor: 'text-gray-800'
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Candidate Metrics
      </h2>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className={`${metric.bgColor} p-4 rounded-lg border border-gray-200`}
            data-testid={`metric-${metric.label.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                {metric.label} {metric.sublabel}:
              </div>
              <div className={`text-xl font-bold ${metric.textColor}`}>
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
