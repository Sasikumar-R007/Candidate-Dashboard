import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  preferredLocation?: string;
  experience: number;
  education: string;
  currentCompany: string;
  skills: string[];
  noticePeriod: string;
  university: string;
  ctc: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  resumeFile?: string;
  candidateId?: string;
}

interface EditCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
}

export default function EditCandidateModal({
  open,
  onOpenChange,
  candidate
}: EditCandidateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    currentRole: '',
    location: '',
    preferredLocation: '',
    experience: '',
    education: '',
    highestQualification: '',
    collegeName: '',
    company: '',
    skills: '',
    noticePeriod: '',
    ctc: '',
    ectc: '',
    linkedinUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        fullName: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        designation: candidate.title || '',
        currentRole: candidate.title || '',
        location: candidate.location || '',
        preferredLocation: candidate.preferredLocation || '',
        experience: candidate.experience?.toString() || '',
        education: candidate.education || '',
        highestQualification: candidate.education || '',
        collegeName: candidate.university || '',
        company: candidate.currentCompany || '',
        skills: candidate.skills?.join(', ') || '',
        noticePeriod: candidate.noticePeriod || '',
        ctc: candidate.ctc || '',
        ectc: '',
        linkedinUrl: candidate.linkedinUrl || '',
        websiteUrl: candidate.websiteUrl || '',
        portfolioUrl: candidate.portfolioUrl || '',
      });
    }
  }, [candidate]);

  const updateCandidateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!candidate?.id) throw new Error('Candidate ID is required');
      return apiRequest('PUT', `/api/recruiter/candidates/${candidate.id}`, data);
    },
    onSuccess: () => {
      // Invalidate all candidate-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/applications'] });
      
      toast({
        title: "Profile Updated",
        description: "Candidate profile has been updated successfully across all records.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update candidate profile. Please try again.",
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate?.id) {
      toast({
        title: "Error",
        description: "Candidate information is missing. Please try again.",
        variant: 'destructive',
      });
      return;
    }
    
    // Prepare update data
    const updateData: any = {};
    if (formData.fullName) updateData.fullName = formData.fullName;
    if (formData.email) updateData.email = formData.email;
    if (formData.phone) updateData.phone = formData.phone;
    if (formData.designation) updateData.designation = formData.designation;
    if (formData.currentRole) updateData.currentRole = formData.currentRole;
    if (formData.location) updateData.location = formData.location;
    if (formData.preferredLocation) updateData.preferredLocation = formData.preferredLocation;
    if (formData.experience) updateData.experience = formData.experience;
    if (formData.education) updateData.education = formData.education;
    if (formData.highestQualification) updateData.highestQualification = formData.highestQualification;
    if (formData.collegeName) updateData.collegeName = formData.collegeName;
    if (formData.company) updateData.company = formData.company;
    if (formData.skills) updateData.skills = formData.skills;
    if (formData.noticePeriod) updateData.noticePeriod = formData.noticePeriod;
    if (formData.ctc) updateData.ctc = formData.ctc;
    if (formData.ectc) updateData.ectc = formData.ectc;
    if (formData.linkedinUrl) updateData.linkedinUrl = formData.linkedinUrl;
    if (formData.websiteUrl) updateData.websiteUrl = formData.websiteUrl;
    if (formData.portfolioUrl) updateData.portfolioUrl = formData.portfolioUrl;

    updateCandidateMutation.mutate(updateData);
  };

  // Don't render if no candidate
  if (!candidate) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Edit Candidate Profile</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Changes will be updated across all database records (candidates, profiles, and job applications)
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="company">Current Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  step="0.1"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Input
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctc">Current CTC</Label>
                <Input
                  id="ctc"
                  value={formData.ctc}
                  onChange={(e) => setFormData({...formData, ctc: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ectc">Expected CTC</Label>
                <Input
                  id="ectc"
                  value={formData.ectc}
                  onChange={(e) => setFormData({...formData, ectc: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Education</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="highestQualification">Highest Qualification</Label>
                <Input
                  id="highestQualification"
                  value={formData.highestQualification}
                  onChange={(e) => setFormData({...formData, highestQualification: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="collegeName">College/University</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="preferredLocation">Preferred Location</Label>
                <Input
                  id="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Skills</h3>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g., React, Node.js, TypeScript"
                rows={3}
              />
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateCandidateMutation.isPending}
              className="transition-all duration-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCandidateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {updateCandidateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

