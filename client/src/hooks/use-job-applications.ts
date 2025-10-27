import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { JobApplication } from "@shared/schema";

interface ApplyJobData {
  jobTitle: string;
  company: string;
  jobType?: string;
  status?: string;
  description?: string;
  salary?: string;
  location?: string;
  workMode?: string;
  experience?: string;
  skills?: string[];
  logo?: string;
}

export function useJobApplications() {
  return useQuery<JobApplication[]>({
    queryKey: ["/api/job-applications"],
  });
}

export function useApplyJob() {
  return useMutation({
    mutationFn: async (jobData: ApplyJobData) => {
      const response = await apiRequest("POST", "/api/job-applications", jobData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to apply for job' }));
        throw new Error(errorData.message || 'Failed to apply for job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
    },
  });
}
