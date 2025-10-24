import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface EditStrengthsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditStrengthsModal({
  open,
  onOpenChange,
  profile
}: EditStrengthsModalProps) {
  const updateProfile = useUpdateProfile();
  
  const parseExistingSkills = () => {
    if (!profile.skills) {
      return { primarySkills: '', secondarySkills: '', knowledgeOnlySkills: '' };
    }
    
    const skillsText = profile.skills;
    const primaryMatch = skillsText.match(/Primary Skills:\s*\n([\s\S]*?)(?=\n\nSecondary Skills:|\n\nKnowledge Only:|$)/);
    const secondaryMatch = skillsText.match(/Secondary Skills:\s*\n([\s\S]*?)(?=\n\nKnowledge Only:|\n\nPrimary Skills:|$)/);
    const knowledgeMatch = skillsText.match(/Knowledge Only:\s*\n([\s\S]*?)(?=\n\nPrimary Skills:|\n\nSecondary Skills:|$)/);
    
    return {
      primarySkills: primaryMatch ? primaryMatch[1].trim() : '',
      secondarySkills: secondaryMatch ? secondaryMatch[1].trim() : '',
      knowledgeOnlySkills: knowledgeMatch ? knowledgeMatch[1].trim() : '',
    };
  };
  
  const form = useForm({
    defaultValues: parseExistingSkills()
  });

  useEffect(() => {
    if (open) {
      form.reset(parseExistingSkills());
    }
  }, [open, profile.skills]);

  const onSubmit = async (data: any) => {
    try {
      const formattedSkills = `Primary Skills:\n${data.primarySkills.trim()}\n\nSecondary Skills:\n${data.secondarySkills.trim()}\n\nKnowledge Only:\n${data.knowledgeOnlySkills.trim()}`;
      await updateProfile.mutateAsync({ skills: formattedSkills });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update strengths:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Your Strengths</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="primarySkills" className="text-base font-semibold text-green-800 dark:text-green-400">
              Primary Skills
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter your core competencies and main expertise areas (one per line)
            </p>
            <Textarea
              id="primarySkills"
              {...form.register('primarySkills')}
              rows={5}
              className="border-green-200 dark:border-green-700 focus:border-green-500"
              placeholder="Business Development&#10;Marketing Analysis&#10;Lead Generation&#10;Strategic Planning&#10;Digital Marketing"
              data-testid="input-primary-skills"
            />
          </div>
          
          <div>
            <Label htmlFor="secondarySkills" className="text-base font-semibold text-cyan-800 dark:text-cyan-400">
              Secondary Skills
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter your supporting skills and capabilities (one per line)
            </p>
            <Textarea
              id="secondarySkills"
              {...form.register('secondarySkills')}
              rows={5}
              className="border-cyan-200 dark:border-cyan-700 focus:border-cyan-500"
              placeholder="Corporate Sales&#10;Resource Manager&#10;Customer Interaction&#10;Team Leadership&#10;Budget Management"
              data-testid="input-secondary-skills"
            />
          </div>
          
          <div>
            <Label htmlFor="knowledgeOnlySkills" className="text-base font-semibold text-purple-800 dark:text-purple-400">
              Knowledge Only
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter areas where you have knowledge but limited hands-on experience (one per line)
            </p>
            <Textarea
              id="knowledgeOnlySkills"
              {...form.register('knowledgeOnlySkills')}
              rows={5}
              className="border-purple-200 dark:border-purple-700 focus:border-purple-500"
              placeholder="Telecalling&#10;English communication&#10;Sales requirement&#10;Client Relations&#10;Market Research"
              data-testid="input-knowledge-only-skills"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-strengths"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary-blue hover:bg-blue-600"
              disabled={updateProfile.isPending}
              data-testid="button-save-strengths"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
