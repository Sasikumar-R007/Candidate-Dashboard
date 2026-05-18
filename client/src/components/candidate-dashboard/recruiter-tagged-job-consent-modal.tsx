import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { logConsent } from "@/lib/consent-log";

export type TaggedApplicationSummary = {
  id: string;
  jobTitle?: string | null;
  company?: string | null;
};

type RecruiterTaggedJobConsentModalProps = {
  open: boolean;
  candidateProfileId?: string;
  application: TaggedApplicationSummary | null;
  onConfirmed: () => void;
};

export default function RecruiterTaggedJobConsentModal({
  open,
  candidateProfileId,
  application,
  onConfirmed,
}: RecruiterTaggedJobConsentModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  const {
    mutate: confirmApplication,
    reset: resetConfirmMutation,
    isPending: isConfirmPending,
    isError: isConfirmError,
    error: confirmError,
  } = useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await apiRequest("POST", `/api/candidate/applications/${applicationId}/confirm`, {});
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      try {
        const userId =
          (typeof candidateProfileId === "string" && candidateProfileId.length > 0
            ? candidateProfileId
            : null) ||
          (() => {
            try {
              const rawAuth = sessionStorage.getItem("auth_user");
              const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
              return typeof parsedAuth?.data?.id === "string" ? parsedAuth.data.id : null;
            } catch {
              return null;
            }
          })();
        if (userId) {
          void logConsent({
            user_id: userId,
            role: "candidate",
            consent_type: "job_consent",
            policy_version: "2026-05-10",
          });
        }
      } catch (error) {
        console.warn("Unable to resolve candidate for consent logging:", error);
      }
      onConfirmed();
    },
    onError: () => {
      setShowConsentError(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setShowConsentError(false);
      resetConfirmMutation();
    }
  }, [open, application?.id, resetConfirmMutation]);

  if (!open || !application) return null;

  const roleLabel = (application.jobTitle || "").trim() || "this role";
  const companyLabel = (application.company || "").trim() || "the hiring company";

  const handleProceed = () => {
    if (!confirmed) {
      setShowConsentError(true);
      return;
    }
    setShowConsentError(false);
    confirmApplication(application.id);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tagged-job-consent-title"
    >
      <div className="flex max-h-[min(90vh,800px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="tagged-job-consent-title"
            className="text-center text-lg font-semibold text-gray-900 sm:text-xl"
          >
            You have been shortlisted
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-5 py-4 sm:px-6 sm:py-5">
          <p className="mb-4 text-sm leading-relaxed text-gray-800 sm:text-[15px]">
            You have been shortlisted for the position of{" "}
            <span className="font-semibold text-gray-900">{roleLabel}</span> at{" "}
            <span className="font-semibold text-gray-900">{companyLabel}</span>.
          </p>
          <p className="text-sm leading-relaxed text-gray-700 sm:text-[15px]">
            Please confirm your interest to proceed with your application.
          </p>
        </div>

        <div className="shrink-0 space-y-4 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="tagged-job-consent-checkbox"
              checked={confirmed}
              onCheckedChange={(v) => {
                setConfirmed(v === true);
                if (v === true) setShowConsentError(false);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              aria-invalid={showConsentError}
              aria-describedby={showConsentError ? "tagged-consent-error" : undefined}
            />
            <Label
              htmlFor="tagged-job-consent-checkbox"
              className="cursor-pointer text-left text-sm font-normal leading-snug text-gray-800"
            >
              I confirm my interest in this opportunity and consent to sharing my profile, resume, and
              application details with this hiring company in accordance with the{" "}
              <Link href="/privacy-policy" className="font-medium text-blue-600 underline hover:text-blue-800">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-use" className="font-medium text-blue-600 underline hover:text-blue-800">
                Terms of Use
              </Link>
              .
            </Label>
          </div>

          {showConsentError ? (
            <p id="tagged-consent-error" className="text-sm font-medium text-red-600" role="alert">
              You must confirm your consent to proceed
            </p>
          ) : null}

          {isConfirmError ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {(confirmError as Error)?.message || "Failed to confirm. Please try again."}
            </p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={isConfirmPending}
            onClick={handleProceed}
          >
            {isConfirmPending ? "Confirming…" : "Confirm & Proceed"}
          </Button>
        </div>
      </div>
    </div>
  );
}
