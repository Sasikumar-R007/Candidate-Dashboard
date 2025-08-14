import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUploadModal from '../modals/file-upload-modal';
import { useSkills, useProfile, useUpdateProfile } from '@/hooks/use-profile';

export default function ResumeTab() {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const isLoading = skillsLoading || profileLoading;

  const handleResumeUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        await updateProfile.mutateAsync({ resumeFile: result.url });
        
        // Log activity for resume upload
        try {
          await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: 'Resume updated',
              type: 'resume_upload'
            }),
          });
        } catch (error) {
          console.warn('Failed to log activity:', error);
        }
        
        setShowResumeModal(false);
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
    }
  };

  const skillsByCategory = {
    primary: skills.filter((skill: any) => skill.category === 'primary'),
    secondary: skills.filter((skill: any) => skill.category === 'secondary'),
    knowledge: skills.filter((skill: any) => skill.category === 'knowledge'),
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-gray-600">Loading resume...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Resume Preview</h3>
                <Button
                  onClick={() => setShowResumeModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded"
                  size="sm"
                >
                  Edit Resume
                </Button>
              </div>
              
              {/* Resume Display - Matched Height */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 h-[500px] overflow-y-auto">
                {profile?.resumeFile ? (
                  <div className="w-full h-full">
                    <img
                      src={profile.resumeFile}
                      alt="Resume"
                      className="w-full h-full rounded shadow-md object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-file-image text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-500 mb-4">No resume image uploaded yet</p>
                      <Button
                        onClick={() => setShowResumeModal(true)}
                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                      >
                        Upload Resume Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-6">
            {/* Primary Skills */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-white bg-green-600 px-4 py-3">Primary Skills</h3>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {skillsByCategory.primary.map((skill: any) => (
                    <span key={skill.id} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Skills */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-white bg-blue-600 px-4 py-3">Secondary Skills</h3>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {skillsByCategory.secondary.map((skill: any) => (
                    <span key={skill.id} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Knowledge Only */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-white bg-yellow-600 px-4 py-3">Knowledge Only</h3>
              <div className="p-4">
                <div className="space-y-3">
                  {skillsByCategory.knowledge.map((skill: any) => (
                    <span key={skill.id} className="block bg-gray-100 px-3 py-2 rounded-lg text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Modal */}
      <FileUploadModal
        open={showResumeModal}
        onOpenChange={setShowResumeModal}
        onUpload={handleResumeUpload}
        title="Upload Resume Image"
        accept="image/*"
        isUploading={updateProfile.isPending}
      />
    </>
  );
}
