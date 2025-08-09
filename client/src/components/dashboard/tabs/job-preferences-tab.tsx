import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditJobPreferencesModal from '../modals/edit-job-preferences-modal';
import { useJobPreferences } from '@/hooks/use-profile';

export default function JobPreferencesTab() {
  const [showEditModal, setShowEditModal] = useState(false);
  const { data: preferences, isLoading } = useJobPreferences();

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">Loading preferences...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="px-6 py-6">
        <div className="text-center text-gray-500">No job preferences found</div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">View Job Preferences</h3>
            <Button
              onClick={() => setShowEditModal(true)}
              className="bg-primary-blue text-white hover:bg-blue-800"
              size="sm"
            >
              <i className="fas fa-edit mr-2"></i>Edit
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Job title</h4>
              <p className="text-gray-700">{preferences.jobTitles}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Work mode</h4>
                <p className="text-gray-700">{preferences.workMode}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Employment Type</h4>
                <p className="text-gray-700">{preferences.employmentType}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Location (On-site)</h4>
              <p className="text-gray-700">{preferences.locations}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Start Date</h4>
              <p className="text-gray-700">{preferences.startDate}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Instruction to recruiter</h4>
              <div className="text-gray-700 space-y-1">
                {preferences.instructions?.split('\n').map((line: string, index: number) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditJobPreferencesModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        preferences={preferences}
      />
    </>
  );
}
