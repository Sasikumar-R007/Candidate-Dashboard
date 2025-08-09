import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  profile
}: EditProfileModalProps) {
  const updateProfile = useUpdateProfile();
  
  const form = useForm({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      education: profile.education || '',
      portfolio: profile.portfolio || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              {...form.register('title')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
            />
          </div>
          
          <div>
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              {...form.register('education')}
            />
          </div>
          
          <div>
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              {...form.register('portfolio')}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary-blue hover:bg-blue-600"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}