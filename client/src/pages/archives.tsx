import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Briefcase } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Screened Out':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'Archived':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function Archives() {
  const [, setLocation] = useLocation();
  const [visibleRows, setVisibleRows] = useState(10);
  const [visibleCandidateRows, setVisibleCandidateRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');

  // Fetch archived requirements from API
  const { data: archivedRequirements = [], isLoading: isLoadingRequirements } = useQuery({
    queryKey: ['admin', 'archived-requirements'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/archived-requirements', {
          credentials: 'include'
        });
        if (!response.ok) {
          console.warn('Failed to fetch archived requirements:', response.status);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching archived requirements:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch archived candidates (applications with status Screened Out, Rejected, or Archived)
  const { data: archivedCandidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['recruiter', 'archived-candidates'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/recruiter/applications', {
          credentials: 'include'
        });
        if (!response.ok) {
          // Return empty array if request fails instead of throwing
          console.warn('Failed to fetch archived candidates:', response.status);
          return [];
        }
        const allApplications = await response.json();
        // Filter for archived statuses
        if (!Array.isArray(allApplications)) {
          return [];
        }
        return allApplications.filter((app: any) => {
          const status = app.status || app.currentStatus;
          return status === 'Screened Out' || 
                 status === 'Rejected' || 
                 status === 'Archived';
        });
      } catch (error) {
        console.error('Error fetching archived candidates:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleViewMore = () => {
    if (visibleRows >= archivedRequirements.length) {
      setVisibleRows(10);
    } else {
      setVisibleRows(prev => Math.min(prev + 5, archivedRequirements.length));
    }
  };

  const handleViewMoreCandidates = () => {
    if (visibleCandidateRows >= archivedCandidates.length) {
      setVisibleCandidateRows(10);
    } else {
      setVisibleCandidateRows(prev => Math.min(prev + 5, archivedCandidates.length));
    }
  };

  const displayedRequirements = archivedRequirements.slice(0, visibleRows);
  const isShowingAllRequirements = visibleRows >= archivedRequirements.length;

  // Filter candidates by search query
  const filteredCandidates = archivedCandidates.filter((candidate: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      candidate.candidateName?.toLowerCase().includes(query) ||
      candidate.candidateEmail?.toLowerCase().includes(query) ||
      candidate.jobTitle?.toLowerCase().includes(query) ||
      candidate.company?.toLowerCase().includes(query)
    );
  });

  const displayedCandidates = filteredCandidates.slice(0, visibleCandidateRows);
  const isShowingAllCandidates = visibleCandidateRows >= filteredCandidates.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.setItem('recruiterDashboardSidebarTab', 'dashboard');
              setLocation('/recruiter-login-2');
            }}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Archives</h1>
        </div>

        {/* Tabs for Candidates and Requirements */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Archived Candidates
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Archived Requirements
            </TabsTrigger>
          </TabsList>

          {/* Archived Candidates Tab */}
          <TabsContent value="candidates" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Archived Candidates</CardTitle>
                  <div className="w-64">
                    <Input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisibleCandidateRows(10);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCandidates ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No candidates match your search.' : 'No archived candidates found.'}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Candidate Name</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Email</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Job Title</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Company</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                            <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300 text-sm">Archived Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedCandidates.map((candidate: any) => (
                            <tr key={candidate.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="py-3 px-3 text-gray-900 dark:text-white font-medium text-sm">
                                {candidate.candidateName || 'Unknown'}
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {candidate.candidateEmail || 'N/A'}
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {candidate.jobTitle || 'N/A'}
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {candidate.company || 'N/A'}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-xs font-semibold px-3 py-1 rounded ${getStatusColor(candidate.status)}`}>
                                  {candidate.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {candidate.appliedDate 
                                  ? new Date(candidate.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* View More/Less Button */}
                    {filteredCandidates.length > 10 && (
                      <div className="flex justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={handleViewMoreCandidates}
                          className="px-6 py-2 rounded bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
                          data-testid="button-view-more-candidates"
                        >
                          {isShowingAllCandidates ? 'View Less' : 'View More'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archived Requirements Tab */}
          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Archived Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRequirements ? (
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
                          {displayedRequirements.map((requirement: any) => (
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
                          {isShowingAllRequirements ? 'View Less' : 'View More'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
