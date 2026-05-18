import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

const POLICY_LAST_UPDATED = "May 10, 2026";

export type ConsentAcceptanceStatus = {
  userType: "candidate" | "employee" | "client";
  platformConsentAt: string | null;
  employeeAgreementAt: string | null;
  clientAgreementAt: string | null;
};

function formatAcceptedDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function primaryAcceptedAt(data: ConsentAcceptanceStatus | undefined): string | null {
  if (!data) return null;
  if (data.userType === "candidate") return data.platformConsentAt;
  if (data.userType === "client") return data.clientAgreementAt;
  return data.employeeAgreementAt;
}

type LegalPoliciesSettingsCardProps = {
  queryEnabled?: boolean;
  /** Candidate settings tab uses the dashboard style; profile modal passes slate card classes. */
  variant?: "dashboard" | "modal";
  className?: string;
};

export function LegalPoliciesSettingsCard({
  queryEnabled = true,
  variant = "dashboard",
  className,
}: LegalPoliciesSettingsCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/consent/acceptance-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/consent/acceptance-status");
      if (!res.ok) {
        throw new Error("Failed to load consent status");
      }
      return (await res.json()) as ConsentAcceptanceStatus;
    },
    enabled: queryEnabled,
  });

  const userType = data?.userType;
  const showClientAgreement = userType === "client";
  const showEmployeeAgreement = userType === "employee";
  const acceptedLabel = formatAcceptedDate(primaryAcceptedAt(data));

  const rowClass =
    variant === "modal"
      ? "flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
      : "flex items-center justify-between gap-4 border-b border-gray-50 py-4 last:border-0 dark:border-gray-700";

  const linkClass =
    variant === "modal"
      ? "text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
      : "text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline";

  const titleClass = variant === "modal" ? "text-sm font-semibold text-slate-900" : "text-sm font-bold text-gray-900 dark:text-white";

  const cardClass =
    variant === "modal"
      ? "border-slate-200 bg-white shadow-none"
      : "border-none shadow-sm bg-white dark:bg-gray-800 rounded-[2rem]";

  return (
    <Card className={cn(cardClass, "overflow-hidden", className)}>
      <CardHeader
        className={cn(
          "flex flex-row items-center gap-4 pb-6",
          variant === "modal" ? "border-b border-slate-200" : "border-b border-gray-50 dark:border-gray-700",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            variant === "modal" ? "bg-slate-50" : "bg-gray-50 dark:bg-gray-700",
          )}
        >
          <Scale className={cn("h-5 w-5", variant === "modal" ? "text-slate-700" : "text-indigo-600")} />
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className={cn("tracking-tight", variant === "modal" ? "text-lg font-semibold" : "text-xl font-bold")}>
            Legal / Policies
          </CardTitle>
          <CardDescription
            className={cn(
              "font-medium uppercase tracking-wider",
              variant === "modal" ? "text-[11px] text-slate-500" : "text-xs text-gray-400",
            )}
          >
            Last Updated: {POLICY_LAST_UPDATED}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className={variant === "modal" ? "p-5 pt-2" : "p-0"}>
        <div className={variant === "modal" ? "" : "px-6"}>
          <div className={rowClass}>
            <span className={titleClass}>Privacy Policy</span>
            <Link href="/privacy-policy" className={linkClass}>
              View
            </Link>
          </div>
          <div className={rowClass}>
            <span className={titleClass}>Terms of Use</span>
            <Link href="/terms-of-use" className={linkClass}>
              View
            </Link>
          </div>
          {!isLoading && showClientAgreement ? (
            <div className={rowClass}>
              <span className={titleClass}>Client Agreement</span>
              <Link href="/client-access-agreement" className={linkClass}>
                View
              </Link>
            </div>
          ) : null}
          {!isLoading && showEmployeeAgreement ? (
            <div className={rowClass}>
              <span className={titleClass}>Employee Agreement</span>
              <Link href="/employee-agreement" className={linkClass}>
                View
              </Link>
            </div>
          ) : null}
        </div>
        {acceptedLabel ? (
          <p
            className={cn(
              "mt-4 text-xs font-medium text-gray-500 dark:text-gray-400",
              variant === "modal" ? "px-5 pb-1" : "px-6 pb-6",
            )}
          >
            You have accepted these policies. Accepted on: {acceptedLabel}.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
