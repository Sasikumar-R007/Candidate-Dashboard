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
      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        body: JSON.stringify(jobData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to save job");
      }
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
      const response = await fetch("/api/saved-jobs", {
        method: "DELETE",
        body: JSON.stringify({ jobTitle, company }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to remove saved job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
    },
  });
}