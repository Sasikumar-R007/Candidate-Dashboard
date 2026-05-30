import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type ResumeMergeFieldChange } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Phone, Mail, MessageCircle, Edit, Upload, FileText, 
  Link as LinkIcon, Camera, X, File, GraduationCap, Briefcase, 
  Calendar, UserCircle, Star, Sparkles, ShieldCheck, Layout,
  Loader2, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadProfile } from '@/hooks/use-profile';
import { useJobPreferences, useUpdateJobPreferences } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@shared/schema';
import EditBasicInfoModal from '@/components/dashboard/modals/edit-basic-info-modal';
import EditEducationModal from '@/components/dashboard/modals/edit-education-modal';
import EditJobDetailsModal from '@/components/dashboard/modals/edit-job-details-modal';
import EditStrengthsModal from '@/components/dashboard/modals/edit-strengths-modal';
import ProfileCompletionWidget from '@/components/dashboard/profile-completion-widget';
import { calculateProfileCompletion } from '@/lib/profile-utils';
import { resolveUploadAssetUrl } from '@/lib/resolve-upload-url';

interface EditViewProfileProps {
  profile: Profile;
  onNavigateToJobBoard?: () => void;
}

const PROFILE_EDIT_BTN_CLASS =
  "bg-gray-900 text-white hover:bg-gray-800 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:hover:text-white rounded-xl px-5 py-5 border-none shadow-lg transition-all transform hover:scale-105";

