import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useUpdateProfile } from '@/hooks/use-profile';
import { Plus, Trash2, GraduationCap, Star, BookOpen, Globe } from 'lucide-react';
import type { Profile } from '@shared/schema';
import {
  CANDIDATE_DESKTOP_DIALOG_CLASSES,
  CANDIDATE_MOBILE_DIALOG_CLASSES,
} from '@/lib/candidate-ui-preferences';
import { cn } from '@/lib/utils';

interface EducationEntry {
  degreeLevel: string;
  collegeName: string;
  pedigreeLevel: string;
  course: string;
  currentDomain: string;
  yearOfCompletion: string;
}

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
    let initialEducations: EducationEntry[] = [];
    
    // Check for education history first
    if (profile.educationHistory && Array.isArray(profile.educationHistory)) {
      initialEducations = profile.educationHistory as EducationEntry[];
    } else if (profile.degreeLevel) {
      // Fallback to legacy single entry
      initialEducations = [{
        degreeLevel: profile.degreeLevel || '',
        collegeName: profile.collegeName || '',
        pedigreeLevel: profile.pedigreeLevel || '',
        course: profile.course || '',
        currentDomain: profile.currentDomain || '',
        yearOfCompletion: profile.graduationYear || '',
      }];
    }

    if (initialEducations.length === 0) {
      initialEducations = [{
        degreeLevel: '',
        collegeName: '',
        pedigreeLevel: '',
        course: '',
        currentDomain: '',
        yearOfCompletion: '',
      }];
    }

    const skillsText = profile.skills || '';
    const skillList = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    return {
      educations: initialEducations,
      primarySkills: skillList.slice(0, 3).join(', '),
      secondarySkills: skillList.slice(3, 8).join(', '),
      knowledgeOnlySkills: skillList.slice(8).join(', '),
    };
  };

  const form = useForm({
    defaultValues: parseExistingSkills()
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations"
  });

  useEffect(() => {
    if (open) {
      form.reset(parseExistingSkills());
    }
  }, [open, profile]);

  const onSubmit = async (data: any) => {
    try {
      const allSkills = [
        ...data.primarySkills.split(',').map((s: string) => s.trim()),
        ...data.secondarySkills.split(',').map((s: string) => s.trim()),
        ...data.knowledgeOnlySkills.split(',').map((s: string) => s.trim())
      ].filter(Boolean).join(', ');
      
      // Determine higher education for legacy fields
      const hasPG = data.educations.find((e: EducationEntry) => e.degreeLevel === 'Postgraduate');
      const higherEd = hasPG || data.educations[0];

      await updateProfile.mutateAsync({ 
        skills: allSkills,
        educationHistory: data.educations,
        // Sync legacy fields for backward compatibility
        collegeName: higherEd?.collegeName || '',
        pedigreeLevel: higherEd?.pedigreeLevel || '',
        currentDomain: higherEd?.currentDomain || '',
        course: higherEd?.course || '',
        degreeLevel: higherEd?.degreeLevel || '',
        graduationYear: higherEd?.yearOfCompletion || '',
        highestQualification: higherEd?.degreeLevel || ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update strengths:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl rounded-2xl lg:rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]",
          CANDIDATE_MOBILE_DIALOG_CLASSES,
          CANDIDATE_DESKTOP_DIALOG_CLASSES,
          "max-lg:w-[calc(100vw-1rem)]",
        )}
      >
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-4 py-4 sm:px-8 sm:py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">Your Strengths</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Showcase your academic background and professional expertise.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-10 sm:pt-6 space-y-8 sm:space-y-10 bg-white dark:bg-gray-800 flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide">
          {/* Education Section */}
          <section className="space-y-8">
            <div className="flex justify-end mb-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ degreeLevel: '', collegeName: '', pedigreeLevel: '', course: '', currentDomain: '', yearOfCompletion: '' })}
                className="rounded-xl border-blue-100 dark:border-blue-900 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={14} /> Add Education
              </Button>
            </div>

            <div className="space-y-8">
              {fields.map((field, index) => (
                <div key={field.id} className="relative p-8 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/30 group transition-all hover:border-blue-100 dark:hover:border-blue-900 shadow-sm">
                  {fields.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                        Degree Level
                      </label>
                      <Controller
                        name={`educations.${index}.degreeLevel`}
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                              <SelectItem value="Undergraduate">Undergraduate (UG)</SelectItem>
                              <SelectItem value="Postgraduate">Postgraduate (PG)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {form.watch(`educations.${index}.degreeLevel`) && (
                      <>
                        <div className="relative group">
                          <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                            University / College
                          </label>
                          <Input
                            {...form.register(`educations.${index}.collegeName`)}
                            className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                            placeholder="e.g. SRM University"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                            Institution Tier
                          </label>
                          <Controller
                            name={`educations.${index}.pedigreeLevel`}
                            control={form.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white">
                                  <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                  <SelectItem value="Tier 1">Tier 1 Institution</SelectItem>
                                  <SelectItem value="Tier 2">Tier 2 Institution</SelectItem>
                                  <SelectItem value="Tier 3">Tier 3 Institution</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                            Course / Major
                          </label>
                          <Input
                            {...form.register(`educations.${index}.course`)}
                            className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                            placeholder="e.g. B.Tech Computer Science"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                            Domain / Specialization
                          </label>
                          <Input
                            {...form.register(`educations.${index}.currentDomain`)}
                            className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                            placeholder="e.g. Software Engineering"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                            Year of Completion
                          </label>
                          <Input
                            {...form.register(`educations.${index}.yearOfCompletion`)}
                            className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                            placeholder="e.g. 2023"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                  Primary Expertise
                </label>
                <Textarea
                  {...form.register('primarySkills')}
                  rows={4}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm scrollbar-hide placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white"
                  placeholder="Primary skills..."
                />
              </div>
              
              <div className="relative group">
                <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                  Secondary Skills
                </label>
                <Textarea
                  {...form.register('secondarySkills')}
                  rows={4}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm scrollbar-hide placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white"
                  placeholder="Secondary skills..."
                />
              </div>
              
              <div className="relative group">
                <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                  Knowledge Areas
                </label>
                <Textarea
                  {...form.register('knowledgeOnlySkills')}
                  rows={4}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm scrollbar-hide placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white"
                  placeholder="Knowledge areas..."
                />
              </div>
            </div>
          </section>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
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
              disabled={updateProfile.isPending} 
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-medium shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
