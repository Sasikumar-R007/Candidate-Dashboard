import { useState } from 'react';
import AdminSidebar from '@/components/dashboard/admin-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// Admin profile fallback data
const adminProfile = {
  name: "John Mathew",
  role: "CEO",
  email: "john@scalingtheory.com", 
  phone: "90347 59099",
  bannerImage: null as string | null,
  profilePicture: null as string | null
};

// Sample archived requirements data
const archivedRequirements = [
  { id: 1, position: "DevOps Engineer", criticality: "HIGH", company: "Netflix", spoc: "Sarah Connor", talentAdvisor: "John Smith", teamLead: "Arun", archivedDate: "2024-12-15", reason: "Position Filled" },
  { id: 2, position: "Data Scientist", criticality: "MEDIUM", company: "Google", spoc: "Mark Johnson", talentAdvisor: "Emma Wilson", teamLead: "Anusha", archivedDate: "2024-12-10", reason: "Client Cancelled" },
  { id: 3, position: "Product Manager", criticality: "HIGH", company: "Microsoft", spoc: "Lisa Park", talentAdvisor: "Robert Kim", teamLead: "Arun", archivedDate: "2024-12-08", reason: "Budget Constraints" },
  { id: 4, position: "iOS Developer", criticality: "MEDIUM", company: "Apple", spoc: "Steve Rogers", talentAdvisor: "David Wilson", teamLead: "Anusha", archivedDate: "2024-12-05", reason: "Position Filled" },
  { id: 5, position: "Machine Learning Engineer", criticality: "HIGH", company: "Tesla", spoc: "Tony Stark", talentAdvisor: "Peter Parker", teamLead: "Arun", archivedDate: "2024-12-01", reason: "Client Cancelled" },
  { id: 6, position: "Security Analyst", criticality: "LOW", company: "Meta", spoc: "Bruce Wayne", talentAdvisor: "Clark Kent", teamLead: "Anusha", archivedDate: "2024-11-28", reason: "Position Filled" },
  { id: 7, position: "Cloud Architect", criticality: "HIGH", company: "Amazon", spoc: "Diana Prince", talentAdvisor: "Barry Allen", teamLead: "Arun", archivedDate: "2024-11-25", reason: "Budget Constraints" },
  { id: 8, position: "Blockchain Developer", criticality: "MEDIUM", company: "Coinbase", spoc: "Natasha Romanoff", talentAdvisor: "Clint Barton", teamLead: "Anusha", archivedDate: "2024-11-20", reason: "Client Cancelled" },
];

const getCriticalityColor = (criticality: string) => {
  switch (criticality) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800';
    case 'LOW':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Archives() {
  const [, navigate] = useLocation();
  const [visibleRows, setVisibleRows] = useState(10);
  const [activeTab, setActiveTab] = useState('requirements');

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminProfileHeader profile={adminProfile} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Requirements
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Archives</h1>
            </div>

            {/* Archives Table */}
            <Card>
              <CardHeader>
                <CardTitle>Archived Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Position</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Criticality</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">SPOC</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Talent Advisor</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Team Lead</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Archived Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((requirement) => (
                        <tr key={requirement.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{requirement.position}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded ${getCriticalityColor(requirement.criticality)}`}>
                              {requirement.criticality}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.company}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.spoc}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.talentAdvisor}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.teamLead}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.archivedDate}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{requirement.reason}</td>
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
                    >
                      {isShowingAll ? 'View Less' : 'View More'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}