export default function EditViewProfile({ profile, onNavigateToJobBoard }: EditViewProfileProps) {
  const [showProTip, setShowProTip] = useState(true);
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
  const { data: jobPreferences } = useJobPreferences();

  const menuItems = [
    { id: 'about-you', label: 'About you' },
    { id: 'online-presence', label: 'Online Presence' },
    { id: 'your-journey', label: 'Your Journey' },
    { id: 'your-strengths', label: 'Your Strengths' },
    { id: 'resume', label: 'Resume' },
    { id: 'job-preferences', label: 'Job Preferences' },
  ];

  const renderField = (label: string, value: string | null | undefined) => (
    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all">
      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-gray-900 dark:text-white truncate">
          {value || 'Not set'}
        </span>
      </div>
    </div>
  );

  const renderAboutYou = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About You</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your basic information and contact details.</p>
        </div>
        <Button 
          size="sm" 
          className={PROFILE_EDIT_BTN_CLASS}
          data-testid="button-edit-basic"
          onClick={() => setShowBasicInfoModal(true)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Info
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderField('First Name', profile.firstName)}
        {renderField('Last Name', profile.lastName)}
        {renderField('Official Title', profile.title)}
        {renderField('Primary Email', profile.email)}
        {renderField('Secondary Email', profile.secondaryEmail)}
        {renderField('Mobile Number', profile.phone)}
        {renderField('WhatsApp No', profile.whatsapp)}
        {renderField('Current Location', profile.currentLocation)}
        {renderField('Preferred Location', profile.preferredLocation)}
        {renderField('Date of Birth', profile.dateOfBirth)}
        {renderField('Gender', profile.gender || 'Add Gender')}
      </div>
    </div>
  );

  const renderOnlinePresence = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Online Presence</h2>
          <p className="text-gray-500 text-sm mt-1">Links to your professional profiles and work.</p>
        </div>
        <Button 
          size="sm" 
          className={PROFILE_EDIT_BTN_CLASS}
          data-testid="button-edit-online-presence"
          onClick={() => setShowOnlinePresenceModal(true)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Update Links
        </Button>
      </div>

      <div className="space-y-6">
        {[
          { label: 'Portfolio URL', value: profile.portfolio || profile.portfolioUrl || 'Link not set', icon: LinkIcon, color: 'text-indigo-500' },
          { label: 'LinkedIn Profile', value: profile.linkedinUrl || 'Link not set', icon: LinkIcon, color: 'text-blue-600' },
          { label: 'Professional Website', value: profile.websiteUrl || 'Link not set', icon: LinkIcon, color: 'text-emerald-500' },
        ].map((link, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{link.label}</label>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-700/50">
              <link.icon className={`w-5 h-5 ${link.color}`} />
              <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {link.value !== 'Link not set' ? (
                  <a href={link.value} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                    {link.value}
                  </a>
                ) : (
                  <span className="text-gray-400">{link.value}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderYourJourney = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Journey</h2>
          <p className="text-gray-500 text-sm mt-1">Details about your current role and company.</p>
        </div>
        <Button 
          size="sm" 
          className={PROFILE_EDIT_BTN_CLASS}
          data-testid="button-edit-journey"
          onClick={() => setShowJourneyModal(true)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Experience
        </Button>
      </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderField('Current Company', profile.currentCompany)}
      {renderField('Current Role', profile.currentRole)}
      {renderField('Total Experience', profile.totalExperience)}
      {renderField('Product / Service', profile.productService)}
      {renderField('Company Level', profile.companyLevel)}
      {renderField('Product Domain', profile.currentDomain)}
    </div>
    </div>
  );

  const renderYourStrengths = () => {
    const educations = (profile.educationHistory as any[]) || [];
    const hasPG = educations.find(e => e.degreeLevel === 'Postgraduate');
    const higherEd = hasPG || educations[0] || {};
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Strengths</h2>
            <p className="text-gray-500 text-sm mt-1">Your education, skills, and qualifications.</p>
          </div>
          <Button 
            size="sm" 
            className={PROFILE_EDIT_BTN_CLASS}
            data-testid="button-edit-strengths"
            onClick={() => setShowStrengthsModal(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Strengths
          </Button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {renderField('University / College', higherEd.collegeName || profile.collegeName)}
        {renderField('Pedigree Level', higherEd.pedigreeLevel || profile.pedigreeLevel)}
        {renderField('UG / PG', higherEd.degreeLevel || profile.degreeLevel)}
        {renderField('Course', higherEd.course || profile.course)}
        {renderField('Education Domain', higherEd.currentDomain || profile.currentDomain || profile.highestQualification)}
        {renderField('Graduation Year', higherEd.yearOfCompletion || profile.graduationYear)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5">
          <h3 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest mb-4">Primary Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.skills?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) || []).map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-100 rounded-lg text-xs font-bold">{skill}</span>
            ))}
            {(!profile.skills) && <span className="text-gray-400 text-xs italic">No skills added</span>}
          </div>
        </div>

        <div className="bg-cyan-50/50 dark:bg-cyan-900/10 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 p-5">
          <h3 className="text-cyan-800 dark:text-cyan-400 font-bold text-sm uppercase tracking-widest mb-4">Secondary Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.skills?.split(',').map(s => s.trim()).filter(Boolean).slice(3, 8) || []).map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-100 rounded-lg text-xs font-bold">{skill}</span>
            ))}
          </div>
        </div>

        <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 p-5">
          <h3 className="text-orange-800 dark:text-orange-400 font-bold text-sm uppercase tracking-widest mb-4">Knowledge Only</h3>
          <div className="flex flex-wrap gap-2">
            {(profile.skills?.split(',').map(s => s.trim()).filter(Boolean).slice(8) || []).map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-100 rounded-lg text-xs font-bold">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  };

  const renderResume = () => {
    const resumeUrl = resolveUploadAssetUrl(profile.resumeFile, "uploads/resumes");
    const resumeFileName = profile.resumeFile?.split("/").pop() || "Resume";
    const isPdf =
      resumeUrl?.toLowerCase().includes(".pdf") ||
      profile.resumeFile?.toLowerCase().endsWith(".pdf");

    return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume</h2>
          <p className="text-gray-500 text-sm mt-1">Preview your resume and upload or edit it anytime.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — live resume preview */}
        <div className="flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-widest">
              Current Resume
            </h3>
            {resumeUrl && (
              <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  Open
                </a>
              </Button>
            )}
          </div>
          <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 overflow-hidden min-h-[480px]">
            {resumeUrl && isPdf ? (
              <iframe
                src={resumeUrl}
                title="Resume preview"
                className="w-full h-full min-h-[480px] border-0 bg-white"
              />
            ) : resumeUrl ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[480px] p-8 text-center">
                <FileText className="w-12 h-12 text-blue-500 mb-4" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate max-w-full">
                  {resumeFileName}
                </p>
                <p className="text-xs text-gray-500 mb-4">Preview not available for this file type.</p>
                <Button size="sm" className="rounded-xl" asChild>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    Open Resume
                  </a>
                </Button>
              </div>
            ) : profile.resumeText ? (
              <div className="h-full min-h-[480px] overflow-y-auto p-6">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {profile.resumeText}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[480px] p-8 text-center text-gray-400">
                <FileText className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No resume uploaded yet</p>
                <p className="text-xs mt-1">Upload a file or write your resume on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — upload & write */}
        <div className="flex flex-col gap-6">
          {/* Uploaded File */}
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 flex flex-col justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-all flex-1">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              {profile.resumeFile && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Uploaded</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Resume Upload</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upload your resume in PDF or Word format.</p>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:hover:text-white rounded-xl px-4 py-4 border-none transition-all flex-1"
                  onClick={() => setShowResumeUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
                {resumeUrl && (
                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-gray-200 dark:border-gray-700" asChild>
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Written Resume */}
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex-1">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Edit className="w-7 h-7" />
              </div>
              {profile.resumeText && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Completed</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Write Resume</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create or paste your resume text manually.</p>
              <Button 
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-white rounded-xl px-4 py-4 border-none transition-all w-full"
                onClick={() => setShowResumeTextModal(true)}
              >
              {profile.resumeText ? 'Edit Content' : 'Start Writing'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderJobPreferences = () => {
    if (!jobPreferences) return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm text-center">
        <p className="text-gray-500 mb-4">No job preferences set yet.</p>
        <Button 
          variant="outline" 
          onClick={() => setShowJobPreferencesModal(true)}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
        >
          Set Preferences
        </Button>
      </div>
    );
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Preferences</h2>
            <p className="text-gray-500 text-sm mt-1">Specify your ideal role and working conditions.</p>
          </div>
          <Button 
            size="sm" 
            className={PROFILE_EDIT_BTN_CLASS}
            data-testid="button-edit-preferences"
            onClick={() => setShowJobPreferencesModal(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Preferences
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
          {[
            { label: 'Role / Job Titles', value: jobPreferences.jobTitles || 'Not set' },
            { label: 'Preferred Location', value: jobPreferences.locations || 'Not set' },
            { label: 'Job Type', value: jobPreferences.employmentType || 'Not set' },
            { label: 'Work Mode', value: jobPreferences.workMode || 'Not set' },
            { label: 'Ready to Join', value: jobPreferences.startDate || 'Not set' },
          ].map((field, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{field.label}</label>
              <div className="text-base font-semibold text-gray-900 dark:text-white pb-3 border-b border-gray-50 dark:border-gray-700/50">
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Instructions to recruiter</label>
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 text-gray-700 dark:text-gray-300 italic">
            "{jobPreferences.instructions || 'No specific instructions provided.'}"
          </div>
        </div>
      </div>
    );
  };

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

  const { percentage } = calculateProfileCompletion(profile, jobPreferences);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 font-inter">
      {/* Premium Profile Header - Modernized & Compact */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/5 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
            {/* Avatar Section with Badge */}
            <div className="relative group shrink-0">
              <div className="relative w-32 h-32 md:w-36 md:h-36">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 rounded-full animate-gradient-xy opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
                <Avatar 
                  className="relative w-full h-full border-4 border-white dark:border-gray-800 cursor-pointer shadow-xl transition-transform duration-300 group-hover:scale-[1.02]" 
                  onClick={() => setShowProfilePictureModal(true)}
                >
                  <AvatarImage src={profile.profilePicture || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-400 dark:text-gray-500 text-4xl font-bold">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                {/* Real-time Completion Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-1.5 z-20 whitespace-nowrap">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${percentage < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{percentage}% Complete</span>
                </div>

                <button
                  onClick={() => setShowProfilePictureModal(true)}
                  className="absolute top-1 right-1 bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex-1 text-center md:text-left pt-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {profile.firstName} {profile.lastName}
                    </h1>
                  </div>
                  <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-4 h-4" />
                    {profile.title && profile.title !== 'Not set' ? profile.title : (profile.currentRole || 'Job Title Not Set')}
                  </h2>
                </div>
                
                <div className="flex items-center justify-center md:justify-end gap-3 self-center md:self-start">
                  <div className="shrink-0">
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
                      <span className="text-gray-400 font-bold whitespace-nowrap">Candidate ID</span>
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-black">{profile.candidateId}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Info Grid - Compact & Modern */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Location</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                      {profile.currentLocation || 'Not set'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {profile.phone || 'Not set'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Education</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                      {(() => {
                        const educations = (profile.educationHistory as any[]) || [];
                        const hasPG = educations.find(e => e.degreeLevel === 'Postgraduate');
                        const higherEd = hasPG || educations[0] || {};
                        return higherEd.collegeName 
                          ? `${higherEd.collegeName}${higherEd.degreeLevel === 'Postgraduate' ? ' (PG)' : ''}` 
                          : (profile.collegeName || 'Not set');
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Notice Period</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                      {profile.noticePeriod || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Match Image 4 (Horizontal Tabs) */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Navigation and Sections */}
          <div className="flex-1 space-y-8 relative">
            {showProTip && (
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 text-gray-900 dark:text-white border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-500 mb-2">
                <button 
                  onClick={() => setShowProTip(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-white/50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-bold mb-1 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Pro Tip!
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed opacity-90">
                  A complete profile increases your chances of getting noticed by top recruiters by up to 40%. Keep it fresh!
                </p>
              </div>
            )}
            {/* Horizontal Tabs - Match Image 4 */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex w-full overflow-x-auto scroller-hidden">
              <div className="flex items-center gap-1 min-w-max">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderContent()}
            </div>
          </div>

          {/* Right Column: Profile Completion Widget - Match Image 5 */}
          <div className="lg:w-[380px] space-y-6">
            <ProfileCompletionWidget profile={profile} jobPreferences={jobPreferences} />
            
            {/* Additional Info or Stats could go here */}
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
      <DialogContent className="max-w-md rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Profile Picture</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your professional headshot for your profile.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 bg-white dark:bg-gray-800">
          {profile.profilePicture && (
            <div className="flex justify-center">
              <Avatar className="w-48 h-48 border-[6px] border-white dark:border-gray-800 shadow-2xl mx-auto ring-4 ring-cyan-400/20">
                <AvatarImage src={profile.profilePicture} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-5xl font-bold">
                  {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
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
      <DialogContent className="max-w-md rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden">
        <div className="bg-purple-50/50 dark:bg-purple-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Gender Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Specify your gender for profile records and diversity reporting.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800">
          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-purple-500 transition-colors">
              Gender
            </label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6 h-12 font-semibold">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !gender} 
              className="bg-purple-600 text-white hover:bg-purple-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:scale-[1.02]"
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResumeMergeFieldList({
  title,
  subtitle,
  items,
  variant,
}: {
  title: string;
  subtitle: string;
  items: ResumeMergeFieldChange[];
  variant: 'from_resume' | 'retained';
}) {
  if (items.length === 0) return null;

  const isFromResume = variant === 'from_resume';

  return (
    <div className="space-y-3">
      <div>
        <h4 className={`text-sm font-bold ${isFromResume ? 'text-emerald-800 dark:text-emerald-300' : 'text-blue-800 dark:text-blue-300'}`}>
          {title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {items.map((item) => (
          <li
            key={item.key}
            className={`rounded-xl border px-3 py-2.5 text-sm ${
              isFromResume
                ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                : 'border-blue-100 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
            {isFromResume && item.currentValue && item.currentValue !== item.newValue ? (
              <p className="text-xs text-gray-400 line-through mb-0.5">{item.currentValue}</p>
            ) : null}
            <p className={`font-semibold ${isFromResume ? 'text-emerald-900 dark:text-emerald-100' : 'text-blue-900 dark:text-blue-100'}`}>
              {item.newValue || item.currentValue || '—'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ResumeUploadStep = 'select' | 'analyzing' | 'preview' | 'applying';

// Resume Upload Modal Component
function ResumeUploadModal({ open, onOpenChange, profile: _profile }: { open: boolean; onOpenChange: (open: boolean) => void; profile: Profile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState<ResumeUploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    fileName: string;
    fromResume: ResumeMergeFieldChange[];
    retained: ResumeMergeFieldChange[];
  } | null>(null);

  const resetModal = () => {
    setStep('select');
    setSelectedFile(null);
    setPreviewData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF or image file.",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 5MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setSelectedFile(file);
    setStep('analyzing');

    try {
      const preview = await api.previewResumeMerge(file);
      setPreviewData({
        fileName: preview.fileName || file.name,
        fromResume: preview.fromResume || [],
        retained: preview.retained || [],
      });
      setStep('preview');
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not read this resume. Please try again.",
        variant: "destructive",
      });
      resetModal();
    }
  };

  const handleApply = async () => {
    setStep('applying');
    try {
      await api.applyResumeMerge();
      await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      toast({
        title: "Profile Updated",
        description: "Your resume was saved. New details were merged without removing your existing entries.",
      });
      onOpenChange(false);
      resetModal();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to apply resume updates.",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const busy = step === 'analyzing' || step === 'applying';

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!busy) {
        onOpenChange(val);
        if (!val) resetModal();
      }
    }}>
      <DialogContent className={`${step === 'preview' ? 'max-w-2xl' : 'max-w-md'} rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col`}>
        {step === 'analyzing' || step === 'applying' ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                {step === 'applying' ? <Loader2 className="w-10 h-10 animate-spin" /> : <Sparkles className="w-10 h-10 animate-pulse" />}
              </div>
              {step === 'analyzing' && (
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {step === 'applying' ? 'Updating your profile…' : 'AI is analyzing…'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {step === 'applying'
                  ? 'Saving your resume and merging only the fields you confirmed.'
                  : 'Reading your resume and comparing it with your current profile.'}
              </p>
            </div>
          </div>
        ) : step === 'preview' && previewData ? (
          <>
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 px-8 py-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  Review profile changes
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  From <span className="font-semibold text-gray-900 dark:text-white">{previewData.fileName}</span> — confirm to update. Fields not found in the resume stay as they are.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800 overflow-y-auto flex-1">
              <ResumeMergeFieldList
                title="From your new resume"
                subtitle="These values will be added or updated on your profile."
                items={previewData.fromResume.filter((i) => i.newValue || i.currentValue)}
                variant="from_resume"
              />
              <ResumeMergeFieldList
                title="Kept from your profile"
                subtitle="Not found in the resume — your existing entries will remain unchanged."
                items={previewData.retained.filter((i) => i.newValue || i.currentValue)}
                variant="retained"
              />
              {previewData.fromResume.length === 0 && previewData.retained.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No profile field changes detected. Your resume file will still be updated.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                  onClick={() => {
                    resetModal();
                  }}
                >
                  Choose another file
                </Button>
                <Button
                  className="flex-1 bg-gray-900 text-white hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl h-12 font-bold gap-2"
                  onClick={handleApply}
                >
                  Confirm & update
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Update Resume</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Upload a resume to preview AI-extracted details before anything on your profile changes.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white dark:bg-gray-800">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-900/30 group"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 text-center mb-2">
                  Click to Browse or Drag Resume
                </p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG up to 5MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </>
        )}
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
      <DialogContent className="max-w-2xl rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden">
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Write or Paste Resume</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manually update your professional experience or paste your resume content.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800">
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6 h-12 font-semibold">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !resumeText} 
              className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
            >
              {isPending ? 'Saving...' : 'Save Resume'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const ModalField = ({ id, label, value, onChange, placeholder, type = 'text', disabled, focusColor = 'blue' }: { id: string, label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, disabled?: boolean, focusColor?: string }) => (
  <div className="relative group">
    <label 
      className={`absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors`}
    >
      {label}
    </label>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className={`border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white`}
    />
  </div>
);

// Job Preferences Modal Component
function JobPreferencesModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: jobPreferences } = useJobPreferences();
  const { mutateAsync: updateJobPreferences, isPending } = useUpdateJobPreferences();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jobTitles: '',
    workMode: '',
    employmentType: '',
    locations: '',
    startDate: '',
    instructions: '',
  });

  useEffect(() => {
    if (!open) return;
    setFormData({
      jobTitles: jobPreferences?.jobTitles || '',
      workMode: jobPreferences?.workMode || '',
      employmentType: jobPreferences?.employmentType || '',
      locations: jobPreferences?.locations || '',
      startDate: jobPreferences?.startDate || '',
      instructions: jobPreferences?.instructions || '',
    });
  }, [open, jobPreferences]);

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
      console.error('Failed to update job preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update job preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Job Preference Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Configure your career preferences such as notice period and domain expertise.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800">
          <ModalField 
            id="jobTitles" 
            label="Job Titles" 
            value={formData.jobTitles} 
            onChange={(v) => setFormData({ ...formData, jobTitles: v })} 
            placeholder="e.g. Software Engineer, Full Stack Developer" 
            focusColor="blue"
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Work Mode
              </label>
              <Select value={formData.workMode} onValueChange={(v) => setFormData({ ...formData, workMode: v })}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="On-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Employment Type
              </label>
              <Select value={formData.employmentType} onValueChange={(v) => setFormData({ ...formData, employmentType: v })}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <ModalField 
              id="locations" 
              label="Preferred Locations" 
              value={formData.locations} 
              onChange={(v) => setFormData({ ...formData, locations: v })} 
              placeholder="e.g. Bangalore, Mumbai" 
              focusColor="blue"
            />
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Ready to Join
              </label>
              <Select 
                value={['Immediate', '15 Days', '30 Days', '45 Days', '60 Days'].includes(formData.startDate) ? formData.startDate : ''} 
                onValueChange={(v) => {
                  setFormData({ ...formData, startDate: v });
                }}
              >
                <SelectTrigger className="border-gray-200 dark:border-gray-700 rounded-xl h-12 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Availability" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="15 Days">15 Days</SelectItem>
                  <SelectItem value="30 Days">30 Days</SelectItem>
                  <SelectItem value="45 Days">45 Days</SelectItem>
                  <SelectItem value="60 Days">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
              Instructions to Recruiter
            </label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Any special instructions for recruiters..."
              rows={4}
              className="border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-bold text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="rounded-xl px-6 h-12 font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
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
      <DialogContent className="max-w-md rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Online Presence</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Update your professional networking links like LinkedIn and Portfolio.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800">
          <ModalField 
            id="portfolioUrl" 
            label="Portfolio URL" 
            value={formData.portfolioUrl} 
            onChange={(v) => setFormData({ ...formData, portfolioUrl: v })} 
            placeholder="https://yourportfolio.com" 
            type="url"
          />
          
          <ModalField 
            id="linkedinUrl" 
            label="LinkedIn URL" 
            value={formData.linkedinUrl} 
            onChange={(v) => setFormData({ ...formData, linkedinUrl: v })} 
            placeholder="https://linkedin.com/in/yourprofile" 
            type="url"
          />
          
          <ModalField 
            id="websiteUrl" 
            label="Website URL" 
            value={formData.websiteUrl} 
            onChange={(v) => setFormData({ ...formData, websiteUrl: v })} 
            placeholder="https://yourwebsite.com" 
            type="url"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6 h-12 font-semibold">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02]"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
