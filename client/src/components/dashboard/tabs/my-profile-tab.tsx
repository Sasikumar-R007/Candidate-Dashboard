import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditProfileModal from '../modals/edit-profile-modal';
import EditOnlinePresenceModal from '../modals/edit-online-presence-modal';
import EditBasicInfoModal from '../modals/edit-basic-info-modal';
import EditContactModal from '../modals/edit-contact-modal';
import EditEducationModal from '../modals/edit-education-modal';
import EditJobDetailsModal from '../modals/edit-job-details-modal';
import type { Profile } from '@shared/schema';

interface MyProfileTabProps {
  profile: Profile;
}

export default function MyProfileTab({ profile }: MyProfileTabProps) {
  const [currentSection, setCurrentSection] = useState<'basic' | 'advanced'>('basic');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);

  return (
    <>
      <div className="px-6 py-6">
        {currentSection === 'basic' ? (
          // Basic Information Sections
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* About You Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">About you</h3>
                <Button
                  onClick={() => setShowBasicInfoModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded"
                  size="sm"
                  data-testid="button-edit-profile"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.mobile}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp No</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.whatsapp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Email</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.primaryEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Email</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.secondaryEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Location</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.currentLocation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Location</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.preferredLocation}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.dateOfBirth}</p>
                </div>
              </div>
            </div>

            {/* Online Presence Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Online Presence</h3>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio 1</label>
                  <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{profile.portfolioUrl}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio 2 (Optional)</label>
                  <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{profile.websiteUrl}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                  <p className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{profile.linkedinUrl}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Advanced Information Sections (Education & Job Details)
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Education Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Education</h3>
                <Button
                  onClick={() => setShowEducationModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded"
                  size="sm"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highest Qualification</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.highestQualification || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College Name</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.collegeName || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.skills || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Job Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pedigree Level</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.pedigreeLevel || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notice Period</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.noticePeriod || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.currentCompany || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Role</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.currentRole || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Domain</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.currentDomain || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Level</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.companyLevel || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Service</label>
                  <p className="text-gray-900 dark:text-gray-100">{profile.productService || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {currentSection === 'advanced' && (
            <Button 
              onClick={() => setCurrentSection('basic')}
              className="bg-gray-600 text-white hover:bg-gray-700 rounded"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back
            </Button>
          )}
          <div className="ml-auto">
            {currentSection === 'basic' && (
              <Button 
                onClick={() => setCurrentSection('advanced')}
                className="bg-green-600 text-white hover:bg-green-700 rounded"
              >
                Next <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        open={showAboutModal}
        onOpenChange={setShowAboutModal}
        profile={profile}
      />

      <EditOnlinePresenceModal
        open={showOnlineModal}
        onOpenChange={setShowOnlineModal}
        profile={profile}
      />

      <EditBasicInfoModal
        open={showBasicInfoModal}
        onOpenChange={setShowBasicInfoModal}
        profile={profile}
      />

      <EditContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        profile={profile}
      />

      <EditEducationModal
        open={showEducationModal}
        onOpenChange={setShowEducationModal}
        profile={profile}
      />

      <EditJobDetailsModal
        open={showJobDetailsModal}
        onOpenChange={setShowJobDetailsModal}
        profile={profile}
      />
    </>
  );
}
