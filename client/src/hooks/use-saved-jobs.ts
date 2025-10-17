import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SavedJob, InsertSavedJob } from "@shared/schema";

export function useSavedJobs() {
  return useQuery<SavedJob[]>({
    queryKey: ["/api/saved-jobs"],
  });
}

export function useSaveJob() {
  return useMutation({
    mutationFn: async (jobData: Omit<InsertSavedJob, "profileId" | "savedDate">) => {
      const response = await apiRequest("POST", "/api/saved-jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
  });
}

export function useRemoveSavedJob() {
  return useMutation({
    mutationFn: async ({ jobTitle, company }: { jobTitle: string; company: string }) => {
      const response = await apiRequest("DELETE", "/api/saved-jobs", { jobTitle, company });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
  });
}