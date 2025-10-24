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
    phone: profile.phone || '',
    whatsapp: profile.whatsapp || '',
    email: profile.email || '',
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
      formData.phone !== (profile.phone || '') ||
      formData.whatsapp !== (profile.whatsapp || '') ||
      formData.email !== (profile.email || '') ||
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                placeholder="Mathew"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                placeholder="Anderson"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Cloud Engineer"
              className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="Chennai"
              className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Mobile Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="90347 59099"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">WhatsApp No</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="90347 59099"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Primary Email (Read Only)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none bg-gray-100 dark:bg-gray-700 cursor-not-allowed px-0 pb-2 opacity-60"
              />
            </div>
            <div>
              <Label htmlFor="secondaryEmail" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                placeholder="mathew.and@gmail.com"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currentLocation" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Current Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="Chennai."
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
            <div>
              <Label htmlFor="preferredLocation" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Preferred Location</Label>
              <Input
                id="preferredLocation"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                placeholder="Bengaluru"
                className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="border-0 border-b-2 border-dotted border-blue-300 dark:border-blue-700 rounded-none focus:border-blue-500 bg-transparent px-0 pb-2"
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