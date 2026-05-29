import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  parseRequirementJdExtras,
  resolveDisplayRoleId,
  type RequirementJdExtras,
} from "@shared/requirement-jd-extras";
import { CompanyBrandAvatar } from "@/components/client-brand-avatar";

export type JobDescriptionDetailsData = {
  id?: string;
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
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${window.location.origin}${trimmed}`;
  }
  return `${window.location.origin}/${trimmed.replace(/^\//, "")}`;
}

function JdSkillsAndInstructions({ extras }: { extras: RequirementJdExtras }) {
  const hasSkills = Boolean(
    extras.primarySkills?.trim() ||
      extras.secondarySkills?.trim() ||
      extras.knowledgeOnly?.trim(),
  );
  const hasInstructions = Boolean(extras.specialInstructions?.trim());

  if (!hasSkills && !hasInstructions) return null;

  return (
    <div className="mt-6 space-y-5 border-t border-gray-200 pt-5 dark:border-gray-600">
      {hasSkills && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Skills</label>
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            {extras.primarySkills?.trim() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Primary Skills
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{extras.primarySkills}</p>
              </div>
            )}
            {extras.secondarySkills?.trim() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Secondary Skills
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{extras.secondarySkills}</p>
              </div>
            )}
            {extras.knowledgeOnly?.trim() && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Knowledge Only
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{extras.knowledgeOnly}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {hasInstructions && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Special Instructions
          </label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{extras.specialInstructions}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function JdDocumentPanel({
  jdFile,
  jdText,
  extras,
}: {
  jdFile?: string | null;
  jdText?: string | null;
  extras: RequirementJdExtras;
}) {
  const jdFileUrl = useMemo(() => resolveJdFileUrl(jdFile), [jdFile]);
  const isPdf = jdFileUrl?.toLowerCase().includes(".pdf");
  const [fileStatus, setFileStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!jdFileUrl) {
      setFileStatus("idle");
      setPreviewBlobUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setFileStatus("checking");
    setPreviewBlobUrl(null);

    fetch(jdFileUrl, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("JD file not found");
        if (!isPdf) {
          if (!cancelled) setFileStatus("available");
          return null;
        }
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setPreviewBlobUrl(objectUrl);
        }
        setFileStatus("available");
      })
      .catch(() => {
        if (!cancelled) setFileStatus("unavailable");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [jdFileUrl, isPdf]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const fileName = jdFile?.split("/").pop() || "document";
  const iframeSrc = previewBlobUrl || (isPdf ? null : jdFileUrl);
  const hasSkillsOrInstructions = Boolean(
    extras.primarySkills?.trim() ||
      extras.secondarySkills?.trim() ||
      extras.knowledgeOnly?.trim() ||
      extras.specialInstructions?.trim(),
  );

  return (
    <div className="overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 max-h-[62vh]">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Job Description Document</h3>

      {jdFileUrl && (
        <div className="mb-4">
          {fileStatus === "checking" && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              Checking document availability…
            </p>
          )}

          {fileStatus === "available" && isPdf && iframeSrc && (
            <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
              <iframe src={iframeSrc} className="h-[min(600px,55vh)] w-full" title="JD PDF Preview" />
            </div>
          )}

          {fileStatus === "available" && !isPdf && jdFileUrl && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">Document File</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>
                </div>
                <a
                  href={jdFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Document
                </a>
              </div>
            </div>
          )}

          {fileStatus === "unavailable" && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
              The job description file is not available or could not be loaded. Please contact your administrator or use the JD text below if provided.
            </p>
          )}
        </div>
      )}

      {!jdFileUrl && !jdText?.trim() && !hasSkillsOrInstructions && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          No job description document or text has been uploaded for this requirement yet.
        </p>
      )}

      {jdText?.trim() && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            JD Text Content
          </label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
              {jdText}
            </pre>
          </div>
        </div>
      )}

      <JdSkillsAndInstructions extras={extras} />
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
  if (!data) return null;

  const spocLabel = data.spocName || data.spoc || "N/A";
  const jdExtras = parseRequirementJdExtras(data);
  const hasDocumentSection = Boolean(
    data.jdFile?.trim() ||
      data.jdText?.trim() ||
      jdExtras.primarySkills?.trim() ||
      jdExtras.secondarySkills?.trim() ||
      jdExtras.knowledgeOnly?.trim() ||
      jdExtras.specialInstructions?.trim(),
  );
  const displayRoleId = resolveDisplayRoleId(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden bg-white p-0 dark:bg-slate-900">
        <DialogHeader className="border-b bg-slate-50/80 px-6 pb-4 pt-5 dark:bg-slate-900/80">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            Job Description Details
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </DialogHeader>

        <div className="max-h-[calc(90vh-10rem)] px-6 py-4">
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-5 shadow-sm dark:border-cyan-900 dark:from-cyan-950/30 dark:to-blue-950/30">
                <div className="flex items-center gap-3">
                  <CompanyBrandAvatar
                    logoUrl={data.companyLogo}
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
                    {variant === "admin" ? "Role ID" : "Requirement ID"}
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
              <JdDocumentPanel jdFile={data.jdFile} jdText={data.jdText} extras={jdExtras} />
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-center text-sm text-slate-600">
                  No job description document or text has been uploaded for this requirement yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t bg-gray-50 px-6 py-4 dark:bg-gray-800/50">
          <Button onClick={() => onOpenChange(false)} className="bg-blue-600 px-6 text-white hover:bg-blue-700">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
