import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: number;
  bgColor: string;
  textColor?: string;
}

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: number;
  bgColor: string;
  textColor?: string;
  highlightValue?: boolean;
}

function MetricCard({ title, subtitle, value, bgColor, textColor = "text-slate-600", highlightValue = false }: MetricCardProps) {
  return (
    <Card className={`${bgColor} border-0 shadow-sm rounded`}>
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className={`font-medium text-sm ${textColor}`}>
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
          <div className={`text-2xl font-bold pt-1 ${highlightValue ? 'text-orange-600' : 'text-slate-800'}`}>
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidateMetricsSidebar() {
  const metrics = [
    {
      title: "TAT",
      subtitle: "Recruiter reply time",
      value: 24,
      bgColor: "bg-cyan-50"
    },
    {
      title: "JOBS",
      subtitle: "Applied",
      value: 24,
      bgColor: "bg-blue-50"
    },
    {
      title: "REJECTED",
      subtitle: "On Applications",
      value: 14,
      bgColor: "bg-orange-50",
      highlightValue: true
    },
    {
      title: "INTERVIEWS",
      subtitle: "In Process",
      value: 10,
      bgColor: "bg-green-50"
    },
    {
      title: "FEEDBACK",
      subtitle: "Received",
      value: 9,
      bgColor: "bg-purple-50"
    },
    {
      title: "PENDING",
      subtitle: "Feedback",
      value: 3,
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <div className="w-full bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Candidate Metrics
        </h2>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              subtitle={metric.subtitle}
              value={metric.value}
              bgColor={metric.bgColor}
              highlightValue={metric.highlightValue}
            />
          ))}
        </div>
      </div>
    </div>
  );
}