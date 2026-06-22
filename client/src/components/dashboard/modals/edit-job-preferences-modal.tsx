import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useJobPreferences, useUpdateJobPreferences } from '@/hooks/use-profile';
import { Target, MapPin, Briefcase, Calendar, MessageSquare, DollarSign } from 'lucide-react';

interface EditJobPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditJobPreferencesModal({
  open,
  onOpenChange
}: EditJobPreferencesModalProps) {
  const { data: preferences } = useJobPreferences();
  const updatePreferences = useUpdateJobPreferences();
  
  const form = useForm({
    defaultValues: {
      jobTitles: '',
      salaryRange: '',
      locations: '',
      startDate: 'Immediate',
      workMode: 'Remote',
      employmentType: 'Full-time',
      instructions: '',
    }
  });

  useEffect(() => {
    if (preferences && open) {
      form.reset({
        jobTitles: preferences.jobTitles || '',
        salaryRange: preferences.salaryRange || '',
        locations: preferences.locations || '',
        startDate: preferences.startDate || 'Immediate',
        workMode: preferences.workMode || 'Remote',
        employmentType: preferences.employmentType || 'Full-time',
        instructions: preferences.instructions || '',
      });
    }
  }, [preferences, open, form]);

  const onSubmit = async (data: any) => {
    try {
      await updatePreferences.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update job preferences:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 px-10 py-8 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600">
                <Target size={24} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Job Preferences</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                  Tell us what kind of opportunities you are looking for
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-8 bg-white dark:bg-gray-800 flex-1 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Target Roles
              </label>
              <div className="absolute left-4 top-10 text-gray-400">
                <Briefcase size={16} />
              </div>
              <Input
                id="jobTitles"
                {...form.register('jobTitles')}
                placeholder="e.g. Software Engineer, Product Manager"
                className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
              />
            </div>
            
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest z-10 group-focus-within:text-emerald-500 transition-colors">
                Expected Salary
              </label>
              <div className="absolute left-4 top-10 text-gray-400">
                <DollarSign size={16} />
              </div>
              <Input
                id="salaryRange"
                {...form.register('salaryRange')}
                placeholder="e.g. $80,000 - $120,000"
                className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
              />
            </div>
            
            <div className="relative group md:col-span-2">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest z-10 group-focus-within:text-purple-500 transition-colors">
                Preferred Locations
              </label>
              <div className="absolute left-4 top-10 text-gray-400">
                <MapPin size={16} />
              </div>
              <Input
                id="locations"
                {...form.register('locations')}
                placeholder="e.g. Remote, Bangalore, New York"
                className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
              />
            </div>
            
            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest z-10">
                Work Mode
              </label>
              <Controller
                name="workMode"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-sm">
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" sideOffset={4} className="z-[200] rounded-xl border-gray-100 shadow-xl">
                      <SelectItem value="Remote">Remote Only</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest z-10">
                Employment Type
              </label>
              <Controller
                name="employmentType"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-sm">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" sideOffset={4} className="z-[200] rounded-xl border-gray-100 shadow-xl">
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="relative group md:col-span-2">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest z-10 group-focus-within:text-cyan-500 transition-colors">
                Availability
              </label>
              <div className="absolute left-4 top-10 text-gray-400">
                <Calendar size={16} />
              </div>
              <Input
                id="startDate"
                {...form.register('startDate')}
                placeholder="e.g. Immediate, 1 Month notice, From Sep 1st"
                className="h-14 border-gray-200 dark:border-gray-700 rounded-2xl pl-12 pr-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-bold text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
              />
            </div>
          </div>
          
          <div className="relative group">
            <label className="absolute -top-2.5 left-5 bg-white dark:bg-gray-800 px-2 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] z-10">Additional Instructions</label>
            <div className="absolute left-5 top-8 text-gray-300">
              <MessageSquare size={16} />
            </div>
            <Textarea
              id="instructions"
              {...form.register('instructions')}
              rows={4}
              placeholder="Any specific requirements or notes for the recruiter..."
              className="border-2 border-gray-50 dark:border-gray-700 rounded-[1.5rem] pl-12 pr-6 py-5 bg-gray-50/5 dark:bg-gray-900/5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm scrollbar-hide"
            />
          </div>
          
          <div className="flex gap-4 justify-end pt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-2xl px-8 h-14 font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gray-900 dark:bg-blue-600 text-white hover:bg-black dark:hover:bg-blue-700 rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-gray-200 dark:shadow-none transition-all hover:scale-[1.02]"
              disabled={updatePreferences.isPending}
            >
              {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
