import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CandidateApplicationConsentModalProps = {
  open: boolean;
  jobTitle?: string | null;
  company?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

/**
 * Shown when a candidate applies for a job (job board, suggestions, etc.).
 * Separate from the one-time platform welcome; logs job_consent on confirm.
 */
export default function CandidateApplicationConsentModal({
  open,
  jobTitle,
  company,
  onConfirm,
  onCancel,
}: CandidateApplicationConsentModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(false);
    }
  }, [open, jobTitle, company]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      await Promise.resolve(onConfirm());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-application-consent-title"
    >
      <div className="flex max-h-[min(90vh,800px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="candidate-application-consent-title"
            className="text-center text-lg font-semibold text-gray-900 sm:text-xl"
          >
            Candidate Consent Text
          </h2>
          {jobTitle || company ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              {jobTitle ? <span className="font-medium text-gray-800">{jobTitle}</span> : null}
              {jobTitle && company ? <span> at </span> : null}
              {company ? <span className="font-medium text-gray-800">{company}</span> : null}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-5 py-4 sm:px-6 sm:py-5">
          <p className="mb-4 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
            By clicking &quot;Confirm Application&quot;, you agree that:
          </p>
          <ul className="mb-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
            <li>
              Your profile, resume, and application details may be processed and shared with relevant hiring
              companies for recruitment purposes.
            </li>
            <li>StaffOS and its recruitment partners may contact you regarding job opportunities.</li>
            <li>
              Your application status, interview updates, and hiring communication will be managed through StaffOS.
            </li>
            <li>Your information may be securely stored for current and future opportunities.</li>
            <li>You may request updates or withdraw consent at any time through your account.</li>
            <li>You confirm that the information provided is accurate to the best of your knowledge.</li>
          </ul>
        </div>

        <div className="shrink-0 space-y-4 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="candidate-application-consent-confirmed"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor="candidate-application-consent-confirmed"
              className="cursor-pointer text-left text-sm font-normal leading-snug text-gray-800"
            >
              I confirm that I have read and understood all of the above and agree to submit this application.
            </Label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                onClick={() => onCancel()}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type="button"
              className="w-full sm:min-w-[200px]"
              size="lg"
              disabled={!confirmed || isSubmitting}
              onClick={handleConfirm}
            >
              {isSubmitting ? "Submitting…" : "Confirm Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
