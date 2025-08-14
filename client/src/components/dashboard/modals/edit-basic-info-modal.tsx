import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@shared/schema';

interface EditBasicInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditBasicInfoModal({ open, onOpenChange, profile }: EditBasicInfoModalProps) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    title: profile.title || '',
    location: profile.location || '',
    mobile: profile.mobile || '',
    whatsapp: profile.whatsapp || '',
    primaryEmail: profile.primaryEmail || '',
    secondaryEmail: profile.secondaryEmail || '',
    currentLocation: profile.currentLocation || '',
    preferredLocation: profile.preferredLocation || '',
    dateOfBirth: profile.dateOfBirth || '',
  });

  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  // Check if form data has changed
  const hasChanges = useMemo(() => {
    return (
      formData.firstName !== (profile.firstName || '') ||
      formData.lastName !== (profile.lastName || '') ||
      formData.title !== (profile.title || '') ||
      formData.location !== (profile.location || '') ||
      formData.mobile !== (profile.mobile || '') ||
      formData.whatsapp !== (profile.whatsapp || '') ||
      formData.primaryEmail !== (profile.primaryEmail || '') ||
      formData.secondaryEmail !== (profile.secondaryEmail || '') ||
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp No</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentLocation">Current Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="preferredLocation">Preferred Location</Label>
              <Input
                id="preferredLocation"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfile.isPending || !hasChanges}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}