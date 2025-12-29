import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Upload, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

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
  const queryClient = useQueryClient();
  const [deliverToRequirement, setDeliverToRequirement] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);

  // Location suggestions - Tamil Nadu cities and other top Indian cities
  const locations = [
    // Tamil Nadu Cities
    { value: 'chennai', label: 'Chennai' },
    { value: 'coimbatore', label: 'Coimbatore' },
    { value: 'madurai', label: 'Madurai' },
    { value: 'trichy', label: 'Trichy' },
    { value: 'salem', label: 'Salem' },
    { value: 'tirunelveli', label: 'Tirunelveli' },
    { value: 'erode', label: 'Erode' },
    { value: 'vellore', label: 'Vellore' },
    { value: 'dindigul', label: 'Dindigul' },
    { value: 'thanjavur', label: 'Thanjavur' },
    { value: 'tiruppur', label: 'Tiruppur' },
    { value: 'karur', label: 'Karur' },
    { value: 'hosur', label: 'Hosur' },
    { value: 'nagercoil', label: 'Nagercoil' },
    { value: 'kanchipuram', label: 'Kanchipuram' },
    // Other Top Indian Cities
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'pune', label: 'Pune' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'surat', label: 'Surat' },
    { value: 'lucknow', label: 'Lucknow' },
    { value: 'nagpur', label: 'Nagpur' },
    { value: 'indore', label: 'Indore' },
    { value: 'gurgaon', label: 'Gurgaon' },
    { value: 'noida', label: 'Noida' },
    { value: 'kochi', label: 'Kochi' },
    { value: 'visakhapatnam', label: 'Visakhapatnam' },
    { value: 'vadodara', label: 'Vadodara' },
  ];

  // Company domain suggestions - Common industries
  const domains = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'banking', label: 'Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'retail', label: 'Retail' },
    { value: 'e-commerce', label: 'E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'education', label: 'Education' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'logistics', label: 'Logistics & Supply Chain' },
    { value: 'energy', label: 'Energy & Utilities' },
    { value: 'aerospace', label: 'Aerospace & Defense' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'construction', label: 'Construction' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'non-profit', label: 'Non-profit' },
    { value: 'government', label: 'Government' },
    { value: 'transportation', label: 'Transportation' },
  ];

  // Validation functions
  const validateTextOnly = (value: string): boolean => {
    return /^[a-zA-Z\s]*$/.test(value);
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Allow empty for optional fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateURL = (url: string): boolean => {
    if (!url.trim()) return true; // Allow empty for optional fields
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    if (validateTextOnly(value) || value === '') {
      setFormData({ ...formData, [field]: value });
    } else {
      toast({
        title: "Invalid input",
        description: `${field === 'firstName' ? 'First Name' : 'Last Name'} should contain only letters and spaces.`,
        variant: 'destructive'
      });
    }
  };

  const handlePhoneChange = (field: 'mobileNumber' | 'whatsappNumber', value: string) => {
    // Only allow numbers, +, -, spaces, and parentheses for phone format
    const phoneRegex = /^[\d+\-()\s]*$/;
    if (phoneRegex.test(value) || value === '') {
      setFormData({ ...formData, [field]: value });
    } else {
      toast({
        title: "Invalid input",
        description: `${field === 'mobileNumber' ? 'Mobile Number' : 'WhatsApp Number'} should contain only numbers and phone formatting characters (+, -, spaces, parentheses).`,
        variant: 'destructive'
      });
    }
  };

  const handleEmailChange = (field: 'primaryEmail' | 'secondaryEmail', value: string) => {
    // Only update the value, validation happens on blur
    setFormData({ ...formData, [field]: value });
  };

  const handleURLChange = (field: 'linkedin' | 'website' | 'portfolio1' | 'portfolio2' | 'portfolio3', value: string) => {
    // Only update the value, validation happens on blur
    setFormData({ ...formData, [field]: value });
  };
  
  // Mutation for creating candidate
  const createCandidateMutation = useMutation({
    mutationFn: async (candidateData: any) => {
      // First upload resume file if present
      let resumeFilePath = null;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadResponse = await fetch('/api/recruiter/upload/resume', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload resume file');
        }
        const uploadResult = await uploadResponse.json();
        resumeFilePath = uploadResult.filePath || uploadResult.url;
      }
      
      // Then create candidate
      return apiRequest('POST', '/api/recruiter/candidates', {
        ...candidateData,
        resumeFile: resumeFilePath
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh candidate lists
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/candidates/counts'] });
      
      toast({
        title: "Resume uploaded successfully",
        description: deliverToRequirement && selectedRequirement 
          ? `Resume delivered to requirement: ${selectedRequirement}` 
          : "Resume has been added to the database",
      });
      
      // Reset form
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
      
      // Close modal and trigger success callback
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      setFormError(error.message || 'Failed to upload resume. Please try again.');
      toast({
        title: "Error",
        description: error.message || 'Failed to upload resume. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleSubmit = async () => {
    // Basic validation
    const required = ['firstName', 'lastName', 'mobileNumber', 'primaryEmail', 'highestQualification', 'collegeName', 'pedigreeLevel', 'currentLocation'];
    const hasEmptyRequired = required.some(field => !(formData[field as keyof ResumeFormData] as string).trim());
    const hasSkills = formData.skills.some(skill => skill.trim());
    
    if (hasEmptyRequired || !hasSkills) {
      setFormError('Please fill out all required fields and add at least one skill');
      return;
    }

    // Validate email formats
    if (!validateEmail(formData.primaryEmail)) {
      setFormError('Please enter a valid primary email address');
      toast({
        title: "Invalid email",
        description: "Please enter a valid primary email address.",
        variant: 'destructive'
      });
      return;
    }

    if (formData.secondaryEmail.trim() && !validateEmail(formData.secondaryEmail)) {
      setFormError('Please enter a valid secondary email address');
      toast({
        title: "Invalid email",
        description: "Please enter a valid secondary email address.",
        variant: 'destructive'
      });
      return;
    }

    // Validate URL formats
    const urlFields: Array<'linkedin' | 'website' | 'portfolio1' | 'portfolio2' | 'portfolio3'> = ['linkedin', 'website', 'portfolio1', 'portfolio2', 'portfolio3'];
    for (const field of urlFields) {
      if (formData[field].trim() && !validateURL(formData[field])) {
        setFormError(`Please enter a valid URL for ${field}`);
        toast({
          title: "Invalid URL",
          description: `Please enter a valid URL for ${field}.`,
          variant: 'destructive'
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    // Prepare candidate data
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const skillsString = formData.skills.filter(s => s.trim()).join(', ');
    
    const candidateData = {
      fullName,
      email: formData.primaryEmail.toLowerCase().trim(),
      phone: formData.mobileNumber.trim(),
      designation: formData.currentRole || null,
      experience: null, // Can be calculated or added later
      skills: skillsString || null,
      location: formData.currentLocation || null,
      company: formData.currentCompany || null,
      education: formData.collegeName || null,
      highestQualification: formData.highestQualification || null,
      linkedinUrl: formData.linkedin || null,
      websiteUrl: formData.website || null,
      portfolioUrl: formData.portfolio1 || formData.portfolio2 || formData.portfolio3 || null,
      noticePeriod: formData.noticePeriod || null,
      pedigreeLevel: formData.pedigreeLevel || null,
      companyLevel: formData.companyLevel || null,
      companyDomain: formData.companyDomain || null,
      pipelineStatus: 'New',
      addedBy: 'Recruiter', // Will be replaced with actual recruiter name from session
      isActive: true,
      isVerified: false
    };
    
    createCandidateMutation.mutate(candidateData);
    setIsSubmitting(false);
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
                onChange={(e) => handleNameChange('firstName', e.target.value)}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="First Name *"
                data-testid="input-first-name"
              />
              <Input
                value={formData.lastName}
                onChange={(e) => handleNameChange('lastName', e.target.value)}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Last Name *"
                data-testid="input-last-name"
              />
            </div>

            {/* Row 2: Mobile Number, WhatsApp Number */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handlePhoneChange('mobileNumber', e.target.value)}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Mobile Number *"
                data-testid="input-mobile-number"
                pattern="[0-9+\-()\s]*"
              />
              <Input
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handlePhoneChange('whatsappNumber', e.target.value)}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="WhatsApp Number"
                data-testid="input-whatsapp-number"
                pattern="[0-9+\-()\s]*"
              />
            </div>

            {/* Row 3: Primary Email, Secondary Email */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleEmailChange('primaryEmail', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateEmail(e.target.value)) {
                    toast({
                      title: "Invalid email format",
                      description: "Please enter a valid primary email address.",
                      variant: 'destructive'
                    });
                  }
                }}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Primary Email *"
                data-testid="input-primary-email"
              />
              <Input
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => handleEmailChange('secondaryEmail', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateEmail(e.target.value)) {
                    toast({
                      title: "Invalid email format",
                      description: "Please enter a valid secondary email address.",
                      variant: 'destructive'
                    });
                  }
                }}
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
                onChange={(e) => handleURLChange('linkedin', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateURL(e.target.value)) {
                    toast({
                      title: "Invalid URL format",
                      description: "Please enter a valid LinkedIn URL.",
                      variant: 'destructive'
                    });
                  }
                }}
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
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0 h-10 font-normal"
                  >
                    {formData.currentLocation
                      ? locations.find((loc) => loc.value === formData.currentLocation)?.label
                      : "Current Location *"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandList>
                      <CommandEmpty>No location found.</CommandEmpty>
                      <CommandGroup>
                        {locations.map((location) => (
                          <CommandItem
                            key={location.value}
                            value={location.value}
                            onSelect={() => {
                              setFormData({...formData, currentLocation: location.value});
                              setLocationOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.currentLocation === location.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {location.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                onChange={(e) => handleURLChange('website', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateURL(e.target.value)) {
                    toast({
                      title: "Invalid URL format",
                      description: "Please enter a valid website URL.",
                      variant: 'destructive'
                    });
                  }
                }}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Website URL"
                data-testid="input-website"
              />
              <Input
                value={formData.portfolio1}
                onChange={(e) => handleURLChange('portfolio1', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateURL(e.target.value)) {
                    toast({
                      title: "Invalid URL format",
                      description: "Please enter a valid portfolio URL.",
                      variant: 'destructive'
                    });
                  }
                }}
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
                placeholder="Current Company"
                data-testid="input-current-company"
              />
              <Input
                value={formData.portfolio2}
                onChange={(e) => handleURLChange('portfolio2', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateURL(e.target.value)) {
                    toast({
                      title: "Invalid URL format",
                      description: "Please enter a valid portfolio URL.",
                      variant: 'destructive'
                    });
                  }
                }}
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
                placeholder="Current Role"
                data-testid="input-current-role"
              />
              <Input
                value={formData.portfolio3}
                onChange={(e) => handleURLChange('portfolio3', e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim() && !validateURL(e.target.value)) {
                    toast({
                      title: "Invalid URL format",
                      description: "Please enter a valid portfolio URL.",
                      variant: 'destructive'
                    });
                  }
                }}
                className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Portfolio 3 URL"
                data-testid="input-portfolio3"
              />
            </div>

            {/* Row 10: Company Domain, Company Level */}
            <div className="grid grid-cols-2 gap-4">
              <Popover open={domainOpen} onOpenChange={setDomainOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={domainOpen}
                    className="w-full justify-between bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0 h-10 font-normal"
                  >
                    {formData.companyDomain
                      ? domains.find((dom) => dom.value === formData.companyDomain)?.label
                      : "Company Domain"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search domain..." />
                    <CommandList>
                      <CommandEmpty>No domain found.</CommandEmpty>
                      <CommandGroup>
                        {domains.map((domain) => (
                          <CommandItem
                            key={domain.value}
                            value={domain.value}
                            onSelect={() => {
                              setFormData({...formData, companyDomain: domain.value});
                              setDomainOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.companyDomain === domain.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {domain.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Select value={formData.companyLevel} onValueChange={(value) => setFormData({...formData, companyLevel: value})}>
                <SelectTrigger className="bg-gray-50 rounded focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Company Level" />
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
                disabled={isSubmitting || createCandidateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-medium disabled:opacity-50"
                data-testid="button-submit-resume"
              >
                {isSubmitting || createCandidateMutation.isPending ? 'Submitting...' : 'Submit Resume'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
