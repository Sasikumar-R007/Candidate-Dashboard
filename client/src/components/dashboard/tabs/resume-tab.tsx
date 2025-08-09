import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUploadModal from '../modals/file-upload-modal';
import { useSkills, useUploadResume } from '@/hooks/use-profile';

export default function ResumeTab() {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { data: skills = [] } = useSkills();
  const uploadResume = useUploadResume();

  const handleResumeUpload = async (file: File) => {
    try {
      await uploadResume.mutateAsync(file);
      setShowResumeModal(false);
    } catch (error) {
      console.error('Resume upload failed:', error);
    }
  };

  const skillsByCategory = {
    primary: skills.filter((skill: any) => skill.category === 'primary'),
    secondary: skills.filter((skill: any) => skill.category === 'secondary'),
    knowledge: skills.filter((skill: any) => skill.category === 'knowledge'),
  };

  return (
    <>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Resume Preview</h3>
                <Button
                  onClick={() => setShowResumeModal(true)}
                  className="bg-primary-blue text-white hover:bg-blue-800"
                  size="sm"
                >
                  Edit Resume
                </Button>
              </div>
              
              {/* Resume Visual Preview */}
              <div className="bg-purple-100 rounded-lg p-6 min-h-96">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                    alt="Resume profile" 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg">Wade Calhoun</h4>
                    <p className="text-gray-600">Digital Content Creator</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-semibold mb-2 text-white bg-gray-700 px-2 py-1 rounded">CONTACT</h5>
                    <p>+1 555-0123</p>
                    <p>wade.calhoun@email.com</p>
                    <p>Richmond, VA</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2 text-white bg-gray-700 px-2 py-1 rounded">EDUCATION</h5>
                    <p><strong>2018 - 2022</strong></p>
                    <p>Bachelor of Arts in Film and Media</p>
                    <p>Virginia Commonwealth University</p>
                    <p>University of Richmond<br />GPA: 3.75</p>
                  </div>
                </div>
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
        title="Upload Resume"
        accept=".pdf,.doc,.docx"
        isUploading={uploadResume.isPending}
      />
    </>
  );
}
