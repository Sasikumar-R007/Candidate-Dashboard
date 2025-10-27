import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, MessageCircle, Edit, Upload, FileText, Link as LinkIcon, Camera, X, File } from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadProfile, useUploadResume } from '@/hooks/use-profile';
import { useJobPreferences, useUpdateJobPreferences } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@shared/schema';
import EditBasicInfoModal from '@/components/dashboard/modals/edit-basic-info-modal';
import EditEducationModal from '@/components/dashboard/modals/edit-education-modal';
import EditJobDetailsModal from '@/components/dashboard/modals/edit-job-details-modal';
import EditStrengthsModal from '@/components/dashboard/modals/edit-strengths-modal';

interface EditViewProfileProps {
  profile: Profile;
}

export default function EditViewProfile({ profile }: EditViewProfileProps) {
  const [activeSection, setActiveSection] = useState('about-you');
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showOnlinePresenceModal, setShowOnlinePresenceModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [showStrengthsModal, setShowStrengthsModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showJobPreferencesModal, setShowJobPreferencesModal] = useState(false);
  const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);
  const [showResumeTextModal, setShowResumeTextModal] = useState(false);

  const menuItems = [
    { id: 'about-you', label: 'About you' },
    { id: 'online-presence', label: 'Online Presence' },
    { id: 'your-journey', label: 'Your Journey' },
    { id: 'your-strengths', label: 'Your Strengths' },
    { id: 'resume', label: 'Resume' },
    { id: 'job-preferences', label: 'Job Preferences' },
  ];

  const renderAboutYou = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">About you</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f] rounded-md"
          data-testid="button-edit-about-you"
          onClick={() => setShowBasicInfoModal(true)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">First Name :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-first-name">
            {profile.firstName || 'Mathew'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Last Name :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-last-name">
            {profile.lastName || 'Anderson'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Mobile Number :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-mobile">
            {profile.phone || '90347 59099'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">WhatsApp No :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-whatsapp">
            {profile.whatsapp || '90347 59099'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Primary Email :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-primary-email">
            {profile.email || 'anderson123@gmail.com'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Secondary Email :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-secondary-email">
            {profile.secondaryEmail || 'matthew.and@gmail.com'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Current Location :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-current-location">
            {profile.currentLocation || 'Chennai.'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Preferred Location :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-preferred-location">
            {profile.preferredLocation || 'Bengaluru'}
          </p>
        </div>
        <div className="col-span-2 flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Date of Birth :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-dob">
            {profile.dateOfBirth || '8-May-2000'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderOnlinePresence = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Online Presence</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f] rounded-md"
          data-testid="button-edit-online-presence"
          onClick={() => setShowOnlinePresenceModal(true)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
      <div className="space-y-6">
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Portfolio :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-portfolio">
            {profile.portfolio || profile.portfolioUrl || 'https://www.yourwork.com'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">LinkedIn :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-linkedin">
            {profile.linkedinUrl || 'https://www.linkedin.com/in/Mathew Anderson'}
          </p>
        </div>
        <div className="flex items-center pb-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">Website :</label>
          <p className="text-base text-gray-900 dark:text-white flex-1 border-b-2 border-dotted border-blue-300 dark:border-blue-700 pb-2" data-testid="text-website">
            {profile.websiteUrl || 'https://www.mynetwork.com'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderYourJourney = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Journey</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-journey"
          onClick={() => setShowJourneyModal(true)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Current Company</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-current-company">
            {profile.currentCompany || 'abc company'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Company Sector</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-company-sector">
            Technology
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Current Role</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-current-role">
            {profile.currentRole || 'Cloud Engineer'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Product / Service</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-product-service">
            {profile.productService || 'Product'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Company Level</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-company-level">
            {profile.companyLevel || 'B2B'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Product Category</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-product-category">
            Software
          </p>
        </div>
        <div className="col-span-2 flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Product Domain</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-product-domain">
            {profile.currentDomain || 'www.yourcompanyname.com'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderYourStrengths = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Strengths</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-strengths"
          onClick={() => setShowStrengthsModal(true)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">University or Collage</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-university">
            {profile.collegeName || 'abc Collage, XYZ University'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Pedigree Level</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-pedigree">
            {profile.pedigreeLevel || 'Tier 2'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Education Domain</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-education-domain">
            {profile.highestQualification || 'Bsc'}
          </p>
        </div>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-48">Preferred Role</label>
          <p className="text-base text-gray-900 dark:text-white flex-1" data-testid="text-preferred-role">
            Digital Marketing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3" data-testid="text-primary-skills-header">
            Primary Skills
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-primary-skill-1">Business Development</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-primary-skill-2">Marketing Analysis</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-primary-skill-3">Lead Generation</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-primary-skill-4">International Sales</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-primary-skill-5">Digital Marketing</p>
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700 p-4">
          <h3 className="text-lg font-semibold text-cyan-800 dark:text-cyan-400 mb-3" data-testid="text-secondary-skills-header">
            Secondary Skills
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-secondary-skill-1">Corporate Sales</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-secondary-skill-2">Resource Manager</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-secondary-skill-3">Customer Interaction</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-secondary-skill-4">Customer Service</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-secondary-skill-5">Direct sales</p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 p-4">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-3" data-testid="text-knowledge-only-header">
            Knowledge Only
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-knowledge-skill-1">Telecalling</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-knowledge-skill-2">English communication</p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-knowledge-skill-3">Sales requirement</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResume = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Resume</h2>
      
      {profile.resumeFile && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <File className="w-10 h-10 text-cyan-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Current Resume</p>
              <p className="text-xs text-gray-500">Click to view</p>
            </div>
            <a 
              href={profile.resumeFile} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-cyan-600 hover:underline"
            >
              View
            </a>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowResumeUploadModal(true)}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors cursor-pointer"
          data-testid="container-resume-upload"
        >
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Drag & Drop A file here or Click to Browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Supported PDF, Images</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Max File Size 5MB</p>
        </button>
        
        <button
          onClick={() => setShowResumeTextModal(true)}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors cursor-pointer"
          data-testid="container-resume-paste"
        >
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Copy & Paste Or Write Your Own Resume
          </p>
        </button>
      </div>
    </div>
  );

  const renderJobPreferences = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 p-8 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">View Job Preferences</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-job-preferences"
          onClick={() => setShowJobPreferencesModal(true)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job title</label>
          <p className="text-sm text-gray-900 dark:text-white mt-1" data-testid="text-job-title">
            Frontend Developer, Senior Frontend developer, User Interface Engineer and UI Developer
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work mode</label>
            <div className="flex gap-4 mt-1">
              <span className="text-sm text-gray-900 dark:text-white" data-testid="text-work-mode-onsite">On-site</span>
              <span className="text-sm text-gray-900 dark:text-white" data-testid="text-work-mode-hybrid">• Hybrid</span>
              <span className="text-sm text-gray-900 dark:text-white" data-testid="text-work-mode-remote">• Remote</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Employment Type</label>
            <p className="text-sm text-gray-900 dark:text-white mt-1" data-testid="text-employment-type">
              Full-time
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location (On-site)</label>
          <p className="text-sm text-gray-900 dark:text-white mt-1" data-testid="text-job-location">
            Dehli,India - Gurugram,Haryana,India - Noida ,Uttar Prakash,India
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
          <p className="text-sm text-gray-900 dark:text-white mt-1" data-testid="text-start-date">
            Immediately, I am actively applying
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instruction to recruiter</label>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-instruction-1">
              Don't call me post 6 PM and Weekends
            </p>
            <p className="text-sm text-gray-900 dark:text-white" data-testid="text-instruction-2">
              If i don't pick the call message me in WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'about-you':
        return renderAboutYou();
      case 'online-presence':
        return renderOnlinePresence();
      case 'your-journey':
        return renderYourJourney();
      case 'your-strengths':
        return renderYourStrengths();
      case 'resume':
        return renderResume();
      case 'job-preferences':
        return renderJobPreferences();
      default:
        return renderAboutYou();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-start gap-8">
            <div className="relative group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 rounded-full"></div>
                <Avatar className="relative w-36 h-36 border-4 border-white dark:border-gray-800 cursor-pointer m-1" onClick={() => setShowProfilePictureModal(true)}>
                  <AvatarImage src={profile.profilePicture || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-3xl">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button
                onClick={() => setShowProfilePictureModal(true)}
                className="absolute bottom-2 right-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-2 shadow-lg transition-colors"
                data-testid="button-change-profile-picture"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-profile-name">
                  {profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'S. Brunce Mars'}
                </h1>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Profile Completion</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">75%</span>
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6" data-testid="text-profile-title">
                {profile.currentRole || profile.title || 'Cloud Engineer'}
              </p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-header-location">
                    {profile.currentLocation || profile.location || 'Chennai.'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-header-phone">
                    {profile.phone || '90347 59099'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-header-institute">
                    {profile.collegeName || 'National Institute of Technology'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-header-email">
                    {profile.email || 'mathew.and@gmail.com'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {profile.gender ? (
                    <>
                      <div className="w-5 h-5 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{profile.gender}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex-shrink-0"></div>
                      <button 
                        onClick={() => setShowGenderModal(true)}
                        className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline" 
                        data-testid="button-add-gender"
                      >
                        Add Gender
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-header-whatsapp">
                    {profile.whatsapp || profile.phone || '90347 59099'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">Edit & View</h2>
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 transition-all relative ${
                      activeSection === item.id
                        ? 'text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-l-4 border-transparent'
                    }`}
                    data-testid={`button-section-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {showBasicInfoModal && (
        <EditBasicInfoModal 
          open={showBasicInfoModal} 
          onOpenChange={setShowBasicInfoModal} 
          profile={profile} 
        />
      )}
      
      {showJourneyModal && (
        <EditJobDetailsModal 
          open={showJourneyModal} 
          onOpenChange={setShowJourneyModal} 
          profile={profile} 
        />
      )}
      
      {showStrengthsModal && (
        <EditStrengthsModal 
          open={showStrengthsModal} 
          onOpenChange={setShowStrengthsModal} 
          profile={profile} 
        />
      )}
      
      {showOnlinePresenceModal && (
        <EditOnlinePresenceModal 
          open={showOnlinePresenceModal} 
          onOpenChange={setShowOnlinePresenceModal} 
          profile={profile} 
        />
      )}

      {showProfilePictureModal && (
        <ProfilePictureModal
          open={showProfilePictureModal}
          onOpenChange={setShowProfilePictureModal}
          profile={profile}
        />
      )}

      {showGenderModal && (
        <GenderModal
          open={showGenderModal}
          onOpenChange={setShowGenderModal}
          profile={profile}
        />
      )}

      {showJobPreferencesModal && (
        <JobPreferencesModal
          open={showJobPreferencesModal}
          onOpenChange={setShowJobPreferencesModal}
        />
      )}

      {showResumeUploadModal && (
        <ResumeUploadModal
          open={showResumeUploadModal}
          onOpenChange={setShowResumeUploadModal}
          profile={profile}
        />
      )}

      {showResumeTextModal && (
        <ResumeTextModal
          open={showResumeTextModal}
          onOpenChange={setShowResumeTextModal}
          profile={profile}
        />
      )}
    </div>
  );
}

// Profile Picture Modal Component
function ProfilePictureModal({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadProfile = useUploadProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadProfile.mutateAsync(file);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    try {
      await updateProfile.mutateAsync({ profilePicture: '' });
      toast({
        title: "Profile Picture Removed",
        description: "Your profile picture has been removed.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {profile.profilePicture && (
            <div className="flex justify-center">
              <Avatar className="w-32 h-32 border-4 border-cyan-400">
                <AvatarImage src={profile.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-2xl">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProfile.isPending}
              className="bg-cyan-500 text-white hover:bg-cyan-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              {profile.profilePicture ? 'Change Picture' : 'Upload Picture'}
            </Button>

            {profile.profilePicture && (
              <Button
                onClick={handleRemove}
                disabled={updateProfile.isPending}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Picture
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Gender Modal Component  
function GenderModal({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const [gender, setGender] = useState(profile.gender || '');
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ gender });
      toast({
        title: "Gender Updated",
        description: "Your gender has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update gender. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Gender</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !gender} className="bg-cyan-500 text-white hover:bg-cyan-600">
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Resume Upload Modal Component
function ResumeUploadModal({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResume = useUploadResume();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF or image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadResume.mutateAsync(file);
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 flex flex-col items-center justify-center hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors cursor-pointer"
          >
            <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
              Drag & Drop your resume here or Click to Browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Supported: PDF, JPG, PNG</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Max File Size: 5MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Resume Text Modal Component
function ResumeTextModal({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const [resumeText, setResumeText] = useState(profile.resumeText || '');
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ resumeText });
      toast({
        title: "Resume Saved",
        description: "Your resume text has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateResume = () => {
    const generatedText = `${profile.firstName} ${profile.lastName}
${profile.email} | ${profile.phone}
${profile.location || ''}

PROFESSIONAL SUMMARY
${profile.currentRole || 'Professional'} with experience in ${profile.currentCompany || 'various industries'}.

EDUCATION
${profile.education || profile.highestQualification || 'N/A'}
${profile.collegeName || ''}

SKILLS
${profile.skills || 'N/A'}

WORK EXPERIENCE
${profile.currentRole || 'Current Position'} at ${profile.currentCompany || 'Company'}`;

    setResumeText(generatedText);
    toast({
      title: "Resume Generated",
      description: "Resume generated from your profile details. You can edit it now.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Write or Paste Resume</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="resumeText">Resume Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateResume}
                className="text-cyan-600"
              >
                Generate from Profile
              </Button>
            </div>
            <Textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste or write your resume here..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !resumeText} className="bg-cyan-500 text-white hover:bg-cyan-600">
              {isPending ? 'Saving...' : 'Save Resume'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Job Preferences Modal Component
function JobPreferencesModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: jobPreferences } = useJobPreferences();
  const { mutateAsync: updateJobPreferences, isPending } = useUpdateJobPreferences();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jobTitles: jobPreferences?.jobTitles || '',
    workMode: jobPreferences?.workMode || '',
    employmentType: jobPreferences?.employmentType || '',
    locations: jobPreferences?.locations || '',
    startDate: jobPreferences?.startDate || '',
    instructions: jobPreferences?.instructions || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateJobPreferences(formData);
      toast({
        title: "Job Preferences Updated",
        description: "Your job preferences have been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update job preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Preferences</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jobTitles">Job Titles</Label>
            <Input
              id="jobTitles"
              value={formData.jobTitles}
              onChange={(e) => setFormData({ ...formData, jobTitles: e.target.value })}
              placeholder="e.g. Software Engineer, Full Stack Developer"
            />
          </div>

          <div>
            <Label htmlFor="workMode">Work Mode</Label>
            <Input
              id="workMode"
              value={formData.workMode}
              onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              placeholder="e.g. Remote, Hybrid, On-site"
            />
          </div>

          <div>
            <Label htmlFor="employmentType">Employment Type</Label>
            <Input
              id="employmentType"
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              placeholder="e.g. Full-time, Part-time, Contract"
            />
          </div>

          <div>
            <Label htmlFor="locations">Preferred Locations</Label>
            <Input
              id="locations"
              value={formData.locations}
              onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
              placeholder="e.g. Bangalore, Mumbai, Remote"
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              placeholder="e.g. Immediate, 1 month notice"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions to Recruiter</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any special instructions for recruiters..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-cyan-500 text-white hover:bg-cyan-600">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Online Presence Modal Component
function EditOnlinePresenceModal({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const [formData, setFormData] = useState({
    portfolioUrl: profile.portfolioUrl || profile.portfolio || '',
    linkedinUrl: profile.linkedinUrl || '',
    websiteUrl: profile.websiteUrl || '',
  });

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast({
        title: "Online Presence Updated",
        description: "Your online presence has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update online presence:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update online presence. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Online Presence</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.com"
            />
          </div>
          
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
