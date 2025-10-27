import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { JobApplication, InsertJobApplication } from "@shared/schema";

export function useJobApplications() {
  return useQuery<JobApplication[]>({
    queryKey: ["/api/job-applications"],
  });
}

export function useApplyJob() {
  return useMutation({
    mutationFn: async (jobData: InsertJobApplication) => {
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
