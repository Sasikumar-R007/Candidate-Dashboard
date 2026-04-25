import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@shared/schema';

interface EditBasicInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const Field = ({ id, label, value, onChange, required, placeholder, type = 'text', readOnly, disabled }: FieldProps) => (
  <div className="relative group">
    <label 
      htmlFor={id}
      className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors"
    >
      {label}
    </label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      className={`h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 ${disabled ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : ''}`}
    />
  </div>
);

export default function EditBasicInfoModal({ open, onOpenChange, profile }: EditBasicInfoModalProps) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    title: profile.title || '',
    location: profile.location || '',
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    email: profile.email || '',
    secondaryEmail: profile.secondaryEmail || '',
    gender: profile.gender || '',
    currentLocation: profile.currentLocation || '',
    preferredLocation: profile.preferredLocation || '',
    dateOfBirth: profile.dateOfBirth || '',
  });

  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const hasChanges = useMemo(() => {
    return (
      formData.firstName !== (profile.firstName || '') ||
      formData.lastName !== (profile.lastName || '') ||
      formData.title !== (profile.title || '') ||
      formData.location !== (profile.location || '') ||
      formData.phone !== (profile.phone || '') ||
      formData.whatsapp !== (profile.whatsapp || '') ||
      formData.email !== (profile.email || '') ||
      formData.secondaryEmail !== (profile.secondaryEmail || '') ||
      formData.gender !== (profile.gender || '') ||
      formData.currentLocation !== (profile.currentLocation || '') ||
      formData.preferredLocation !== (profile.preferredLocation || '') ||
      formData.dateOfBirth !== (profile.dateOfBirth || '')
    );
  }, [formData, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update basic info:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profile Information</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Update your personal and contact details for better visibility and record keeping.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white dark:bg-gray-800 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="firstName" 
              label="First Name" 
              value={formData.firstName} 
              onChange={(v) => setFormData({ ...formData, firstName: v })} 
              required 
              placeholder="e.g. Mathew" 
            />
            <Field 
              id="lastName" 
              label="Last Name" 
              value={formData.lastName} 
              onChange={(v) => setFormData({ ...formData, lastName: v })} 
              required 
              placeholder="e.g. Anderson" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="title" 
              label="Job Title" 
              value={formData.title} 
              onChange={(v) => setFormData({ ...formData, title: v })} 
              required 
              placeholder="e.g. Cloud Engineer" 
            />
            <Field 
              id="location" 
              label="Location" 
              value={formData.location} 
              onChange={(v) => setFormData({ ...formData, location: v })} 
              required 
              placeholder="e.g. Chennai, India" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="phone" 
              label="Mobile Number" 
              value={formData.phone} 
              onChange={(v) => setFormData({ ...formData, phone: v })} 
              placeholder="e.g. +91 98765 43210" 
            />
            <Field 
              id="whatsapp" 
              label="WhatsApp No" 
              value={formData.whatsapp} 
              onChange={(v) => setFormData({ ...formData, whatsapp: v })} 
              placeholder="e.g. +91 98765 43210" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="email" 
              label="Primary Email (Read Only)" 
              value={formData.email} 
              onChange={() => {}} 
              disabled 
              readOnly 
            />
            <Field 
              id="secondaryEmail" 
              label="Secondary Email" 
              value={formData.secondaryEmail} 
              onChange={(v) => setFormData({ ...formData, secondaryEmail: v })} 
              placeholder="e.g. mathew.work@gmail.com" 
              type="email"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="currentLocation" 
              label="Current Location" 
              value={formData.currentLocation} 
              onChange={(v) => setFormData({ ...formData, currentLocation: v })} 
              placeholder="e.g. Chennai, TN" 
            />
            <Field 
              id="preferredLocation" 
              label="Preferred Location" 
              value={formData.preferredLocation} 
              onChange={(v) => setFormData({ ...formData, preferredLocation: v })} 
              placeholder="e.g. Bengaluru, KA" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field 
              id="dateOfBirth" 
              label="Date of Birth" 
              value={formData.dateOfBirth} 
              onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} 
              type="date" 
            />
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Gender
              </label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData({ ...formData, gender: v })}
              >
                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              disabled={updateProfile.isPending || !hasChanges}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}