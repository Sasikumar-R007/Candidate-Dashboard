import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

type SharedProfilesPayload = {
  requirement: { id: string; position: string | null; company: string | null };
  profiles: Array<{
    application: Record<string, unknown>;
    candidate: Record<string, unknown> | null;
    profile: Record<string, unknown> | null;
    skillsRows: Array<{ name: string; category: string }>;
  }>;
};

function formatDate(value: unknown): string {
  if (value == null || value === "") return "—";
  try {
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return String(value);
    return format(d, "dd-MM-yyyy");
  } catch {
    return String(value);
  }
}

function DetailBlock({
  title,
  entries,
}: {
  title: string;
  entries: { label: string; value: unknown }[];
}) {
  const rows = entries.filter((e) => e.value != null && String(e.value).trim() !== "");
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-gray-500 text-xs uppercase tracking-wide">{label}</dt>
            <dd className="text-gray-900 break-words">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ClientSharedProfilesModal({
  open,
  onOpenChange,
  requirementId,
  roleTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: string | null;
  roleTitle?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/client/requirements", requirementId, "shared-profiles"],
    enabled: open && !!requirementId,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/client/requirements/${encodeURIComponent(requirementId!)}/shared-profiles`,
      );
      return res.json() as Promise<SharedProfilesPayload>;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden sm:max-w-2xl sm:w-full md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Shared profiles</DialogTitle>
          <DialogDescription>
            {roleTitle || data?.requirement?.position || "Requirement"} — candidates submitted for
            this role ({data?.profiles?.length ?? 0})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading profiles…
            </div>
          )}
          {isError && (
            <p className="text-sm text-red-600 py-6">Could not load shared profiles. Try again.</p>
          )}
          {!isLoading && !isError && data?.profiles?.length === 0 && (
            <p className="text-sm text-gray-600 py-6">No submitted profiles for this requirement yet.</p>
          )}
          {!isLoading &&
            !isError &&
            data?.profiles?.map((row, idx) => {
              const app = row.application;
              const cand = row.candidate;
              const prof = row.profile;
              const name =
                (cand?.fullName as string) ||
                (prof
                  ? `${String(prof.firstName || "")} ${String(prof.lastName || "")}`.trim()
                  : null) ||
                (app.candidateName as string) ||
                "Candidate";

              return (
                <div
                  key={String(app.id ?? idx)}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{name}</h3>
                      <p className="text-xs text-gray-500">
                        Application ID: {String(app.id)} · Submitted {formatDate(app.appliedDate)}
                      </p>
                    </div>
                    <Badge variant="secondary">{String(app.status ?? "—")}</Badge>
                  </div>

                  <div className="space-y-3">
                    <DetailBlock
                      title="Application"
                      entries={[
                        { label: "Role / title", value: app.jobTitle },
                        { label: "Company", value: app.company },
                        { label: "Status", value: app.status },
                        { label: "Source", value: app.source },
                        { label: "Work mode", value: app.workMode },
                        { label: "Location", value: app.location },
                        { label: "Experience", value: app.experience },
                        { label: "Salary", value: app.salary },
                        { label: "Job type", value: app.jobType },
                        { label: "Description", value: app.description },
                        { label: "Skills (application)", value: app.skills },
                        { label: "Email (shared)", value: app.candidateEmail },
                        { label: "Phone (shared)", value: app.candidatePhone },
                        { label: "Status note", value: app.statusNote },
                        { label: "Rejection reason", value: app.rejectionReason },
                      ]}
                    />

                    {cand && (
                      <DetailBlock
                        title="Candidate record"
                        entries={[
                          { label: "Candidate ID", value: cand.candidateId },
                          { label: "Email", value: cand.email },
                          { label: "Phone", value: cand.phone },
                          { label: "Current company", value: cand.company },
                          { label: "Designation", value: cand.designation },
                          { label: "Location", value: cand.location },
                          { label: "Experience", value: cand.experience },
                          { label: "Skills", value: cand.skills },
                          { label: "Education", value: cand.education },
                          { label: "Current role", value: cand.currentRole },
                          { label: "LinkedIn", value: cand.linkedinUrl },
                          { label: "Portfolio", value: cand.portfolioUrl },
                          { label: "Website", value: cand.websiteUrl },
                        ]}
                      />
                    )}

                    {prof && (
                      <DetailBlock
                        title="Profile (StaffOS)"
                        entries={[
                          { label: "Title", value: prof.title },
                          { label: "Email", value: prof.email },
                          { label: "Phone", value: prof.phone },
                          { label: "Mobile", value: prof.mobile },
                          { label: "Location", value: prof.location },
                          { label: "Current location", value: prof.currentLocation },
                          { label: "Preferred location", value: prof.preferredLocation },
                          { label: "Education", value: prof.education },
                          { label: "Highest qualification", value: prof.highestQualification },
                          { label: "College", value: prof.collegeName },
                          { label: "Total experience", value: prof.totalExperience },
                          { label: "Current company", value: prof.currentCompany },
                          { label: "Current role", value: prof.currentRole },
                          { label: "Notice period", value: prof.noticePeriod },
                          { label: "Salary range", value: prof.salaryRange },
                          { label: "Profile skills", value: prof.skills },
                          { label: "LinkedIn", value: prof.linkedinUrl },
                        ]}
                      />
                    )}

                    {row.skillsRows?.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills breakdown</h4>
                        <ul className="flex flex-wrap gap-2">
                          {row.skillsRows.map((s) => (
                            <li key={`${s.name}-${s.category}`}>
                              <Badge variant="outline" className="text-xs font-normal">
                                {s.name}
                                <span className="text-gray-400 ml-1">({s.category})</span>
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(cand?.resumeFile || prof?.resumeFile) && (
                      <div className="flex flex-wrap gap-3 items-center text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a
                          href={String(cand?.resumeFile || prof?.resumeFile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Open resume <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
