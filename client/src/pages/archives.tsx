import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

const getCriticalityColor = (criticality: string) => {
  switch (criticality) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'LOW':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Archives() {
  const [visibleRows, setVisibleRows] = useState(10);

  // Fetch archived requirements from API
  const { data: archivedRequirements = [], isLoading } = useQuery({
    queryKey: ['admin', 'archived-requirements'],
    queryFn: async () => {
      const response = await fetch('/api/admin/archived-requirements');
      if (!response.ok) throw new Error('Failed to fetch archived requirements');
      return response.json();
    }
  });

  const handleViewMore = () => {
    if (visibleRows >= archivedRequirements.length) {
      setVisibleRows(10);
    } else {
      setVisibleRows(prev => Math.min(prev + 5, archivedRequirements.length));
    }
  };

  const displayedData = archivedRequirements.slice(0, visibleRows);
  const isShowingAll = visibleRows >= archivedRequirements.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
            data-testid="button-back-to-admin"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Archived Requirements</h1>
        </div>

        {/* Archives Table */}
        <Card>
          <CardHeader>
            <CardTitle>Archived Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>
            ) : archivedRequirements.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">No archived requirements found.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Position</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Criticality</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Company</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Team Lead</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Archived Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((requirement: any) => (
                        <tr key={requirement.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium text-sm">{requirement.position}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded ${getCriticalityColor(requirement.criticality)}`}>
                              {requirement.criticality}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.company}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.spoc}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.talentAdvisor || 'Unassigned'}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.teamLead || 'Unassigned'}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                            {requirement.archivedAt ? new Date(requirement.archivedAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* View More/Less Button */}
                {archivedRequirements.length > 10 && (
                  <div className="flex justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleViewMore}
                      className="px-6 py-2 rounded bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
                      data-testid="button-view-more"
                    >
                      {isShowingAll ? 'View Less' : 'View More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
