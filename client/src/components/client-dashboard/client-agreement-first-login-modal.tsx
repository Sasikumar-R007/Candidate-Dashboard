import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ClientAgreementFirstLoginModalProps = {
  open: boolean;
  onAccept: () => void | Promise<void>;
};

/**
 * One-time gate for client portal users: Privacy Policy, Terms of Use, Client Access Agreement.
 * Logged as client_agreement; must match session employee id.
 */
export default function ClientAgreementFirstLoginModal({
  open,
  onAccept,
}: ClientAgreementFirstLoginModalProps) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [accessAccepted, setAccessAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAccepted = privacyAccepted && termsAccepted && accessAccepted;

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
      setAccessAccepted(false);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleAccept = async () => {
    if (!allAccepted) return;
    setIsSubmitting(true);
    try {
      await Promise.resolve(onAccept());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-welcome-agreements-title"
    >
      <div className="flex max-h-[min(90vh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="client-welcome-agreements-title"
            className="text-center text-lg font-semibold text-gray-900 sm:text-xl"
          >
            Privacy Policy, Terms of Use and Client Access Agreement
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Before you use the client workspace, confirm each item below. This is required once per account and is
            recorded for compliance.
          </p>
        </div>

        <div className="shrink-0 space-y-4 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="client-welcome-privacy"
                checked={privacyAccepted}
                onCheckedChange={(v) => setPrivacyAccepted(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="client-welcome-privacy" className="cursor-pointer text-sm leading-snug text-gray-800">
                I have read and agree to the{" "}
                <Link href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="client-welcome-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="client-welcome-terms" className="cursor-pointer text-sm leading-snug text-gray-800">
                I have read and agree to the{" "}
                <Link href="/terms-of-use" className="text-blue-600 underline hover:text-blue-800">
                  Terms of Use
                </Link>
                .
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="client-welcome-access"
                checked={accessAccepted}
                onCheckedChange={(v) => setAccessAccepted(v === true)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-none border-2 border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="client-welcome-access" className="cursor-pointer text-sm leading-snug text-gray-800">
                I have read and agree to the{" "}
                <Link href="/client-access-agreement" className="text-blue-600 underline hover:text-blue-800">
                  Client Access Agreement
                </Link>
                .
              </Label>
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={!allAccepted || isSubmitting}
            onClick={handleAccept}
          >
            {isSubmitting ? "Saving…" : "Agree and continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
