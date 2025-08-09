import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useProfile() {
  return useQuery({
    queryKey: ['/api/profile'],
    queryFn: api.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });
}

export function useJobPreferences() {
  return useQuery({
    queryKey: ['/api/job-preferences'],
    queryFn: api.getJobPreferences,
  });
}

export function useUpdateJobPreferences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.updateJobPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-preferences'] });
      toast({
        title: "Success",
        description: "Job preferences updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job preferences",
        variant: "destructive",
      });
    },
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ['/api/skills'],
    queryFn: api.getSkills,
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ['/api/activities'],
    queryFn: api.getActivities,
  });
}

export function useJobApplications() {
  return useQuery({
    queryKey: ['/api/job-applications'],
    queryFn: api.getJobApplications,
  });
}

export function useUploadBanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.uploadBanner,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Banner uploaded successfully",
      });
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    },
  });
}

export function useUploadProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.uploadProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });
}

export function useUploadResume() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: api.uploadResume,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    },
  });
}
