import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ExternalLink, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  parseRequirementJdExtras,
  resolveRequirementDisplayId,
  resolveDisplayRoleId,
  type RequirementJdExtras,
} from "@shared/requirement-jd-extras";
import { CompanyBrandAvatar } from "@/components/client-brand-avatar";
import {
  CANDIDATE_DESKTOP_DIALOG_CLASSES,
  CANDIDATE_MOBILE_DIALOG_CLASSES,
} from "@/lib/candidate-ui-preferences";
import { cn } from "@/lib/utils";
import { resolveJdFileUrl as resolveStoredJdFileUrl, resolveJdPreviewUrl } from "@/lib/resolve-upload-url";
import { apiRequest } from "@/lib/queryClient";

function isPersistedJdReference(jdFile?: string | null): boolean {
  if (!jdFile?.trim()) return false;
  const trimmed = jdFile.trim();
  return !trimmed.startsWith("blob:") && !trimmed.startsWith("data:");
}

type JdViewPayload = {
  jdFile?: string | null;
  jdText?: string | null;
  primarySkills?: string | null;
  secondarySkills?: string | null;
  knowledgeOnly?: string | null;
  specialInstructions?: string | null;
  companyLogo?: string | null;
};

function isPdfJd(jdFile?: string | null, jdFileUrl?: string | null): boolean {
  const probe = `${jdFile || ""} ${jdFileUrl || ""}`.toLowerCase();
  return /\.pdf(\?|#|$)/.test(probe);
}

function isDocxJd(jdFile?: string | null, jdFileUrl?: string | null): boolean {
  const probe = `${jdFile || ""} ${jdFileUrl || ""}`.toLowerCase();
  return /\.docx(\?|#|$)/.test(probe);
}

function isLegacyDocJd(jdFile?: string | null, jdFileUrl?: string | null): boolean {
  const probe = `${jdFile || ""} ${jdFileUrl || ""}`.toLowerCase();
  return /\.doc(\?|#|$)/.test(probe) && !/\.docx(\?|#|$)/.test(probe);
}

export type JobDescriptionDetailsData = {
  id?: string;
  displayRequirementId?: string | null;
  companyLogo?: string | null;
  clientId?: string;
  position?: string;
  company?: string;
  spoc?: string;
  spocName?: string;
  status?: string;
  criticality?: string;
  toughness?: string;
  talentAdvisor?: string;
  teamLead?: string;
  jdFile?: string | null;
  jdText?: string | null;
  sourceDetails?: string | null;
  sourceType?: string | null;
  primarySkills?: string | null;
  secondarySkills?: string | null;
  knowledgeOnly?: string | null;
  specialInstructions?: string | null;
};

type JobDescriptionDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: JobDescriptionDetailsData | null;
  subtitle?: string;
  /** Admin JD list includes client / role ids */
  variant?: "admin" | "delivery";
};

function resolveJdFileUrl(jdFile?: string | null): string | null {
  if (!jdFile?.trim()) return null;
  const trimmed = jdFile.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return null;
  return resolveStoredJdFileUrl(jdFile);
}

function splitSkillTokens(value?: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;|•\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function SkillPills({ items, tone }: { items: string[]; tone: "blue" | "violet" | "amber" }) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900"
      : tone === "violet"
        ? "bg-violet-50 text-violet-800 border-violet-100 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900"
        : "bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-snug",
            toneClass,
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function JdSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "indigo" | "emerald" | "amber" | "rose";
  children: ReactNode;
}) {
  const accentBar =
    accent === "indigo"
      ? "bg-indigo-500"
      : accent === "emerald"
        ? "bg-emerald-500"
        : accent === "amber"
          ? "bg-amber-500"
          : "bg-rose-500";

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={cn("h-5 w-1 rounded-full", accentBar)} aria-hidden />
        <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function JdSkillsAndInstructions({ extras }: { extras: RequirementJdExtras }) {
  const primary = splitSkillTokens(extras.primarySkills);
  const secondary = splitSkillTokens(extras.secondarySkills);
  const knowledge = splitSkillTokens(extras.knowledgeOnly);
  const hasSkills = primary.length > 0 || secondary.length > 0 || knowledge.length > 0;
  const hasInstructions = Boolean(extras.specialInstructions?.trim());

  if (!hasSkills && !hasInstructions) return null;

  return (
    <div className="space-y-4">
      {primary.length > 0 && (
        <JdSection title="Primary skills" accent="indigo">
          <SkillPills items={primary} tone="blue" />
        </JdSection>
      )}
      {secondary.length > 0 && (
        <JdSection title="Secondary skills" accent="emerald">
          <SkillPills items={secondary} tone="violet" />
        </JdSection>
      )}
      {knowledge.length > 0 && (
        <JdSection title="Knowledge areas" accent="amber">
          <SkillPills items={knowledge} tone="amber" />
        </JdSection>
      )}
      {hasInstructions && (
        <JdSection title="Special instructions" accent="rose">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {extras.specialInstructions}
          </p>
        </JdSection>
      )}
    </div>
  );
}

function JdDocumentPanel({
  jdFile,
  jdText,
  extras,
  variant,
  loading,
}: {
  jdFile?: string | null;
  jdText?: string | null;
  extras: RequirementJdExtras;
  variant: "admin" | "delivery";
  loading?: boolean;
}) {
  const jdFileUrl = useMemo(() => resolveJdFileUrl(jdFile), [jdFile]);
  const jdPreviewUrl = useMemo(() => resolveJdPreviewUrl(jdFile), [jdFile]);
  const isPdf = isPdfJd(jdFile, jdFileUrl);
  const isDocx = isDocxJd(jdFile, jdFileUrl);
  const isLegacyDoc = isLegacyDocJd(jdFile, jdFileUrl);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [docxPreviewLoading, setDocxPreviewLoading] = useState(false);
  const [docxPreviewError, setDocxPreviewError] = useState(false);

  useEffect(() => {
    if (!jdPreviewUrl) {
      setDocxHtml(null);
      setDocxPreviewLoading(false);
      setDocxPreviewError(false);
      return;
    }

    let cancelled = false;
    setDocxPreviewLoading(true);
    setDocxPreviewError(false);
    setDocxHtml(null);

    fetch(jdPreviewUrl, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { html?: string } | null) => {
        if (cancelled) return;
        if (payload?.html?.trim()) {
          setDocxHtml(payload.html);
          setDocxPreviewError(false);
        } else {
          setDocxPreviewError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDocxPreviewError(true);
      })
      .finally(() => {
        if (!cancelled) setDocxPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jdPreviewUrl]);

  const fileName = jdFile?.split("/").pop() || "document";
  const hasSkillsOrInstructions = Boolean(
    extras.primarySkills?.trim() ||
      extras.secondarySkills?.trim() ||
      extras.knowledgeOnly?.trim() ||
      extras.specialInstructions?.trim(),
  );

  const panelClass =
    variant === "delivery"
      ? "rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 p-4 dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-5"
      : "rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800";

  return (
    <div className={cn(panelClass, "max-h-[62vh] overflow-y-auto")}>
      <div className="mb-5 flex items-start gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            Job description
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Role details, document preview, and required skills
          </p>
        </div>
      </div>

      {loading && (
        <p className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800">
          Loading job description…
        </p>
      )}

      {!loading && jdFileUrl && isPdf && (
        <div className="mb-4">
          <JdSection title="Document preview" accent="indigo">
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600">
              <iframe
                src={`${jdFileUrl}#view=FitH`}
                className="h-[min(520px,50vh)] w-full bg-white"
                title="JD PDF Preview"
              />
            </div>
          </JdSection>
        </div>
      )}

      {!loading && jdFileUrl && isDocx && (
        <div className="mb-4">
          <JdSection title="Document preview" accent="indigo">
            {docxPreviewLoading && (
              <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800">
                Loading document preview…
              </p>
            )}
            {!docxPreviewLoading && docxHtml && (
              <div
                className="max-h-[min(520px,50vh)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: docxHtml }}
              />
            )}
            {!docxPreviewLoading && !docxHtml && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-600 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {docxPreviewError
                      ? "Preview could not be loaded. Open the file to view it."
                      : "No preview available."}
                  </p>
                </div>
                <a
                  href={jdFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open document
                </a>
              </div>
            )}
          </JdSection>
        </div>
      )}

      {!loading && jdFileUrl && isLegacyDoc && (
        <div className="mb-4">
          <JdSection title="Document preview" accent="indigo">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-600 dark:bg-slate-800/60">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{fileName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Legacy Word (.doc) files cannot be previewed here. Open the file to view it.
                </p>
              </div>
              <a
                href={jdFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open document
              </a>
            </div>
          </JdSection>
        </div>
      )}

      {!loading && jdFileUrl && !isPdf && !isDocx && !isLegacyDoc && (
        <div className="mb-4">
          <JdSection title="Attached document" accent="indigo">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{fileName}</p>
                <p className="mt-1 text-xs text-slate-500">This file type cannot be previewed inline.</p>
              </div>
              <a
                href={jdFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open document
              </a>
            </div>
          </JdSection>
        </div>
      )}

      {!loading && !jdFileUrl && jdFile?.trim() && isPersistedJdReference(jdFile) && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm leading-relaxed text-amber-900">
          The job description document could not be loaded for preview. Use the text below if available.
        </p>
      )}

      {!loading && !jdFileUrl && !jdText?.trim() && !hasSkillsOrInstructions && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50">
          No job description has been uploaded for this role yet.
        </p>
      )}

      {jdText?.trim() && (
        <div className="mb-4">
          <JdSection title="Role overview" accent="emerald">
            <div className="max-h-80 overflow-y-auto rounded-lg bg-slate-50/90 p-4 dark:bg-slate-800/60">
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                {jdText}
              </div>
            </div>
          </JdSection>
        </div>
      )}

      <JdSkillsAndInstructions extras={extras} />

      {variant === "delivery" && hasSkillsOrInstructions && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Review skills and instructions before your interview or next step.</span>
        </div>
      )}
    </div>
  );
}

export default function JobDescriptionDetailsModal({
  open,
  onOpenChange,
  data,
  subtitle = "Review all JD information for this requirement.",
  variant = "delivery",
}: JobDescriptionDetailsModalProps) {
  const [jdView, setJdView] = useState<JdViewPayload | null>(null);
  const [jdLoading, setJdLoading] = useState(false);

  useEffect(() => {
    if (!open || !data?.id) {
      setJdView(null);
      setJdLoading(false);
      return;
    }

    const lookupId = data.id.replace(/^recent-closed-/, "");
    let cancelled = false;
    setJdLoading(true);
    setJdView(null);

    apiRequest("GET", `/api/requirements/${encodeURIComponent(lookupId)}/jd-view`)
      .then((res) => res.json())
      .then((payload: JdViewPayload | null) => {
        if (!cancelled) setJdView(payload);
      })
      .catch(() => {
        if (!cancelled) setJdView(null);
      })
      .finally(() => {
        if (!cancelled) setJdLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, data?.id]);

  if (!data) return null;

  const displayJdFile = (() => {
    const fromView = jdView?.jdFile;
    if (fromView && isPersistedJdReference(fromView)) return fromView;
    if (data.jdFile && isPersistedJdReference(data.jdFile)) return data.jdFile;
    return null;
  })();
  const displayJdText = jdView?.jdText ?? data.jdText ?? null;
  const jdExtras = parseRequirementJdExtras({
    ...data,
    primarySkills: jdView?.primarySkills ?? data.primarySkills,
    secondarySkills: jdView?.secondarySkills ?? data.secondarySkills,
    knowledgeOnly: jdView?.knowledgeOnly ?? data.knowledgeOnly,
    specialInstructions: jdView?.specialInstructions ?? data.specialInstructions,
  });
  const hasDocumentSection = Boolean(
    displayJdFile?.trim() ||
      displayJdText?.trim() ||
      jdExtras.primarySkills?.trim() ||
      jdExtras.secondarySkills?.trim() ||
      jdExtras.knowledgeOnly?.trim() ||
      jdExtras.specialInstructions?.trim() ||
      jdLoading,
  );
  const displayRoleId = resolveDisplayRoleId(data);
  const displayRequirementId = resolveRequirementDisplayId(
    data,
    data.displayRequirementId ?? undefined,
  );
  const spocLabel = data.spocName || data.spoc || "N/A";
  const displayCompanyLogo = jdView?.companyLogo ?? data.companyLogo ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col overflow-hidden bg-white p-0 dark:bg-slate-900",
          CANDIDATE_MOBILE_DIALOG_CLASSES,
          CANDIDATE_DESKTOP_DIALOG_CLASSES,
          "max-lg:max-h-[min(92dvh,900px)] max-lg:w-[calc(100vw-1rem)] max-lg:max-w-[calc(100vw-1rem)]",
          "lg:max-h-[92vh] lg:max-w-6xl",
        )}
      >
        <DialogHeader className="shrink-0 border-b bg-slate-50/80 px-4 pb-3 pt-4 dark:bg-slate-900/80 sm:px-6 sm:pb-4 sm:pt-5">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
            Job Description Details
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-5 shadow-sm dark:border-cyan-900 dark:from-cyan-950/30 dark:to-blue-950/30">
                <div className="flex items-center gap-3">
                  <CompanyBrandAvatar
                    logoUrl={displayCompanyLogo}
                    companyName={data.company}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {data.company || "Company Name"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Job Description Details</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {variant === "admin" && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Client ID
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {data.clientId || "N/A"}
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Requirement ID
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{displayRequirementId}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Role ID
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{displayRoleId}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Position
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                    {data.position || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    SPOC Name
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{spocLabel}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Company
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                    {data.company || "N/A"}
                  </p>
                </div>
                {variant === "admin" ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {data.status || "N/A"}
                    </p>
                  </div>
                ) : (
                  <>
                    {(data.criticality || data.toughness) && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Criticality
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                          {data.criticality}
                          {data.toughness ? `-${data.toughness}` : ""}
                        </p>
                      </div>
                    )}
                    {data.talentAdvisor && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Talent Advisor
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                          {data.talentAdvisor}
                        </p>
                      </div>
                    )}
                    {data.teamLead && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Team Lead
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{data.teamLead}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {hasDocumentSection ? (
              <JdDocumentPanel
                jdFile={displayJdFile}
                jdText={displayJdText}
                extras={jdExtras}
                variant={variant}
                loading={jdLoading}
              />
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-800/50">
                <p className="text-center text-sm text-slate-600">
                  No job description document or text has been uploaded for this requirement yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t bg-gray-50 px-4 py-3 dark:bg-gray-800/50 sm:px-6 sm:py-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-[6px] bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
