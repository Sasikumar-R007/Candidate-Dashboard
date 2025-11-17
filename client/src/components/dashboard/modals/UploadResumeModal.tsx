import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ResumeFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  whatsappNumber: string;
  primaryEmail: string;
  secondaryEmail: string;
  highestQualification: string;
  collegeName: string;
  linkedin: string;
  pedigreeLevel: string;
  currentLocation: string;
  noticePeriod: string;
  website: string;
  portfolio1: string;
  currentCompany: string;
  portfolio2: string;
  currentRole: string;
  portfolio3: string;
  companyDomain: string;
  companyLevel: string;
  skills: string[];
}

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formData: ResumeFormData;
  setFormData: (data: ResumeFormData) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  formError: string;
  setFormError: (error: string) => void;
}

export default function UploadResumeModal({
  isOpen,
  onClose,
  onSuccess,
  formData,
  setFormData,
  resumeFile,
  setResumeFile,
  formError,
  setFormError
}: UploadResumeModalProps) {
  const { toast } = useToast();
  const [deliverToRequirement, setDeliverToRequirement] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState('');
  
  const handleSubmit = () => {
    // Basic validation
    const required = ['firstName', 'lastName', 'mobileNumber', 'primaryEmail', 'highestQualification', 'collegeName', 'pedigreeLevel', 'currentLocation', 'currentCompany', 'currentRole', 'companyDomain', 'companyLevel'];
    const hasEmptyRequired = required.some(field => !(formData[field as keyof ResumeFormData] as string).trim());
    const hasSkills = formData.skills.some(skill => skill.trim());
    
    if (hasEmptyRequired || !hasSkills) {
      setFormError('Please fill out all required fields and add at least one skill');
      return;
    }
    
    // Capture state before closing
    const isDelivering = deliverToRequirement;
    const requirementName = selectedRequirement;
    
    // Show success toast before closing
    toast({
      title: "Resume uploaded successfully",
      description: isDelivering && requirementName 
        ? `Resume delivered to requirement: ${requirementName}` 
        : "Resume has been added to the database",
    });
    
    // Reset form first
    setFormData({
      firstName: '',
      lastName: '',
      mobileNumber: '',
      whatsappNumber: '',
      primaryEmail: '',
      secondaryEmail: '',
      highestQualification: '',
      collegeName: '',
      linkedin: '',
      pedigreeLevel: '',
      currentLocation: '',
      noticePeriod: '',
      website: '',
      portfolio1: '',
      currentCompany: '',
      portfolio2: '',
      currentRole: '',
      portfolio3: '',
      companyDomain: '',
      companyLevel: '',
      skills: ['', '', '', '', '']
    });
    setResumeFile(null);
    setFormError('');
    setDeliverToRequirement(false);
    setSelectedRequirement('');
    
    // Close modal after reset
    onClose();
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(95vh - 4rem)' }}>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Error message */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {formError}
              </div>
            )}
            
            {/* Row 1: First Name, Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="First Name *"
                data-testid="input-first-name"
              />
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Last Name *"
                data-testid="input-last-name"
              />
            </div>

            {/* Row 2: Mobile Number, WhatsApp Number */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Mobile Number *"
                data-testid="input-mobile-number"
              />
              <Input
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="WhatsApp Number"
                data-testid="input-whatsapp-number"
              />
            </div>

            {/* Row 3: Primary Email, Secondary Email */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => setFormData({...formData, primaryEmail: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Primary Email *"
                data-testid="input-primary-email"
              />
              <Input
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => setFormData({...formData, secondaryEmail: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Secondary Email"
                data-testid="input-secondary-email"
              />
            </div>

            {/* Row 4: Highest Qualification, College Name */}
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.highestQualification} onValueChange={(value) => setFormData({...formData, highestQualification: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Highest Qualification *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="12th">12th Standard</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={formData.collegeName}
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="College Name *"
                data-testid="input-college-name"
              />
            </div>

            {/* Row 5: LinkedIn, Pedigree Level */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="LinkedIn Profile"
                data-testid="input-linkedin"
              />
              <Select value={formData.pedigreeLevel} onValueChange={(value) => setFormData({...formData, pedigreeLevel: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Pedigree Level *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1</SelectItem>
                  <SelectItem value="tier2">Tier 2</SelectItem>
                  <SelectItem value="tier3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 6: Current Location, Notice Period */}
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.currentLocation} onValueChange={(value) => setFormData({...formData, currentLocation: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Current Location *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.noticePeriod} onValueChange={(value) => setFormData({...formData, noticePeriod: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Notice Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="15days">15 Days</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="2months">2 Months</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 7: Website, Portfolio 1 */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Website URL"
                data-testid="input-website"
              />
              <Input
                value={formData.portfolio1}
                onChange={(e) => setFormData({...formData, portfolio1: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Portfolio 1 URL"
                data-testid="input-portfolio1"
              />
            </div>

            {/* Row 8: Current Company, Portfolio 2 */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.currentCompany}
                onChange={(e) => setFormData({...formData, currentCompany: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Current Company *"
                data-testid="input-current-company"
              />
              <Input
                value={formData.portfolio2}
                onChange={(e) => setFormData({...formData, portfolio2: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Portfolio 2 URL"
                data-testid="input-portfolio2"
              />
            </div>

            {/* Row 9: Current Role, Portfolio 3 */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={formData.currentRole}
                onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Current Role *"
                data-testid="input-current-role"
              />
              <Input
                value={formData.portfolio3}
                onChange={(e) => setFormData({...formData, portfolio3: e.target.value})}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Portfolio 3 URL"
                data-testid="input-portfolio3"
              />
            </div>

            {/* Row 10: Company Domain, Company Level */}
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.companyDomain} onValueChange={(value) => setFormData({...formData, companyDomain: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Company Domain *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.companyLevel} onValueChange={(value) => setFormData({...formData, companyLevel: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Company Level *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="midsize">Mid-size</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="mnc">MNC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Section */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Skills *</p>
              <p className="text-xs text-gray-500 mb-3">Add up to 15 skills</p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Input
                    key={index}
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...formData.skills];
                      newSkills[index] = e.target.value;
                      setFormData({...formData, skills: newSkills});
                    }}
                    className="bg-gray-50 rounded w-32 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder={`Skill ${index + 1}`}
                    data-testid={`input-skill-${index}`}
                  />
                ))}
                {formData.skills.length < 15 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({...formData, skills: [...formData.skills, '']})}
                    className="text-xs px-2 py-1"
                  >
                    + Add Skill
                  </Button>
                )}
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Upload Resume (PDF/Image)</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Choose File Drag File</p>
                  {resumeFile && (
                    <p className="text-xs text-green-600">Selected: {resumeFile.name}</p>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="resume-upload"
                    data-testid="input-resume-file"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs text-gray-600 mt-2"
                  >
                    Browse Files
                  </label>
                </div>
              </div>
            </div>

            {/* Deliver to Requirement Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Label className="text-sm font-medium text-gray-700">Deliver to Requirement</Label>
                <Switch
                  checked={deliverToRequirement}
                  onCheckedChange={setDeliverToRequirement}
                  data-testid="toggle-deliver-requirement"
                />
              </div>
              <Select 
                value={selectedRequirement} 
                onValueChange={setSelectedRequirement}
                disabled={!deliverToRequirement}
              >
                <SelectTrigger 
                  className={`bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0 w-80 ${!deliverToRequirement ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-testid="select-requirement"
                >
                  <SelectValue placeholder="Select Requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend-developer">Frontend Developer - REQ001</SelectItem>
                  <SelectItem value="backend-developer">Backend Developer - REQ002</SelectItem>
                  <SelectItem value="fullstack-developer">Full Stack Developer - REQ003</SelectItem>
                  <SelectItem value="ui-ux-designer">UI/UX Designer - REQ004</SelectItem>
                  <SelectItem value="product-manager">Product Manager - REQ005</SelectItem>
                  <SelectItem value="devops-engineer">DevOps Engineer - REQ006</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-medium"
                data-testid="button-submit-resume"
              >
                Submit Resume
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
