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

interface EditOnlinePresenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditOnlinePresenceModal({
  open,
  onOpenChange,
  profile
}: EditOnlinePresenceModalProps) {
  const updateProfile = useUpdateProfile();
  
  const form = useForm({
    defaultValues: {
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      twitter: profile.twitter || '',
      website: profile.website || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update online presence:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Online Presence</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              {...form.register('linkedin')}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              {...form.register('github')}
              placeholder="https://github.com/yourusername"
            />
          </div>
          
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              {...form.register('twitter')}
              placeholder="https://twitter.com/yourusername"
            />
          </div>
          
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...form.register('website')}
              placeholder="https://yourwebsite.com"
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