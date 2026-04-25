import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchScoreCardProps {
  score?: number; // 0 to 100
  matchLevel?: 'High' | 'Medium' | 'Low';
  isLoading?: boolean;
}

export default function MatchScoreCard({ score = 85, matchLevel, isLoading }: MatchScoreCardProps) {
  // If score is provided, derive level. If level is provided, use it.
  const displayLevel = matchLevel || (score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low');

  const levelConfig = {
    High: { color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", barColor: "bg-green-500" },
    Medium: { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", barColor: "bg-amber-500" },
    Low: { color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", barColor: "bg-slate-500" },
  };

  const config = levelConfig[displayLevel];

  if (isLoading) {
    return <Card className="animate-pulse h-64 bg-white border-slate-200" />;
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden group">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Profile Match Insight
        </CardTitle>
        <Badge variant="outline" className={cn("font-bold", config.color, config.bgColor, config.borderColor)}>
          {displayLevel} Match
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            {/* Simple circular representation or just a big number */}
            <div className="text-5xl font-black text-slate-900 tracking-tighter">
              {score}%
            </div>
            <div className="absolute -top-4 -right-8">
              <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">Alignment with active roles</p>
        </div>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold px-1">
              <span className="text-slate-600 uppercase tracking-wider">Overall Sync</span>
              <span className={config.color}>{score}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-1000 ease-out", config.barColor)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
            <Info className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your <span className="font-bold text-slate-900">semantic profile analysis</span> and <span className="font-bold text-slate-900">skill-syncing</span> with 45+ hiring companies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
