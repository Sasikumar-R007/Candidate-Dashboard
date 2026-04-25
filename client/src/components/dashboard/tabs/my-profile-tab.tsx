import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUpdateProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, Mail, Phone, MapPin, Link as LinkIcon, 
  Trash2, Plus, Edit2, Check, X, ArrowRight,
  Briefcase, GraduationCap, Award, FileText, Settings, User as UserIcon
} from 'lucide-react';
import type { Profile } from '@shared/schema';

interface MyProfileTabProps {
  profile: Profile;
}

type Section = 'about' | 'online' | 'journey' | 'strengths' | 'resume' | 'preferences';

export default function MyProfileTab({ profile }: MyProfileTabProps) {
  const [activeSection, setActiveSection] = useState<Section>('about');
  const [isEditing, setIsEditing] = useState(false);
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();
  
  // Local form state
  const [formData, setFormData] = useState<Partial<Profile>>({ ...profile });

  const calculateStrength = useMemo(() => {
    let score = 0;
    if (profile.firstName && profile.lastName && profile.primaryEmail && profile.mobile) score += 20;
    if (profile.highestQualification || profile.collegeName || profile.skills) score += 20;
    if (profile.currentCompany || profile.currentRole || profile.currentDomain) score += 20;
    if (profile.preferredLocation || profile.noticePeriod) score += 20;
    if (profile.resumeFile || profile.linkedinUrl || profile.portfolioUrl) score += 20;
    return score;
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { id: 'about', label: 'About you', icon: UserIcon },
    { id: 'online', label: 'Online Presence', icon: LinkIcon },
    { id: 'journey', label: 'Your Journey', icon: Briefcase },
    { id: 'strengths', label: 'Your Strengths', icon: Award },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'preferences', label: 'Job Preferences', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-8 space-y-6">
      {/* Premium Header Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        {/* Profile Progress Bar at top right */}
        <div className="absolute top-8 right-8 flex flex-col items-end gap-1.5 min-w-[150px]">
          <span className="text-[12px] font-semibold text-gray-400">Profile Completion</span>
          <div className="flex items-center gap-3 w-full">
            <Progress value={calculateStrength} className="h-1.5 flex-1 bg-gray-100" />
            <span className="text-[14px] font-bold text-blue-600">{calculateStrength}%</span>
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="relative shrink-0">
          <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-blue-50 bg-gray-100 shadow-inner">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
            )}
          </div>
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-teal-400 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg hover:bg-teal-500 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Contact Info */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold text-[#0f172a] mb-1">{profile.firstName} {profile.lastName}</h1>
            <p className="text-lg font-semibold text-gray-500">{profile.currentRole || 'Cloud Engineer'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-gray-500">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-teal-500" />
              <span className="text-[14px] font-medium">{profile.currentLocation || 'Chennai.'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="text-[14px] font-medium">{profile.collegeName || 'National Institute of Technology'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 text-purple-500" />
              <span className="text-[14px] font-medium">{profile.gender || 'Male'}</span>
            </div>
          </div>
          
          {/* Header Contact Info Bar */}
          <div className="mt-6 flex flex-wrap gap-6 items-center border-t border-gray-50 pt-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-400" />
              <span className="text-[14px] font-bold text-gray-700">{profile.mobile || '90347 59099'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="text-[14px] font-bold text-gray-700">{profile.primaryEmail || profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-400" />
              <span className="text-[14px] font-bold text-gray-700">{profile.whatsapp || '90347 59099'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-extrabold text-[#0f172a] mb-6 px-2">Edit & View</h3>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                  {activeSection === item.id && <div className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 min-h-[500px] relative">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
              <h2 className="text-2xl font-extrabold text-[#0f172a] capitalize">
                {menuItems.find(m => m.id === activeSection)?.label}
              </h2>
              {isEditing ? (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-6 font-bold border-gray-200">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-100">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl px-6 font-bold flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {/* Section Content: About You */}
            {activeSection === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <ProfileField label="First Name" name="firstName" value={formData.firstName} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Last Name" name="lastName" value={formData.lastName} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Mobile Number" name="mobile" value={formData.mobile} editing={isEditing} onChange={handleChange} />
                <ProfileField label="WhatsApp No" name="whatsapp" value={formData.whatsapp} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Primary Email" name="primaryEmail" value={formData.primaryEmail} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Secondary Email" name="secondaryEmail" value={formData.secondaryEmail} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Current Location" name="currentLocation" value={formData.currentLocation} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Preferred Location" name="preferredLocation" value={formData.preferredLocation} editing={isEditing} onChange={handleChange} />
                <ProfileField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} editing={isEditing} onChange={handleChange} />
              </div>
            )}

            {/* Placeholder for other sections */}
            {activeSection !== 'about' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  {useMemo(() => {
                    const Icon = menuItems.find(m => m.id === activeSection)?.icon || UserIcon;
                    return <Icon className="w-8 h-8 text-blue-600" />;
                  }, [activeSection])}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-2">{menuItems.find(m => m.id === activeSection)?.label} Details</h3>
                <p className="text-gray-400 max-w-sm">This section is currently under development to provide you with the best experience.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, name, value, editing, onChange }: { 
  label: string, 
  name: string, 
  value?: string | null, 
  editing: boolean, 
  onChange: (e: any) => void 
}) {
  return (
    <div className="flex flex-col space-y-2 group border-b border-gray-100 pb-2">
      <Label className="text-gray-400 font-bold text-[13px]">{label} :</Label>
      {editing ? (
        <Input 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          className="border-gray-200 bg-gray-50 focus:bg-white transition-all rounded-lg h-10 font-medium" 
        />
      ) : (
        <p className="text-[#1e293b] font-bold text-base min-h-[24px]">
          {value || 'Not provided'}
        </p>
      )}
    </div>
  );
}
