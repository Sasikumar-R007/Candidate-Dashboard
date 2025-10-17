import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail, MessageCircle, Edit, Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface EditViewProfileProps {
  profile: Profile;
}

export default function EditViewProfile({ profile }: EditViewProfileProps) {
  const [activeSection, setActiveSection] = useState('about-you');

  const menuItems = [
    { id: 'about-you', label: 'About you' },
    { id: 'online-presence', label: 'Online Presence' },
    { id: 'your-journey', label: 'Your Journey' },
    { id: 'your-strengths', label: 'Your Strengths' },
    { id: 'resume', label: 'Resume' },
    { id: 'job-preferences', label: 'Job Preferences' },
  ];

  const renderAboutYou = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">About you</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-about-you"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">First Name</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-first-name">
            {profile.firstName || 'Mathew'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Last Name</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-last-name">
            {profile.lastName || 'Anderson'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Mobile Number</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-mobile">
            {profile.phone || '90347 59099'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">WhatsApp No</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-whatsapp">
            {profile.whatsapp || '90347 59099'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Primary Email</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-primary-email">
            {profile.email || 'anderson123@gmail.com'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Secondary Email</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-secondary-email">
            {profile.secondaryEmail || 'matthew.and@gmail.com'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Current Location</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-current-location">
            {profile.currentLocation || 'Chennai.'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Preferred Location</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-preferred-location">
            {profile.preferredLocation || 'Bengaluru'}
          </p>
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-dob">
            {profile.dateOfBirth || '8-May-2000'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderOnlinePresence = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Online Presence</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-online-presence"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Portfolio</label>
          <p className="text-base text-blue-600 dark:text-blue-400 mt-1" data-testid="text-portfolio">
            {profile.portfolio || 'https://www.yourwork.com'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">LinkedIn</label>
          <p className="text-base text-blue-600 dark:text-blue-400 mt-1" data-testid="text-linkedin">
            {profile.linkedinUrl || 'https://www.linkedin.com/in/Mathew Anderson'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Website</label>
          <p className="text-base text-blue-600 dark:text-blue-400 mt-1" data-testid="text-website">
            {profile.websiteUrl || 'https://www.mynetwork.com'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderYourJourney = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Journey</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-journey"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Current Company</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-current-company">
            {profile.currentCompany || 'abc company'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Company Sector</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-company-sector">
            Technology
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Current Role</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-current-role">
            {profile.currentRole || 'Cloud Engineer'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Product / Service</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-product-service">
            {profile.productService || 'Product'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Company Level</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-company-level">
            {profile.companyLevel || 'B2B'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Product Category</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-product-category">
            Software
          </p>
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Product Domain</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-product-domain">
            {profile.currentDomain || 'www.yourcompanyname.com'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderYourStrengths = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Strengths</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-edit-strengths"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">University or Collage</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-university">
            {profile.collegeName || 'abc Collage, XYZ University'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Pedigree Level</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-pedigree">
            {profile.pedigreeLevel || 'Tier 2'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Education Domain</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-education-domain">
            {profile.highestQualification || 'Bsc'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">Preferred Role</label>
          <p className="text-base text-gray-900 dark:text-white mt-1" data-testid="text-preferred-role">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Resume</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center" data-testid="container-resume-upload">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Drag & Drop A file here or Click to Browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Supported PDF,Docx</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Max File Size 5MB</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center" data-testid="container-resume-paste">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Copy & Paste Or Write Your Own Resume
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-save-resume"
        >
          Save
        </Button>
      </div>
    </div>
  );

  const renderJobPreferences = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">View Job Preferences</h2>
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
      <div className="flex justify-end mt-4">
        <Button 
          className="bg-[#1e3a5f] text-white hover:bg-[#2d4a6f]"
          data-testid="button-save-job-preferences"
        >
          Save
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'about-you':
        return (
          <>
            {renderAboutYou()}
            {renderOnlinePresence()}
          </>
        );
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-cyan-400">
              <AvatarImage src={profile.profilePicture || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-2xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-profile-name">
                {profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'S. Brunce Mars'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4" data-testid="text-profile-title">
                {profile.currentRole || 'Cloud Engineer'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm" data-testid="text-header-location">
                    {profile.currentLocation || 'Chennai.'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm" data-testid="text-header-phone">
                    {profile.phone || '90347 59099'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <LinkIcon className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm" data-testid="text-header-institute">
                    {profile.collegeName || 'National Institute of Technology'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm" data-testid="text-header-email">
                    {profile.email || 'mathew.and@gmail.com'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline" data-testid="button-add-gender">
                    Add Gender
                  </button>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm" data-testid="text-header-whatsapp">
                    {profile.whatsapp || '90347 59099'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit & View</h2>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
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
    </div>
  );
}
