import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditProfileModal from '../modals/edit-profile-modal';
import EditOnlinePresenceModal from '../modals/edit-online-presence-modal';
import EditBasicInfoModal from '../modals/edit-basic-info-modal';
import EditContactModal from '../modals/edit-contact-modal';
import type { Profile } from '@shared/schema';

interface MyProfileTabProps {
  profile: Profile;
}

export default function MyProfileTab({ profile }: MyProfileTabProps) {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* About You Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">About you</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBasicInfoModal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  size="sm"
                >
                  <i className="fas fa-user mr-2"></i>Basic Info
                </Button>
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="bg-green-600 text-white hover:bg-green-700"
                  size="sm"
                >
                  <i className="fas fa-phone mr-2"></i>Contact
                </Button>
              </div>
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
                className="bg-primary-blue text-white hover:bg-blue-800"
                size="sm"
              >
                <i className="fas fa-edit mr-2"></i>Edit
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                <p className="text-secondary-blue hover:underline cursor-pointer">{profile.portfolioUrl}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <p className="text-secondary-blue hover:underline cursor-pointer">{profile.websiteUrl}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <p className="text-secondary-blue hover:underline cursor-pointer">{profile.linkedinUrl}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-green-600 text-white hover:bg-green-700">
            Next <i className="fas fa-arrow-right ml-2"></i>
          </Button>
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
    </>
  );
}
