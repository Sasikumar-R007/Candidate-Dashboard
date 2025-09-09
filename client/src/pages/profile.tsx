import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EditBasicInfoModal from '@/components/dashboard/modals/edit-basic-info-modal';
import EditOnlinePresenceModal from '@/components/dashboard/modals/edit-online-presence-modal';
import EditJobDetailsModal from '@/components/dashboard/modals/edit-job-details-modal';
import EditEducationModal from '@/components/dashboard/modals/edit-education-modal';
import EditJobPreferencesModal from '@/components/dashboard/modals/edit-job-preferences-modal';
import FileUploadModal from '@/components/dashboard/modals/file-upload-modal';
import { useProfile, useSkills, useJobPreferences, useUpdateProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface ProfilePageProps {
  profile: Profile;
}

export default function ProfilePage({ profile }: ProfilePageProps) {
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showJobPreferencesModal, setShowJobPreferencesModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: preferences, isLoading: preferencesLoading } = useJobPreferences();
  const updateProfile = useUpdateProfile();

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

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile?.profilePicture || '/api/placeholder/128/128'} alt={`${profile?.firstName} ${profile?.lastName}`} />
              <AvatarFallback className="text-2xl">{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h1>
              <p className="text-xl text-gray-600 mt-2">{profile?.currentRole || 'Cloud Engineer'}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-map-marker-alt text-blue-500"></i>
                  <span>{profile?.currentLocation || 'Chennai'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-phone text-blue-500"></i>
                  <span>{profile?.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-building text-blue-500"></i>
                  <span>{profile?.currentCompany || 'National Institute of Technology'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-envelope text-blue-500"></i>
                  <span>{profile?.primaryEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-whatsapp text-green-500"></i>
                  <span>{profile?.whatsapp}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-gender text-blue-500"></i>
                  <span>Add Gender</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About You Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">About you</h3>
            <Button
              onClick={() => setShowBasicInfoModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
              size="sm"
              data-testid="button-edit-about"
            >
              <i className="fas fa-edit mr-2"></i>Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <p className="text-gray-900">{profile.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <p className="text-gray-900">{profile.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <p className="text-gray-900">{profile.mobile}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp No</label>
              <p className="text-gray-900">{profile.whatsapp}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
              <p className="text-gray-900">{profile.primaryEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Email</label>
              <p className="text-gray-900">{profile.secondaryEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
              <p className="text-gray-900">{profile.currentLocation}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
              <p className="text-gray-900">{profile.preferredLocation}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <p className="text-gray-900">{profile.dateOfBirth}</p>
            </div>
          </div>
        </div>

        {/* Online Presence Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Online Presence</h3>
            <Button
              onClick={() => setShowOnlineModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
              size="sm"
            >
              <i className="fas fa-edit mr-2"></i>Edit
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
              <p className="text-blue-600 hover:underline cursor-pointer">{profile.portfolioUrl || 'https://www.yourwork.com'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <p className="text-blue-600 hover:underline cursor-pointer">{profile.linkedinUrl || 'https://www.linkedin.com/in/Mathew Anderson'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <p className="text-blue-600 hover:underline cursor-pointer">{profile.websiteUrl || 'https://www.mynetwork.com'}</p>
            </div>
          </div>
        </div>

        {/* Your Journey Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Journey</h3>
            <Button
              onClick={() => setShowJobDetailsModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
              size="sm"
            >
              <i className="fas fa-edit mr-2"></i>Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
              <p className="text-gray-900">{profile.currentCompany || 'abc company'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Sector</label>
              <p className="text-gray-900">Technology</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
              <p className="text-gray-900">{profile.currentRole || 'Cloud Engineer'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service</label>
              <p className="text-gray-900">{profile.productService || 'Product'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Level</label>
              <p className="text-gray-900">{profile.companyLevel || 'B2B'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <p className="text-gray-900">Software</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Domain</label>
              <p className="text-gray-900">{profile.currentDomain || 'www.yourcompanyname.com'}</p>
            </div>
          </div>
        </div>

        {/* Your Strengths Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Strengths</h3>
            <Button
              onClick={() => setShowEducationModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
              size="sm"
            >
              <i className="fas fa-edit mr-2"></i>Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University or College</label>
              <p className="text-gray-900">{profile.collegeName || 'abc College, XYZ University'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pedigree Level</label>
              <p className="text-gray-900">Tier 2</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Domain</label>
              <p className="text-gray-900">BSc</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Role</label>
              <p className="text-gray-900">Digital Marketing</p>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Skills */}
            <div className="bg-green-100 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-green-800 mb-4">Primary Skills</h4>
              <div className="space-y-2">
                {skillsByCategory.primary.map((skill: any) => (
                  <div key={skill.id} className="text-sm text-green-700">
                    {skill.name}
                  </div>
                ))}
                {skillsByCategory.primary.length === 0 && (
                  <>
                    <div className="text-sm text-green-700">Business Development</div>
                    <div className="text-sm text-green-700">Marketing Analysis</div>
                    <div className="text-sm text-green-700">Lead Generation</div>
                    <div className="text-sm text-green-700">International Sales</div>
                    <div className="text-sm text-green-700">Digital Marketing</div>
                  </>
                )}
              </div>
            </div>

            {/* Secondary Skills */}
            <div className="bg-blue-100 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-4">Secondary Skills</h4>
              <div className="space-y-2">
                {skillsByCategory.secondary.map((skill: any) => (
                  <div key={skill.id} className="text-sm text-blue-700">
                    {skill.name}
                  </div>
                ))}
                {skillsByCategory.secondary.length === 0 && (
                  <>
                    <div className="text-sm text-blue-700">Corporate Sales</div>
                    <div className="text-sm text-blue-700">Resource Manager</div>
                    <div className="text-sm text-blue-700">Customer Interaction</div>
                    <div className="text-sm text-blue-700">Customer Service</div>
                    <div className="text-sm text-blue-700">Direct sales</div>
                  </>
                )}
              </div>
            </div>

            {/* Knowledge Only */}
            <div className="bg-orange-100 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-orange-800 mb-4">Knowledge Only</h4>
              <div className="space-y-2">
                {skillsByCategory.knowledge.map((skill: any) => (
                  <div key={skill.id} className="text-sm text-orange-700">
                    {skill.name}
                  </div>
                ))}
                {skillsByCategory.knowledge.length === 0 && (
                  <>
                    <div className="text-sm text-orange-700">Telecalling</div>
                    <div className="text-sm text-orange-700">English communication</div>
                    <div className="text-sm text-orange-700">Sales requirement</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Resume Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload Resume</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drag & Drop Upload */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => setShowResumeModal(true)}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-600 font-medium mb-2">Drag & Drop A file here or Click to Browse</p>
              <p className="text-sm text-gray-500">Supported PDF Docx</p>
              <p className="text-sm text-gray-500">Max File Size 5MB</p>
            </div>

            {/* Copy & Paste */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-edit text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-600 font-medium mb-2">Copy & Paste Or Write Your Own JD</p>
            </div>
          </div>

          {profile?.resumeFile && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="fas fa-file-pdf text-green-600"></i>
                <span className="text-green-800 font-medium">Resume uploaded successfully</span>
                <Button
                  onClick={() => setShowResumeModal(true)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  Replace
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Save
            </Button>
          </div>
        </div>

        {/* Job Preferences Section */}
        {!preferencesLoading && preferences && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">View Job Preferences</h3>
              <Button
                onClick={() => setShowJobPreferencesModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded"
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

              <div className="flex justify-end">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Modals */}
      <EditBasicInfoModal
        open={showBasicInfoModal}
        onOpenChange={setShowBasicInfoModal}
        profile={profile}
      />

      <EditOnlinePresenceModal
        open={showOnlineModal}
        onOpenChange={setShowOnlineModal}
        profile={profile}
      />

      <EditJobDetailsModal
        open={showJobDetailsModal}
        onOpenChange={setShowJobDetailsModal}
        profile={profile}
      />

      <EditEducationModal
        open={showEducationModal}
        onOpenChange={setShowEducationModal}
        profile={profile}
      />

      <EditJobPreferencesModal
        open={showJobPreferencesModal}
        onOpenChange={setShowJobPreferencesModal}
      />

      <FileUploadModal
        open={showResumeModal}
        onOpenChange={setShowResumeModal}
        onUpload={handleResumeUpload}
        title="Upload Resume Image"
        accept="image/*"
        isUploading={updateProfile.isPending}
      />
    </div>
  );
}