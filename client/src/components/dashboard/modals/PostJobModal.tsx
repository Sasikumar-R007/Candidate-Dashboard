import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X, Loader2 } from 'lucide-react';
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const validateForm = () => {
    const required = ['companyName', 'experience', 'salaryPackage', 'aboutCompany', 'roleDefinitions', 'keyResponsibility'];
    return required.every(field => formData[field as keyof JobFormData].toString().trim() !== '');
  };

  const postJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest('/api/recruiter/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
        headers: { 'Content-Type': 'application/json' }
      });
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
      salaryPackage: '',
      aboutCompany: '',
      roleDefinitions: '',
      keyResponsibility: '',
      primarySkills: ['', '', ''],
      secondarySkills: ['', ''],
      knowledgeOnly: [''],
      companyLogo: ''
    });
  };

  const parseExperience = (exp: string): { min: number | null; max: number | null } => {
    if (!exp) return { min: null, max: null };
    if (exp === '0-2') return { min: 0, max: 2 };
    if (exp === '2-5') return { min: 2, max: 5 };
    if (exp === '5+') return { min: 5, max: null };
    return { min: null, max: null };
  };

  const parseSalary = (salary: string): { min: number | null; max: number | null } => {
    if (!salary) return { min: null, max: null };
    if (salary === '0-5') return { min: 0, max: 500000 };
    if (salary === '5-10') return { min: 500000, max: 1000000 };
    if (salary === '10+') return { min: 1000000, max: null };
    return { min: null, max: null };
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
      locationType: formData.workMode === 'remote' ? 'Remote' : formData.workMode === 'hybrid' ? 'Hybrid' : 'On-site',
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
      employmentType: formData.workMode === 'full-time' ? 'Full-time' : formData.workMode === 'part-time' ? 'Part-time' : 'Full-time',
      openings: parseInt(formData.noOfPositions) || 1,
      status: 'Active'
    };

    postJobMutation.mutate(jobData);
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
              <div className="text-sm text-red-500 mb-4">* All fields are required</div>
              
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
                  placeholder="Company Name"
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
                  <Select value={formData.companyType} onValueChange={(value) => setFormData({...formData, companyType: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Company Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Target size={16} />
                  </div>
                  <Select value={formData.market} onValueChange={(value) => setFormData({...formData, market: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Field, No of Positions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <FolderOpen size={16} />
                  </div>
                  <Select value={formData.field} onValueChange={(value) => setFormData({...formData, field: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Use 25-26 Without Background" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-development">Software Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Hash size={16} />
                  </div>
                  <Select value={formData.noOfPositions} onValueChange={(value) => setFormData({...formData, noOfPositions: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="No of Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Role, Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <User size={16} />
                  </div>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <TrendingUp size={16} />
                  </div>
                  <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Location, Work Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <MapPin size={16} />
                  </div>
                  <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Laptop size={16} />
                  </div>
                  <Select value={formData.workMode} onValueChange={(value) => setFormData({...formData, workMode: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Work Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Work Mode, Salary Package */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Briefcase size={16} />
                  </div>
                  <Select value={formData.workMode} onValueChange={(value) => setFormData({...formData, workMode: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <DollarSign size={16} />
                  </div>
                  <Select value={formData.salaryPackage} onValueChange={(value) => setFormData({...formData, salaryPackage: value})}>
                    <SelectTrigger className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Salary Package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0-5 LPA</SelectItem>
                      <SelectItem value="5-10">5-10 LPA</SelectItem>
                      <SelectItem value="10+">10+ LPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* About Company */}
              <div className="relative">
                <textarea
                  value={formData.aboutCompany}
                  onChange={(e) => setFormData({...formData, aboutCompany: e.target.value})}
                  className="w-full bg-gray-50 border rounded-sm p-3 min-h-[80px] text-sm resize-none pr-16"
                  placeholder="About Company"
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
                  placeholder="Role Definitions"
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
                  placeholder="Key Responsibility"
                  data-testid="textarea-key-responsibility"
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-xs">0-20 points</span>
              </div>

              {/* Add up to 15 skills */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Add up to 15 skills</Label>
                
                {/* Primary Skills */}
                <div className="mb-3">
                  <Label className="text-xs text-gray-600 mb-2 block">Primary Skills</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.primarySkills.map((skill, index) => (
                      <Select key={`primary-${index}`} value={skill} onValueChange={(value) => {
                        const newSkills = [...formData.primarySkills];
                        newSkills[index] = value;
                        setFormData({...formData, primarySkills: newSkills});
                      }}>
                        <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                          <SelectValue placeholder="Data Analyst" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data-analyst">Data Analyst</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="node">Node.js</SelectItem>
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                {/* Secondary Skills */}
                <div className="mb-3">
                  <Label className="text-xs text-gray-600 mb-2 block">Secondary Skills</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.secondarySkills.map((skill, index) => (
                      <Select key={`secondary-${index}`} value={skill} onValueChange={(value) => {
                        const newSkills = [...formData.secondarySkills];
                        newSkills[index] = value;
                        setFormData({...formData, secondarySkills: newSkills});
                      }}>
                        <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                          <SelectValue placeholder="SEO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seo">SEO</SelectItem>
                          <SelectItem value="content-creation">Content Creation</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                {/* Knowledge Only */}
                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Knowledge only</Label>
                  <Select value={formData.knowledgeOnly[0]} onValueChange={(value) => {
                    setFormData({...formData, knowledgeOnly: [value]});
                  }}>
                    <SelectTrigger className="bg-gray-50 text-xs rounded-sm border">
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-ml">AI/ML</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="cloud">Cloud Computing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Company Logo */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Upload size={16} />
                </div>
                <Input
                  value={formData.companyLogo}
                  onChange={(e) => setFormData({...formData, companyLogo: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Company Logo (Image/Link)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 rounded-sm"
                  onClick={() => setIsPreviewModalOpen(true)}
                  disabled={postJobMutation.isPending}
                  data-testid="button-preview-job"
                >
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
                  onClick={handlePostJob}
                  disabled={postJobMutation.isPending}
                  data-testid="button-submit-job"
                >
                  {postJobMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={(open) => setIsPreviewModalOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ml-32">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Job Preview</DialogTitle>
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              type="button"
            >
              <X size={20} />
            </button>
          </DialogHeader>
          
          {/* Job Card Preview - Matching Candidate Dashboard Design */}
          <div className="bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="flex">
              {/* Company Logo Section - Left Side */}
              <div className="w-52 flex flex-col items-center justify-center relative">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 flex flex-col items-center justify-center mx-2 my-4 h-full min-h-[200px]" style={{width: '80%'}}>
                  {formData.companyLogo ? (
                    <img
                      src={formData.companyLogo}
                      alt={`${formData.companyName} logo`}
                      className="w-16 h-16 rounded object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center mb-2">
                      <Building size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700">
                      {formData.companyName ? formData.companyName.split(' ')[0] : 'Company'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details - Right Side */}
              <div className="flex-1 p-6 relative">
                {/* Save Job Button - Top Right */}
                <button className="absolute top-6 right-6 p-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200">
                  <i className="far fa-bookmark text-white"></i>
                </button>

                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  {formData.companyName || 'Company Name'}
                </h3>
                <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {formData.role || 'Job Title'}
                  <i className="fas fa-fire text-red-500 text-lg"></i>
                </h4>
                <p className="text-gray-600 mb-4">
                  {formData.companyTagline || 'Technology Product based hyper growth, Innovative company.'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-briefcase"></i>
                    {formData.experience || 'Experience'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold">₹</span>
                    {formData.salaryPackage || 'Salary'} LPA
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-map-marker-alt"></i>
                    {formData.location || 'Location'}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-clock"></i>
                    {formData.workMode || 'Work from office'}
                  </span>
                  <span className="font-medium">Permanent</span>
                </div>

                {/* Job Tags */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    Open Positions ~ {formData.noOfPositions || '2'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {formData.companyType || 'Product'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {formData.market || 'B2B'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                    Full Time
                  </span>
                </div>

                {/* Skills */}
                <div className="flex items-center gap-2 mb-4">
                  {formData.primarySkills.filter(skill => skill).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {formData.secondarySkills.filter(skill => skill).map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Posted: 3 days ago</span>
                  <div className="flex gap-2">
                    <Button className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-medium" size="sm">
                      View More
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium" size="sm">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
