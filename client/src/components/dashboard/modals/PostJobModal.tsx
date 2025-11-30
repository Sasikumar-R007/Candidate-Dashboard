import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X, Loader2, Plus, Image } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface JobFormData {
  companyName: string;
  companyTagline: string;
  companyType: string;
  market: string;
  field: string;
  noOfPositions: string;
  role: string;
  experience: string;
  location: string;
  workMode: string;
  employmentType: string;
  salaryPackage: string;
  aboutCompany: string;
  roleDefinitions: string;
  keyResponsibility: string;
  primarySkills: string[];
  secondarySkills: string[];
  knowledgeOnly: string[];
  companyLogo: string;
}

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formData: JobFormData;
  setFormData: (data: JobFormData) => void;
  formError: string;
  setFormError: (error: string) => void;
}

export default function PostJobModal({
  isOpen,
  onClose,
  onSuccess,
  formData,
  setFormData,
  formError,
  setFormError
}: PostJobModalProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const validateForm = () => {
    const required = ['companyName', 'experience', 'salaryPackage', 'aboutCompany', 'roleDefinitions', 'keyResponsibility'];
    return required.every(field => formData[field as keyof JobFormData].toString().trim() !== '');
  };

  const postJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest('POST', '/api/recruiter/jobs', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs/counts'] });
      toast({ title: 'Job posted successfully!', description: 'Your job listing is now active.' });
      onClose();
      onSuccess();
      setFormError('');
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to post job', description: error.message || 'Please try again.', variant: 'destructive' });
      setFormError(error.message || 'Failed to post job. Please try again.');
    }
  });

  const resetForm = () => {
    setFormData({
      companyName: '',
      companyTagline: '',
      companyType: '',
      market: '',
      field: '',
      noOfPositions: '',
      role: '',
      experience: '',
      location: '',
      workMode: '',
      employmentType: '',
      salaryPackage: '',
      aboutCompany: '',
      roleDefinitions: '',
      keyResponsibility: '',
      primarySkills: [''],
      secondarySkills: [''],
      knowledgeOnly: [''],
      companyLogo: ''
    });
    setLogoPreview(null);
  };

  const parseExperience = (exp: string): { min: number | null; max: number | null } => {
    if (!exp) return { min: null, max: null };
    const match = exp.match(/(\d+)/g);
    if (match && match.length >= 2) {
      return { min: parseInt(match[0]), max: parseInt(match[1]) };
    } else if (match && match.length === 1) {
      return { min: parseInt(match[0]), max: null };
    }
    return { min: null, max: null };
  };

  const parseSalary = (salary: string): { min: number | null; max: number | null } => {
    if (!salary) return { min: null, max: null };
    const match = salary.match(/(\d+)/g);
    if (match && match.length >= 2) {
      return { min: parseInt(match[0]) * 100000, max: parseInt(match[1]) * 100000 };
    } else if (match && match.length === 1) {
      return { min: parseInt(match[0]) * 100000, max: null };
    }
    return { min: null, max: null };
  };

  const deriveLocationType = (workMode: string): string => {
    const lower = workMode.toLowerCase();
    if (lower.includes('remote')) return 'Remote';
    if (lower.includes('hybrid')) return 'Hybrid';
    if (lower.includes('office') || lower.includes('onsite') || lower.includes('on-site')) return 'On-site';
    return 'On-site';
  };

  const deriveEmploymentType = (empType: string): string => {
    const lower = empType.toLowerCase();
    if (lower.includes('full')) return 'Full-time';
    if (lower.includes('part')) return 'Part-time';
    if (lower.includes('contract')) return 'Contract';
    if (lower.includes('intern')) return 'Internship';
    return 'Full-time';
  };

  const handlePostJob = () => {
    if (!validateForm()) {
      setFormError('Please fill out all required fields');
      return;
    }

    const expRange = parseExperience(formData.experience);
    const salaryRange = parseSalary(formData.salaryPackage);
    const allSkills = [
      ...formData.primarySkills.filter(s => s),
      ...formData.secondarySkills.filter(s => s),
      ...formData.knowledgeOnly.filter(s => s)
    ];

    const jobData = {
      title: formData.role || 'Software Developer',
      company: formData.companyName,
      location: formData.location,
      locationType: deriveLocationType(formData.workMode),
      experienceMin: expRange.min,
      experienceMax: expRange.max,
      salaryMin: salaryRange.min,
      salaryMax: salaryRange.max,
      description: formData.aboutCompany,
      requirements: formData.roleDefinitions,
      responsibilities: formData.keyResponsibility,
      benefits: formData.companyTagline,
      skills: allSkills,
      department: formData.field || 'Engineering',
      employmentType: deriveEmploymentType(formData.employmentType),
      openings: parseInt(formData.noOfPositions) || 1,
      status: 'Active',
      companyLogo: formData.companyLogo || null
    };

    postJobMutation.mutate(jobData);
  };

  const addPrimarySkill = () => {
    if (formData.primarySkills.length < 5) {
      setFormData({ ...formData, primarySkills: [...formData.primarySkills, ''] });
    }
  };

  const removePrimarySkill = (index: number) => {
    if (formData.primarySkills.length > 1) {
      const newSkills = formData.primarySkills.filter((_, i) => i !== index);
      setFormData({ ...formData, primarySkills: newSkills });
    }
  };

  const updatePrimarySkill = (index: number, value: string) => {
    const newSkills = [...formData.primarySkills];
    newSkills[index] = value;
    setFormData({ ...formData, primarySkills: newSkills });
  };

  const addSecondarySkill = () => {
    if (formData.secondarySkills.length < 5) {
      setFormData({ ...formData, secondarySkills: [...formData.secondarySkills, ''] });
    }
  };

  const removeSecondarySkill = (index: number) => {
    if (formData.secondarySkills.length > 1) {
      const newSkills = formData.secondarySkills.filter((_, i) => i !== index);
      setFormData({ ...formData, secondarySkills: newSkills });
    }
  };

  const updateSecondarySkill = (index: number, value: string) => {
    const newSkills = [...formData.secondarySkills];
    newSkills[index] = value;
    setFormData({ ...formData, secondarySkills: newSkills });
  };

  const addKnowledgeSkill = () => {
    if (formData.knowledgeOnly.length < 5) {
      setFormData({ ...formData, knowledgeOnly: [...formData.knowledgeOnly, ''] });
    }
  };

  const removeKnowledgeSkill = (index: number) => {
    if (formData.knowledgeOnly.length > 1) {
      const newSkills = formData.knowledgeOnly.filter((_, i) => i !== index);
      setFormData({ ...formData, knowledgeOnly: newSkills });
    }
  };

  const updateKnowledgeSkill = (index: number, value: string) => {
    const newSkills = [...formData.knowledgeOnly];
    newSkills[index] = value;
    setFormData({ ...formData, knowledgeOnly: newSkills });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast({ title: 'File too large', description: 'Please upload an image smaller than 500KB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData({ ...formData, companyLogo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData({ ...formData, companyLogo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Post Job Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Post the job</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
            
            <div className="space-y-4">
              {/* Required fields notice */}
              <div className="text-sm text-red-500 mb-4">* Required fields</div>
              
              {/* Error message */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {formError}
                </div>
              )}
              
              {/* Company Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Building size={16} />
                </div>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Name *"
                  data-testid="input-company-name"
                />
              </div>

              {/* Company Tagline */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Tag size={16} />
                </div>
                <Input
                  value={formData.companyTagline}
                  onChange={(e) => setFormData({...formData, companyTagline: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border pr-16 focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Tagline"
                  data-testid="input-company-tagline"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">0/100</span>
              </div>

              {/* Row 1: Company Type, Market */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <BarChart3 size={16} />
                  </div>
                  <Input
                    value={formData.companyType}
                    onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Company Type (e.g., Startup, Corporate)"
                    data-testid="input-company-type"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Target size={16} />
                  </div>
                  <Input
                    value={formData.market}
                    onChange={(e) => setFormData({...formData, market: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Market (e.g., Technology, Finance)"
                    data-testid="input-market"
                  />
                </div>
              </div>

              {/* Row 2: Field, No of Positions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <FolderOpen size={16} />
                  </div>
                  <Input
                    value={formData.field}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Field (e.g., Software Development)"
                    data-testid="input-field"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Hash size={16} />
                  </div>
                  <Input
                    value={formData.noOfPositions}
                    onChange={(e) => setFormData({...formData, noOfPositions: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="No of Positions (e.g., 1, 2-5)"
                    data-testid="input-positions"
                  />
                </div>
              </div>

              {/* Row 3: Role, Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <User size={16} />
                  </div>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Role (e.g., Developer, Designer)"
                    data-testid="input-role"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <TrendingUp size={16} />
                  </div>
                  <Input
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Experience * (e.g., 0-2 years, 5+ years)"
                    data-testid="input-experience"
                  />
                </div>
              </div>

              {/* Row 4: Location, Work Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <MapPin size={16} />
                  </div>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Location (e.g., Mumbai, Bangalore)"
                    data-testid="input-location"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Laptop size={16} />
                  </div>
                  <Input
                    value={formData.workMode}
                    onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Work Type (e.g., Remote, Office, Hybrid)"
                    data-testid="input-work-type"
                  />
                </div>
              </div>

              {/* Row 5: Employment Type, Salary Package */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Briefcase size={16} />
                  </div>
                  <Input
                    value={formData.employmentType}
                    onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Employment Type (e.g., Full Time, Part Time)"
                    data-testid="input-employment-type"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <DollarSign size={16} />
                  </div>
                  <Input
                    value={formData.salaryPackage}
                    onChange={(e) => setFormData({...formData, salaryPackage: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                    placeholder="Salary Package * (e.g., 5-10 LPA)"
                    data-testid="input-salary"
                  />
                </div>
              </div>

              {/* About Company */}
              <div className="relative">
                <textarea
                  value={formData.aboutCompany}
                  onChange={(e) => setFormData({...formData, aboutCompany: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-16"
                  placeholder="About Company *"
                  data-testid="textarea-about-company"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0/1000</span>
              </div>

              {/* Role Definitions */}
              <div className="relative">
                <textarea
                  value={formData.roleDefinitions}
                  onChange={(e) => setFormData({...formData, roleDefinitions: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-16"
                  placeholder="Role Definitions *"
                  data-testid="textarea-role-definitions"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0/1500</span>
              </div>

              {/* Key Responsibility */}
              <div className="relative">
                <textarea
                  value={formData.keyResponsibility}
                  onChange={(e) => setFormData({...formData, keyResponsibility: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-20"
                  placeholder="Key Responsibility *"
                  data-testid="textarea-key-responsibility"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0-20 points</span>
              </div>

              {/* Add up to 15 skills */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Add up to 15 skills</Label>
                
                {/* Primary Skills */}
                <div className="mb-4">
                  <Label className="text-xs text-gray-600 mb-2 block">Primary Skills</Label>
                  <div className="space-y-2">
                    {formData.primarySkills.map((skill, index) => (
                      <div key={`primary-${index}`} className="flex items-center gap-2">
                        <Input
                          value={skill}
                          onChange={(e) => updatePrimarySkill(index, e.target.value)}
                          className="flex-1 bg-gray-50 text-sm rounded-sm border"
                          placeholder="Enter skill (e.g., React, Node.js)"
                          data-testid={`input-primary-skill-${index}`}
                        />
                        {formData.primarySkills.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removePrimarySkill(index)}
                            className="text-gray-400"
                            data-testid={`button-remove-primary-skill-${index}`}
                          >
                            <X size={16} />
                          </Button>
                        )}
                        {index === formData.primarySkills.length - 1 && formData.primarySkills.length < 5 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={addPrimarySkill}
                            className="text-blue-500 border-blue-200"
                            data-testid="button-add-primary-skill"
                          >
                            <Plus size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Skills */}
                <div className="mb-4">
                  <Label className="text-xs text-gray-600 mb-2 block">Secondary Skills</Label>
                  <div className="space-y-2">
                    {formData.secondarySkills.map((skill, index) => (
                      <div key={`secondary-${index}`} className="flex items-center gap-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateSecondarySkill(index, e.target.value)}
                          className="flex-1 bg-gray-50 text-sm rounded-sm border"
                          placeholder="Enter skill (e.g., SEO, Analytics)"
                          data-testid={`input-secondary-skill-${index}`}
                        />
                        {formData.secondarySkills.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeSecondarySkill(index)}
                            className="text-gray-400"
                            data-testid={`button-remove-secondary-skill-${index}`}
                          >
                            <X size={16} />
                          </Button>
                        )}
                        {index === formData.secondarySkills.length - 1 && formData.secondarySkills.length < 5 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={addSecondarySkill}
                            className="text-blue-500 border-blue-200"
                            data-testid="button-add-secondary-skill"
                          >
                            <Plus size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge Only */}
                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Knowledge Only</Label>
                  <div className="space-y-2">
                    {formData.knowledgeOnly.map((skill, index) => (
                      <div key={`knowledge-${index}`} className="flex items-center gap-2">
                        <Input
                          value={skill}
                          onChange={(e) => updateKnowledgeSkill(index, e.target.value)}
                          className="flex-1 bg-gray-50 text-sm rounded-sm border"
                          placeholder="Enter skill (e.g., AI/ML, Blockchain)"
                          data-testid={`input-knowledge-skill-${index}`}
                        />
                        {formData.knowledgeOnly.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeKnowledgeSkill(index)}
                            className="text-gray-400"
                            data-testid={`button-remove-knowledge-skill-${index}`}
                          >
                            <X size={16} />
                          </Button>
                        )}
                        {index === formData.knowledgeOnly.length - 1 && formData.knowledgeOnly.length < 5 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={addKnowledgeSkill}
                            className="text-blue-500 border-blue-200"
                            data-testid="button-add-knowledge-skill"
                          >
                            <Plus size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Logo - Optional with Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Image size={16} className="text-blue-500" />
                  Company Logo <span className="text-gray-400 text-xs font-normal">(Optional - Max 500KB)</span>
                </Label>
                
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-50">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={removeLogo}
                      className="text-red-500 border-red-200"
                      data-testid="button-remove-logo"
                    >
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-md p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="dropzone-logo"
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload company logo</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended size: 200x200px, Max: 500KB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="input-logo-file"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-50 text-blue-600 border-blue-200 rounded-sm"
                  onClick={() => setIsPreviewModalOpen(true)}
                  disabled={postJobMutation.isPending}
                  data-testid="button-preview-job"
                >
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 text-white rounded-sm"
                  onClick={handlePostJob}
                  disabled={postJobMutation.isPending}
                  data-testid="button-post-job"
                >
                  {postJobMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post the Job'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={logoPreview} alt="Company logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{formData.role || 'Job Title'}</h3>
                <p className="text-gray-600">{formData.companyName || 'Company Name'}</p>
                {formData.companyTagline && <p className="text-sm text-gray-500">{formData.companyTagline}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Location:</span> {formData.location || 'Not specified'}</div>
              <div><span className="text-gray-500">Work Type:</span> {formData.workMode || 'Not specified'}</div>
              <div><span className="text-gray-500">Experience:</span> {formData.experience || 'Not specified'}</div>
              <div><span className="text-gray-500">Salary:</span> {formData.salaryPackage || 'Not specified'}</div>
              <div><span className="text-gray-500">Positions:</span> {formData.noOfPositions || '1'}</div>
              <div><span className="text-gray-500">Field:</span> {formData.field || 'Not specified'}</div>
            </div>

            {formData.aboutCompany && (
              <div>
                <h4 className="font-medium mb-1">About Company</h4>
                <p className="text-sm text-gray-600">{formData.aboutCompany}</p>
              </div>
            )}

            {formData.roleDefinitions && (
              <div>
                <h4 className="font-medium mb-1">Role Definitions</h4>
                <p className="text-sm text-gray-600">{formData.roleDefinitions}</p>
              </div>
            )}

            {formData.keyResponsibility && (
              <div>
                <h4 className="font-medium mb-1">Key Responsibilities</h4>
                <p className="text-sm text-gray-600">{formData.keyResponsibility}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {formData.primarySkills.filter(s => s).map((skill, i) => (
                  <span key={`p-${i}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{skill}</span>
                ))}
                {formData.secondarySkills.filter(s => s).map((skill, i) => (
                  <span key={`s-${i}`} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{skill}</span>
                ))}
                {formData.knowledgeOnly.filter(s => s).map((skill, i) => (
                  <span key={`k-${i}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{skill}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Edit
              </Button>
              <Button 
                className="flex-1 bg-blue-600 text-white"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handlePostJob();
                }}
                disabled={postJobMutation.isPending}
              >
                {postJobMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post the Job'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
