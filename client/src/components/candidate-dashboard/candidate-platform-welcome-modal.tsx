import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CandidatePlatformWelcomeModalProps = {
  open: boolean;
  onAccept: () => void | Promise<void>;
};

/**
 * One-time first-dashboard visit: Privacy Policy and Terms of Use (two checkboxes).
 * Logged as platform_consent; server sets platformConsentAccepted so this does not show again.
 */
export default function CandidatePlatformWelcomeModal({
  open,
  onAccept,
}: CandidatePlatformWelcomeModalProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bothAccepted = privacyAccepted && termsAccepted;

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
      setPrivacyAccepted(false);
      setTermsAccepted(false);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleContinue = async () => {
    if (!bothAccepted) return;
    setIsSubmitting(true);
    try {
      await Promise.resolve(onAccept());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-policies-agreement-title"
    >
      <div className="flex max-h-[min(90vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="candidate-policies-agreement-title"
            className="text-center text-lg font-semibold text-gray-900 sm:text-xl"
          >
            Privacy Policy and Terms of Use
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Before you use the candidate dashboard, confirm each item below. This happens once per account.
          </p>
        </div>

        <div className="shrink-0 space-y-4 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="candidate-first-time-privacy"
                checked={privacyAccepted}
                onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="candidate-first-time-privacy"
                className="cursor-pointer text-left text-sm font-normal leading-snug text-gray-800"
              >
                I have read and agree to the{" "}
                <Link href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="candidate-first-time-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="candidate-first-time-terms"
                className="cursor-pointer text-left text-sm font-normal leading-snug text-gray-800"
              >
                I have read and agree to the{" "}
                <Link href="/terms-of-use" className="text-blue-600 underline hover:text-blue-800">
                  Terms of Use
                </Link>
                .
              </Label>
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={!bothAccepted || isSubmitting}
            onClick={handleContinue}
          >
            {isSubmitting ? "Saving…" : "Agree and continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
