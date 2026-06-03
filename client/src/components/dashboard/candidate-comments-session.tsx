import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  IndianRupee,
  Info,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  SendHorizontal,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import {
  formatCommentDayKey,
  formatCommentTime,
  parseCommentTimestamp,
} from "@/lib/comment-timestamp";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { getPipelineStageBadgeClass } from "@/lib/pipeline-session-utils";

const BTN_RADIUS = "rounded-[6px]";

export const CLIENT_REJECTION_COMMENT_PREFIX = "Reason from Client for Rejection:";

export function isClientRejectionComment(body: string, authorRole?: string): boolean {
  const text = (body || "").trim();
  return (
    text.startsWith(CLIENT_REJECTION_COMMENT_PREFIX) ||
    (authorRole === "Client" && /^rejected by client:/i.test(text))
  );
}

/** Matches server `isTalentAdvisorRole` — TA accounts use role `recruiter` in DB. */
function isTalentAdvisorEmployeeRole(role: string | null | undefined): boolean {
  const normalized = (role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalized === "recruiter" || normalized === "talent_advisor" || normalized === "ta";
}

function parseSkillsList(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((s) => (typeof s === "string" || typeof s === "number" ? String(s).trim() : ""))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        // fall through
      }
    }
    return trimmed.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function uniqueSkillsList(raw: unknown): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const skill of parseSkillsList(raw)) {
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(skill);
  }
  return out;
}

export type CandidateCommentsSessionApplicant = {
  id: string;
  candidateName?: string;
  roleApplied?: string;
  jobTitle?: string;
  company?: string;
  currentStatus?: string;
  email?: string | null;
  phone?: string | null;
  location?: string;
  experience?: string;
  skills?: string[];
  resumeFile?: string | null;
  profilePicture?: string | null;
};

type SessionApplication = {
  id: string;
  candidateName?: string;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  jobTitle?: string;
  company?: string;
  status?: string;
  source?: string;
  appliedDate?: string;
  candidateRecordId?: string | null;
  profileId?: string | null;
  experience?: string;
  location?: string;
  preferredLocation?: string | null;
  currentCompany?: string | null;
  currentRole?: string | null;
  skills?: string[];
  resumeFile?: string | null;
  profilePicture?: string | null;
  linkedinUrl?: string | null;
  education?: string | null;
  highestQualification?: string | null;
  collegeName?: string | null;
  noticePeriod?: string | null;
  ctc?: string | null;
  ectc?: string | null;
  workSummary?: string | null;
  preferences?: {
    jobTitles?: string | null;
    workMode?: string | null;
    employmentType?: string | null;
    locations?: string | null;
    summary?: string | null;
  } | null;
  statusNote?: string | null;
  rejectionReason?: string | null;
  portfolioUrl?: string | null;
  websiteUrl?: string | null;
  pedigreeLevel?: string | null;
  companyLevel?: string | null;
  applicationCurrentCtc?: string | null;
  applicationExpectedCtc?: string | null;
  salaryEditedByName?: string | null;
  salaryEditedAt?: string | null;
};

type ApplicationComment = {
  id: string;
  applicationId: string;
  authorEmployeeId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

import { resolveUploadAssetUrl } from "@/lib/resolve-upload-url";

function normalizeUploadAssetUrl(
  filePath?: string | null,
  defaultSubdir = "uploads",
): string | null {
  return resolveUploadAssetUrl(filePath, defaultSubdir);
}

function normalizeResumeUrl(resumeFile?: string | null): string | null {
  return normalizeUploadAssetUrl(resumeFile, "uploads/resumes");
}

function normalizeProfilePictureUrl(profilePicture?: string | null): string | null {
  return normalizeUploadAssetUrl(profilePicture, "uploads/profiles");
}

function formatAppliedDaysAgo(dateInput?: string | Date | null): string | null {
  if (!dateInput) return null;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

function roleBadgeClass(role: string, onMutedPanel = false): string {
  const r = role.toLowerCase();
  if (onMutedPanel) {
    if (r === "admin") return "bg-violet-100 text-violet-800";
    if (r === "tl") return "bg-amber-100 text-amber-900";
    if (r === "ta") return "bg-blue-100 text-blue-800";
    if (r === "client") return "bg-emerald-100 text-emerald-800";
    if (r === "hr") return "bg-pink-100 text-pink-900";
    return "bg-gray-200 text-gray-700";
  }
  if (r === "admin") return "bg-violet-100 text-violet-800";
  if (r === "tl") return "bg-amber-100 text-amber-800";
  if (r === "ta") return "bg-blue-100 text-blue-800";
  if (r === "client") return "bg-emerald-100 text-emerald-800";
  if (r === "hr") return "bg-pink-100 text-pink-800";
  return "bg-gray-100 text-gray-700";
}

const SALARY_CONFIDENTIAL_TOOLTIP =
  "Confidential: Do not share salary details in this comment chat.";

function normalizeSalaryInput(value?: string | null): string {
  const raw = String(value ?? "0").trim().replace(/[^\d.]/g, "");
  return raw || "0";
}

function formatSalaryDisplay(value?: string | null): string {
  const normalized = normalizeSalaryInput(value);
  const num = Number(normalized);
  if (!Number.isNaN(num)) {
    return `₹${num.toLocaleString("en-IN")}`;
  }
  return `₹${normalized}`;
}

function formatApplicationSourceLabel(source: string): string {
  const s = source.toLowerCase().trim();
  if (s === "recruiter_tagged") return "Sourced";
  if (s === "tl_tagged") return "TL Tagged";
  if (s === "job_board" || s === "inbound" || s === "applied" || s === "direct") return "Applied";
  return source.replace(/_/g, " ");
}

function SourceBadge({ source }: { source: string }) {
  const label = formatApplicationSourceLabel(source);
  const isSourced = label === "Sourced";
  return (
    <span
      className={cn(
        "inline-flex w-fit self-start px-2.5 py-0.5 text-xs font-semibold",
        BTN_RADIUS,
        isSourced ? "bg-violet-100 text-violet-800" : "bg-amber-100 text-amber-900",
      )}
    >
      {label}
    </span>
  );
}

function SalaryDetailsSection({
  applicationId,
  apiMode,
  currentCtc,
  expectedCtc,
  lastEditedBy,
  lastEditedAt,
  canEdit,
  onSaved,
  railVariant = "default",
}: {
  applicationId: string;
  apiMode: "recruiter" | "client";
  currentCtc: string;
  expectedCtc: string;
  lastEditedBy?: string | null;
  lastEditedAt?: string | null;
  canEdit: boolean;
  onSaved: () => void;
  railVariant?: "default" | "ta";
}) {
  const taRail = railVariant === "ta";
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [draftCurrent, setDraftCurrent] = useState(currentCtc);
  const [draftExpected, setDraftExpected] = useState(expectedCtc);

  useEffect(() => {
    setDraftCurrent(currentCtc);
    setDraftExpected(expectedCtc);
    if (!canEdit) setExpanded(false);
  }, [applicationId, currentCtc, expectedCtc, canEdit]);

  const encodedId = encodeURIComponent(applicationId);
  const salaryEndpoint =
    apiMode === "client"
      ? `/api/client/applications/${encodedId}/salary`
      : `/api/recruiter/applications/${encodedId}/salary`;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", salaryEndpoint, {
        currentCtc: draftCurrent,
        expectedCtc: draftExpected,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Salary details saved" });
      setExpanded(false);
      onSaved();
    },
    onError: (error: Error) => {
      let description = error.message || "Please try again.";
      const jsonStart = description.indexOf("{");
      if (jsonStart >= 0) {
        try {
          const parsed = JSON.parse(description.slice(jsonStart)) as { message?: string };
          if (parsed.message) description = parsed.message;
        } catch {
          // keep raw message
        }
      }
      toast({
        title: "Could not save salary",
        description,
        variant: "destructive",
      });
    },
  });

  const summary = `${formatSalaryDisplay(currentCtc)} Current CTC · ${formatSalaryDisplay(expectedCtc)} Exp CTC`;

  return (
    <div
      className={cn(
        "shrink-0 border border-gray-300 bg-gray-200/70",
        BTN_RADIUS,
        taRail ? "mx-3 mb-1 mt-1" : "mx-4 mb-2 mt-2",
      )}
      data-testid="salary-details-bar"
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-3",
          taRail ? "min-h-[44px] py-3" : "py-2.5",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <IndianRupee className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Salary Details
          </span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
                  aria-label="Salary confidentiality notice"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className={cn(
                  "max-w-[260px] border border-gray-200 bg-white px-3 py-2 text-xs leading-relaxed text-gray-800 shadow-md",
                  BTN_RADIUS,
                )}
              >
                {SALARY_CONFIDENTIAL_TOOLTIP}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-300/60 hover:text-gray-900"
              aria-label={expanded ? "Close salary editor" : "Edit salary details"}
              data-testid="button-edit-salary-details"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-gray-300/80 transition-all duration-300 ease-in-out",
          expanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="space-y-3 px-3 py-3">
          <div>
            <Label htmlFor="salary-current-ctc" className="text-xs text-gray-600">
              Current CTC
            </Label>
            <Input
              id="salary-current-ctc"
              value={draftCurrent}
              onChange={(e) => setDraftCurrent(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className={cn("mt-1 h-9 bg-white", BTN_RADIUS)}
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="salary-expected-ctc" className="text-xs text-gray-600">
              Expected CTC
            </Label>
            <Input
              id="salary-expected-ctc"
              value={draftExpected}
              onChange={(e) => setDraftExpected(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className={cn("mt-1 h-9 bg-white", BTN_RADIUS)}
              inputMode="numeric"
            />
          </div>
          {lastEditedBy && (
            <p className="text-xs text-gray-500">
              Last edited by {lastEditedBy}
              {lastEditedAt
                ? ` · ${format(new Date(lastEditedAt), "MMM d, yyyy h:mm a")}`
                : ""}
            </p>
          )}
          <Button
            type="button"
            size="sm"
            className={cn("w-full", BTN_RADIUS)}
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : "Save salary details"}
          </Button>
        </div>
      </div>

      {!expanded && (
        <div
          className={cn(
            "border-t border-gray-300/60 px-3",
            taRail ? "min-h-[40px] pb-3 pt-2" : "pb-2.5 pt-2",
          )}
        >
          <p className="text-sm font-medium text-gray-800">{summary}</p>
          {lastEditedBy && (
            <p className="mt-1 text-xs text-gray-500">Last edited by {lastEditedBy}</p>
          )}
        </div>
      )}
    </div>
  );
}

function PipelineStageBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        BTN_RADIUS,
        getPipelineStageBadgeClass(status),
      )}
    >
      {status}
    </span>
  );
}

function formatEducation(app?: SessionApplication): string | undefined {
  if (!app) return undefined;
  const parts = [app.education, app.highestQualification, app.collegeName].filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.length ? unique.join(" · ") : undefined;
}

function getClientRejectionReason(app?: SessionApplication | null): string | null {
  if (!app) return null;
  const direct = app.rejectionReason?.trim();
  if (direct) return direct;
  const note = app.statusNote?.trim();
  if (note && /^rejected by client:/i.test(note)) {
    return note.replace(/^rejected by client:\s*/i, "").trim() || null;
  }
  return null;
}

function formatCtcLabel(
  app?: SessionApplication,
  normalized?: { current: string; expected: string },
): string | undefined {
  const current = normalized?.current ?? normalizeSalaryInput(app?.applicationCurrentCtc ?? app?.ctc);
  const expected = normalized?.expected ?? normalizeSalaryInput(app?.applicationExpectedCtc ?? app?.ectc);
  const parts: string[] = [];
  if (current !== "0") parts.push(`${formatSalaryDisplay(current)} current`);
  if (expected !== "0") parts.push(`${formatSalaryDisplay(expected)} expected`);
  if (parts.length > 0) return parts.join(" · ");
  const legacy = [app?.ctc, app?.ectc].filter((v): v is string => Boolean(v && String(v).trim()));
  return legacy.length > 0 ? Array.from(new Set(legacy)).join(" · ") : undefined;
}

type CandidateCommentsSessionProps = {
  applicationId: string;
  fallbackApplicant?: CandidateCommentsSessionApplicant | null;
  pipelineApplicants?: CandidateCommentsSessionApplicant[];
  onSelectApplicant?: (applicant: CandidateCommentsSessionApplicant) => void;
  onBack: () => void;
  apiMode?: "recruiter" | "client";
  /** Client portal: hide salary block when member cannot see salary (server also strips fields). */
  canViewSalaryDetails?: boolean;
  viewerName?: string;
  clientReject?: {
    /** Optional; session derives from application status when omitted */
    canReject?: boolean;
    isRejecting?: boolean;
    /** @deprecated Reject is handled inside the session (status + comment). Use onClientRejected for side effects. */
    onReject?: (reason: string) => void;
  };
  /** After a successful client reject (pipeline refresh, etc.) */
  onClientRejected?: (reason: string) => void;
  /** TA pipeline: taller right-rail blocks, tighter vertical spacing */
  commentsRailVariant?: "default" | "ta";
};

export function CandidateCommentsSession({
  applicationId,
  fallbackApplicant,
  pipelineApplicants = [],
  onSelectApplicant,
  onBack,
  apiMode = "recruiter",
  canViewSalaryDetails = true,
  viewerName,
  clientReject,
  onClientRejected,
  commentsRailVariant = "default",
}: CandidateCommentsSessionProps) {
  const taCommentsRail = commentsRailVariant === "ta";
  const { toast } = useToast();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [mobileSessionTab, setMobileSessionTab] = useState<"details" | "comments">("details");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const prevApplicationIdRef = useRef(applicationId);

  const encodedApplicationId = encodeURIComponent(applicationId);
  const apiBase =
    apiMode === "client"
      ? `/api/client/applications/${encodedApplicationId}`
      : `/api/recruiter/applications/${encodedApplicationId}`;
  const sessionQueryKey =
    apiMode === "client"
      ? ["/api/client/applications", applicationId, "session"]
      : ["/api/recruiter/applications", applicationId, "session"];
  const commentsQueryKey =
    apiMode === "client"
      ? ["/api/client/applications", applicationId, "comments"]
      : ["/api/recruiter/applications", applicationId, "comments"];

  const navIndex = pipelineApplicants.findIndex((a) => a.id === applicationId);
  const navTotal = pipelineApplicants.length;
  const canGoPrev = navIndex > 0;
  const canGoNext = navIndex >= 0 && navIndex < navTotal - 1;

  const {
    data: sessionData,
    isLoading: sessionLoading,
    isFetching: sessionFetching,
  } = useQuery<{ application: SessionApplication }>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const res = await apiRequest("GET", `${apiBase}/session`);
      return res.json();
    },
    enabled: !!applicationId,
    placeholderData: (previous) => previous,
  });

  const { data: comments = [], isLoading: commentsLoading, isFetching: commentsFetching } =
    useQuery<ApplicationComment[]>({
      queryKey: commentsQueryKey,
      queryFn: async () => {
        const res = await apiRequest("GET", `${apiBase}/comments`);
        return res.json();
      },
      enabled: !!applicationId,
      refetchInterval: 15000,
      placeholderData: (previous) => previous,
    });

  useEffect(() => {
    if (prevApplicationIdRef.current !== applicationId) {
      prevApplicationIdRef.current = applicationId;
      setIsSwitching(true);
      setCommentText("");
      setRejectReason("");
      setShowRejectForm(false);
      setConfirmRejectOpen(false);
      setMobileSessionTab("details");
    }
  }, [applicationId]);

  useEffect(() => {
    if (isSwitching && !sessionFetching && !sessionLoading) {
      const timer = setTimeout(() => setIsSwitching(false), 120);
      return () => clearTimeout(timer);
    }
  }, [isSwitching, sessionFetching, sessionLoading]);

  const postCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await apiRequest("POST", `${apiBase}/comments`, { body });
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Could not post comment",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const app = sessionData?.application;
  const displayName = app?.candidateName || fallbackApplicant?.candidateName || "Candidate";
  const roleTitle =
    app?.currentRole ||
    app?.jobTitle ||
    fallbackApplicant?.roleApplied ||
    fallbackApplicant?.jobTitle ||
    "—";
  const companyName =
    app?.currentCompany || app?.company || fallbackApplicant?.company || "—";
  const email = app?.candidateEmail || fallbackApplicant?.email;
  const phone = app?.candidatePhone || fallbackApplicant?.phone;
  const skills = uniqueSkillsList(
    app?.skills ?? (fallbackApplicant?.skills?.length ? fallbackApplicant.skills : []),
  );
  const resumeUrl = normalizeResumeUrl(app?.resumeFile || fallbackApplicant?.resumeFile);
  const profilePictureUrl = normalizeProfilePictureUrl(
    app?.profilePicture || fallbackApplicant?.profilePicture,
  );
  const isPdf = (resumeUrl?.toLowerCase() || "").endsWith(".pdf");
  const profilePageId = app?.candidateRecordId || app?.profileId;
  const appliedRoleTitle =
    app?.jobTitle || fallbackApplicant?.roleApplied || fallbackApplicant?.jobTitle || null;
  const appliedCompanyName = app?.company || fallbackApplicant?.company || null;
  const appliedDaysAgo = formatAppliedDaysAgo(app?.appliedDate);
  const educationLabel = formatEducation(app);
  const location = app?.location || fallbackApplicant?.location;
  const experience = app?.experience || fallbackApplicant?.experience;
  const pipelineStage = app?.status || fallbackApplicant?.currentStatus || "";
  const applicationSource = app?.source;
  const applicationCurrentCtc = normalizeSalaryInput(
    app?.applicationCurrentCtc ?? app?.ctc ?? "0",
  );
  const applicationExpectedCtc = normalizeSalaryInput(
    app?.applicationExpectedCtc ?? app?.ectc ?? "0",
  );
  const ctcLabel = formatCtcLabel(app, {
    current: applicationCurrentCtc,
    expected: applicationExpectedCtc,
  });
  const canEditSalary =
    apiMode !== "client" && isTalentAdvisorEmployeeRole(employee?.role);
  const showSalarySection = apiMode !== "client" || canViewSalaryDetails;
  const clientRejectionReason = getClientRejectionReason(app);

  const showContentFade = isSwitching || sessionFetching || commentsFetching;

  const displayComments = useMemo(() => {
    const seenRejectionBodies = new Set<string>();
    return comments.filter((c) => {
      if (!isClientRejectionComment(c.body, c.authorRole)) return true;
      const key = c.body.trim();
      if (seenRejectionBodies.has(key)) return false;
      seenRejectionBodies.add(key);
      return true;
    });
  }, [comments]);

  const commentsByDay = useMemo(() => {
    const groups: { label: string; items: ApplicationComment[] }[] = [];
    const map = new Map<string, ApplicationComment[]>();
    for (const c of displayComments) {
      const dayKey = formatCommentDayKey(c.createdAt);
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(c);
    }
    for (const [dayKey, items] of map) {
      groups.push({
        label: format(parseCommentTimestamp(`${dayKey}T12:00:00Z`), "EEEE, MMM d"),
        items,
      });
    }
    return groups;
  }, [displayComments]);

  const pipelineStatus = (app?.status || fallbackApplicant?.currentStatus || "").toLowerCase();
  const isRejected =
    pipelineStatus === "rejected" ||
    pipelineStatus.includes("screened out") ||
    pipelineStatus === "withdrawn";
  const posterName = employee?.name || viewerName;

  const builtInClientRejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed) {
        throw new Error("Please enter a rejection reason.");
      }
      const commentBody = `${CLIENT_REJECTION_COMMENT_PREFIX} ${trimmed}`;

      const statusRes = await apiRequest("PATCH", `${apiBase}/status`, {
        status: "Rejected",
        reason: trimmed,
        rejectionReason: trimmed,
      });
      await statusRes.json();

      let savedComment: ApplicationComment | null = null;
      try {
        const commentRes = await apiRequest("POST", `${apiBase}/comments`, { body: commentBody });
        savedComment = (await commentRes.json()) as ApplicationComment;
      } catch {
        // PATCH handler may already have created the comment
      }

      return { reason: trimmed, commentBody, comment: savedComment };
    },
    onMutate: async (reason) => {
      const trimmed = reason.trim();
      const commentBody = `${CLIENT_REJECTION_COMMENT_PREFIX} ${trimmed}`;
      const optimistic: ApplicationComment = {
        id: `optimistic-client-reject-${Date.now()}`,
        applicationId,
        authorEmployeeId: employee?.id || "",
        authorName: employee?.name || viewerName || "Client",
        authorRole: "Client",
        body: commentBody,
        createdAt: new Date().toISOString(),
      };
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });
      const previous = queryClient.getQueryData<ApplicationComment[]>(commentsQueryKey);
      queryClient.setQueryData<ApplicationComment[]>(commentsQueryKey, [
        ...(previous || []),
        optimistic,
      ]);
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: async (data, _reason, context) => {
      queryClient.setQueryData<ApplicationComment[]>(commentsQueryKey, (old = []) => {
        const withoutOptimistic = old.filter((c) => c.id !== context?.optimisticId);
        const hasComment = withoutOptimistic.some(
          (c) => c.body.trim() === data.commentBody || isClientRejectionComment(c.body, c.authorRole),
        );
        if (hasComment) return withoutOptimistic;
        if (data.comment) return [...withoutOptimistic, data.comment];
        return [
          ...withoutOptimistic,
          {
            id: `client-reject-${Date.now()}`,
            applicationId,
            authorEmployeeId: employee?.id || "",
            authorName: employee?.name || viewerName || "Client",
            authorRole: "Client",
            body: data.commentBody,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      await queryClient.refetchQueries({ queryKey: commentsQueryKey });
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["/api/client/pipeline"] });
      void queryClient.invalidateQueries({ queryKey: ["/api/client/dashboard-stats"] });

      onClientRejected?.(data.reason);
      clientReject?.onReject?.(data.reason);

      setRejectReason("");
      setShowRejectForm(false);
      setConfirmRejectOpen(false);

      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
      toast({
        title: "Candidate rejected",
        description: "Rejection reason was added to the comment thread.",
      });
    },
    onError: (error: Error, _reason, context) => {
      if (context?.previous) {
        queryClient.setQueryData(commentsQueryKey, context.previous);
      }
      toast({
        title: "Could not reject candidate",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const effectiveClientReject =
    apiMode === "client"
      ? {
          canReject: clientReject?.canReject ?? !isRejected,
          isRejecting: builtInClientRejectMutation.isPending,
          onReject: (reason: string) => {
            builtInClientRejectMutation.mutate(reason);
          },
        }
      : clientReject;

  useEffect(() => {
    if (isRejected) {
      setRejectReason("");
      setShowRejectForm(false);
      setConfirmRejectOpen(false);
    }
  }, [isRejected, applicationId]);

  const handleConfirmReject = () => {
    if (!effectiveClientReject || !rejectReason.trim()) return;
    effectiveClientReject.onReject(rejectReason.trim());
  };

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed || postCommentMutation.isPending) return;
    postCommentMutation.mutate(trimmed);
  };

  const navigateApplicant = (direction: "prev" | "next") => {
    if (!onSelectApplicant || navIndex < 0) return;
    const targetIndex = direction === "prev" ? navIndex - 1 : navIndex + 1;
    const target = pipelineApplicants[targetIndex];
    if (target) onSelectApplicant(target);
  };

  if (sessionLoading && !fallbackApplicant && !sessionData) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const commentsPanelHeaderRight = effectiveClientReject ? (
    isRejected ? (
      <span className="text-xs font-medium text-red-600">Rejected</span>
    ) : effectiveClientReject.canReject ? (
      showRejectForm ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 text-xs text-gray-600 hover:text-gray-900", BTN_RADIUS)}
          onClick={() => {
            setShowRejectForm(false);
            setRejectReason("");
          }}
        >
          Cancel
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-red-300 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700",
            BTN_RADIUS,
          )}
          onClick={() => setShowRejectForm(true)}
          data-testid="button-open-reject-candidate"
        >
          Reject Candidate
        </Button>
      )
    ) : null
  ) : null;

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-white text-gray-900"
      data-testid="candidate-comments-session"
    >
      {/* Mobile: compact header + Details / Comments tabs */}
      <div className="flex shrink-0 flex-col border-b border-gray-200 md:hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center bg-blue-600 text-white transition-colors hover:bg-blue-700",
              BTN_RADIUS,
            )}
            aria-label="Back to pipeline"
            data-testid="button-back-pipeline-mobile"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold text-gray-900"
              data-testid="text-session-candidate-name-mobile"
            >
              {displayName}
            </p>
            {pipelineStage ? (
              <div className="mt-0.5">
                <PipelineStageBadge status={pipelineStage} />
              </div>
            ) : null}
          </div>
          {navTotal > 1 ? (
            <PipelineNav
              index={navIndex}
              total={navTotal}
              canPrev={canGoPrev}
              canNext={canGoNext}
              onPrev={() => navigateApplicant("prev")}
              onNext={() => navigateApplicant("next")}
            />
          ) : null}
        </div>
        <div
          className="grid grid-cols-2 border-t border-gray-200"
          role="tablist"
          aria-label="Candidate session"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileSessionTab === "details"}
            onClick={() => setMobileSessionTab("details")}
            className={cn(
              "py-2.5 text-sm font-medium transition-colors",
              mobileSessionTab === "details"
                ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50",
            )}
            data-testid="tab-session-details"
          >
            Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileSessionTab === "comments"}
            onClick={() => setMobileSessionTab("comments")}
            className={cn(
              "py-2.5 text-sm font-medium transition-colors",
              mobileSessionTab === "comments"
                ? "border-b-2 border-blue-600 bg-blue-50/50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50",
            )}
            data-testid="tab-session-comments"
          >
            Comments
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section
          className={cn(
            "min-h-0 min-w-0 flex-col border-gray-200 md:w-[58%] md:max-w-[58%] md:border-r",
            mobileSessionTab === "details" ? "flex flex-1" : "hidden",
            "md:flex",
          )}
          aria-label="Candidate Details"
        >
          <SectionHeader
            className="hidden md:flex"
            title="Candidate Details"
            left={
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center bg-blue-600 text-white transition-colors hover:bg-blue-700",
                  BTN_RADIUS,
                )}
                aria-label="Back to pipeline"
                data-testid="button-back-pipeline"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            }
            right={
              navTotal > 1 ? (
                <PipelineNav
                  index={navIndex}
                  total={navTotal}
                  canPrev={canGoPrev}
                  canNext={canGoNext}
                  onPrev={() => navigateApplicant("prev")}
                  onNext={() => navigateApplicant("next")}
                />
              ) : null
            }
          />

          <div className="relative flex-1 min-h-0">
            {showContentFade && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
            <div
              className={cn(
                "h-full overflow-y-auto p-4 transition-opacity duration-200 md:p-5",
                showContentFade ? "opacity-50" : "opacity-100",
              )}
            >
              <div
                className={cn(
                  "mb-5 flex min-h-0 flex-col overflow-hidden border border-gray-200 bg-gray-50 shadow-sm sm:min-h-[112px] sm:flex-row",
                  BTN_RADIUS,
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:pr-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-900"
                      data-testid="text-session-candidate-name"
                    >
                      {displayName}
                    </h2>
                    {pipelineStage ? <PipelineStageBadge status={pipelineStage} /> : null}
                  </div>
                  <p className="text-sm leading-snug text-gray-600">
                    <span className="text-gray-500">Current: </span>
                    <span className="font-medium text-blue-700">{roleTitle}</span>
                    {companyName && companyName !== "—" ? (
                      <span className="text-gray-600"> at {companyName}</span>
                    ) : null}
                  </p>
                  {applicationSource && <SourceBadge source={applicationSource} />}
                  <div className="flex flex-wrap gap-2">
                    {email && (
                      <QuickAction icon={<Mail className="h-3.5 w-3.5" />} label="Email" href={`mailto:${email}`} />
                    )}
                    {phone && (
                      <QuickAction icon={<Phone className="h-3.5 w-3.5" />} label="Call" href={`tel:${phone}`} />
                    )}
                    {app?.linkedinUrl && (
                      <QuickAction
                        icon={<Linkedin className="h-3.5 w-3.5" />}
                        label="LinkedIn"
                        href={app.linkedinUrl}
                        external
                      />
                    )}
                    {resumeUrl && (
                      <QuickAction
                        icon={<FileText className="h-3.5 w-3.5" />}
                        label="Resume"
                        onClick={() => window.open(resumeUrl, "_blank")}
                      />
                    )}
                  </div>
                </div>

                {(appliedRoleTitle || appliedCompanyName) && (
                  <div
                    className="flex w-full shrink-0 flex-col justify-center border-t border-blue-100 bg-blue-50/80 px-3 py-3 text-left sm:max-w-[200px] sm:border-l sm:border-t-0 sm:text-right md:w-[min(11rem,34%)]"
                    data-testid="session-applied-requirement"
                  >
                    <p className="text-xs font-medium text-blue-800">Applied for</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-gray-900">
                      {appliedRoleTitle || "Role not specified"}
                    </p>
                    {appliedCompanyName && (
                      <p className="mt-0.5 text-sm font-medium leading-snug text-gray-700">
                        {appliedCompanyName}
                      </p>
                    )}
                    {appliedDaysAgo && (
                      <p
                        className="mt-1.5 text-xs font-medium text-blue-700"
                        data-testid="text-applied-days-ago"
                      >
                        {appliedDaysAgo}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex h-28 w-full shrink-0 border-t border-gray-200 bg-white p-2 sm:h-auto sm:w-[min(38%,148px)] sm:max-w-[148px] sm:self-stretch sm:border-l sm:border-t-0">
                  <CandidateProfilePhoto
                    name={displayName}
                    imageUrl={profilePictureUrl}
                    className="h-full w-full"
                  />
                </div>
              </div>

              <ContactDetailCard
                email={email}
                phone={phone}
                location={location}
                preferredLocation={app?.preferredLocation}
                portfolioUrl={app?.portfolioUrl}
                websiteUrl={app?.websiteUrl}
                onCopyEmail={
                  email
                    ? () => {
                        navigator.clipboard.writeText(email);
                        toast({ title: "Email copied" });
                      }
                    : undefined
                }
                onCopyPhone={
                  phone
                    ? () => {
                        navigator.clipboard.writeText(phone);
                        toast({ title: "Phone copied" });
                      }
                    : undefined
                }
              />

              {app?.workSummary && (
                <DetailCard title="Work summary">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{app.workSummary}</p>
                </DetailCard>
              )}

              <DetailCard title="Professional">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <Field label="Experience" value={experience} />
                  <Field label="Notice period" value={app?.noticePeriod} />
                  <Field label="CTC" value={ctcLabel} />
                  <Field label="Education" value={educationLabel} />
                  <Field label="Current company" value={app?.currentCompany} />
                  <Field label="Current role" value={app?.currentRole} />
                  <Field label="Pedigree" value={app?.pedigreeLevel} />
                  <Field label="Company level" value={app?.companyLevel} />
                  {app?.appliedDate && (
                    <Field label="Applied" value={format(new Date(app.appliedDate), "dd MMM yyyy")} />
                  )}
                  {app?.jobTitle && app.jobTitle !== roleTitle && (
                    <Field label="Applied for" value={app.jobTitle} />
                  )}
                </div>
                {skills.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </DetailCard>

              {app?.preferences && (
                <DetailCard title="Preferences">
                  <div className="space-y-2 text-sm text-gray-700">
                    {app.preferences.jobTitles && (
                      <p>
                        <span className="text-gray-500">Roles: </span>
                        {app.preferences.jobTitles}
                      </p>
                    )}
                    {app.preferences.workMode && (
                      <p>
                        <span className="text-gray-500">Work mode: </span>
                        {app.preferences.workMode}
                      </p>
                    )}
                    {app.preferences.employmentType && (
                      <p>
                        <span className="text-gray-500">Employment: </span>
                        {app.preferences.employmentType}
                      </p>
                    )}
                    {app.preferences.locations && (
                      <p>
                        <span className="text-gray-500">Locations: </span>
                        {app.preferences.locations}
                      </p>
                    )}
                    {!app.preferences.jobTitles &&
                      !app.preferences.workMode &&
                      !app.preferences.employmentType &&
                      !app.preferences.locations &&
                      app.preferences.summary && <p>{app.preferences.summary}</p>}
                  </div>
                </DetailCard>
              )}

              {(app?.statusNote || clientRejectionReason) && (
                <DetailCard title="Notes">
                  {clientRejectionReason && (
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Rejection Reason by Client: </span>
                      {clientRejectionReason}
                    </p>
                  )}
                  {app.statusNote &&
                    !(clientRejectionReason && /^rejected by client:/i.test(app.statusNote)) && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{app.statusNote}</p>
                    )}
                </DetailCard>
              )}

              <DetailCardWithActions
                title="Resume"
                actions={
                  resumeUrl ? (
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <Button
                        size="sm"
                        className={cn("w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto", BTN_RADIUS)}
                        onClick={() => window.open(resumeUrl, "_blank")}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Open in new tab
                      </Button>
                      {profilePageId && (
                        <Button
                          size="sm"
                          className={cn("w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto", BTN_RADIUS)}
                          onClick={() => window.open(`/candidate-profile/${profilePageId}`, "_blank")}
                        >
                          <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                          Full profile
                        </Button>
                      )}
                    </div>
                  ) : null
                }
              >
                {resumeUrl ? (
                  isPdf ? (
                    <iframe
                      title="Resume preview"
                      src={resumeUrl}
                      className={cn(
                        "h-[min(280px,42vh)] w-full border border-gray-200 bg-white sm:h-[min(360px,45vh)] md:h-[min(420px,45vh)]",
                        BTN_RADIUS,
                      )}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Preview is available for PDF files. Use &quot;Open in new tab&quot; for other formats.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-500">No resume on file for this candidate.</p>
                )}
              </DetailCardWithActions>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "min-h-0 w-full flex-col bg-gray-100 text-gray-900 md:min-h-0 md:w-[42%] md:max-w-[42%] md:flex-none",
            mobileSessionTab === "comments" ? "flex flex-1" : "hidden",
            "md:flex",
          )}
          aria-label="Candidate Comments"
        >
          {commentsPanelHeaderRight ? (
            <div className="flex shrink-0 items-center justify-end gap-2 border-b border-gray-200 bg-gray-50/80 px-3 py-2 md:hidden">
              {commentsPanelHeaderRight}
            </div>
          ) : null}
          <SectionHeader
            className="hidden md:flex"
            title="Comments"
            mutedPanel
            taRail={taCommentsRail}
            right={commentsPanelHeaderRight}
          />
          {clientRejectionReason ? (
            <div
              className={cn(
                "shrink-0 border border-red-200 bg-red-50 px-3 py-2.5",
                BTN_RADIUS,
                taCommentsRail ? "mx-3 mt-1.5" : "mx-4 mt-3",
              )}
              data-testid="client-rejection-reason-banner"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                Rejection Reason by Client
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-red-900">{clientRejectionReason}</p>
            </div>
          ) : null}
          {showRejectForm && effectiveClientReject?.canReject && !isRejected && (
            <div className="shrink-0 space-y-2 border-b border-gray-200 bg-gray-50 px-3 py-3 sm:px-4">
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className={cn(
                  "min-h-[72px] resize-none border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400",
                  BTN_RADIUS,
                )}
                data-testid="textarea-session-reject-reason"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className={cn("w-full", BTN_RADIUS)}
                disabled={!rejectReason.trim() || effectiveClientReject.isRejecting}
                onClick={() => setConfirmRejectOpen(true)}
                data-testid="button-session-reject-candidate"
              >
                Reject Candidate
              </Button>
            </div>
          )}
          {showSalarySection && (
            <SalaryDetailsSection
              applicationId={applicationId}
              apiMode={apiMode}
              currentCtc={applicationCurrentCtc}
              expectedCtc={applicationExpectedCtc}
              lastEditedBy={app?.salaryEditedByName}
              lastEditedAt={
                app?.salaryEditedAt == null
                  ? null
                  : typeof app.salaryEditedAt === "string"
                    ? app.salaryEditedAt
                    : String(app.salaryEditedAt)
              }
              canEdit={canEditSalary}
              railVariant={taCommentsRail ? "ta" : "default"}
              onSaved={() => {
                void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
              }}
            />
          )}

          <div
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto transition-opacity duration-200",
              taCommentsRail ? "px-3 py-2 sm:px-4" : "px-3 py-3 sm:px-5 sm:py-4",
              showContentFade ? "opacity-50" : "opacity-100",
            )}
          >
            {commentsLoading && comments.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : displayComments.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">
                No comments yet. Start the discussion about {displayName}&apos;s interviews and performance.
              </p>
            ) : (
              <div className="space-y-6">
                {commentsByDay.map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wider text-gray-500">
                      {group.label}
                    </p>
                    <div className="space-y-4">
                      {group.items.map((comment) => (
                        <article key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                          <AvatarInitials name={comment.authorName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                  BTN_RADIUS,
                                  roleBadgeClass(comment.authorRole, true),
                                )}
                              >
                                {comment.authorRole}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatCommentTime(comment.createdAt)}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "mt-1 whitespace-pre-wrap text-sm",
                                isClientRejectionComment(comment.body, comment.authorRole)
                                  ? "font-medium text-red-700"
                                  : "text-gray-700",
                              )}
                            >
                              {comment.body}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          <div
            className={cn(
              "shrink-0 border-t border-gray-200 bg-gray-50 pb-[env(safe-area-inset-bottom)]",
              taCommentsRail ? "px-3 py-2.5" : "px-3 py-3 sm:px-4",
            )}
          >
            <p className={cn("text-[11px] text-gray-600", taCommentsRail ? "mb-1.5" : "mb-2")}>
              {apiMode === "client"
                ? "Comments are shared with your hiring team on this application."
                : "Comments are visible only to your team on this application."}
            </p>
            <div
              className={cn(
                "flex items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 shadow-sm",
                BTN_RADIUS,
              )}
            >
              <Input
                placeholder="Write to your team…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-9 flex-1 border-0 bg-transparent pl-3 pr-0 text-sm text-gray-900 shadow-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-candidate-comment"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || postCommentMutation.isPending}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40",
                  BTN_RADIUS,
                )}
                aria-label="Send comment"
                data-testid="button-post-candidate-comment"
              >
                {postCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </button>
            </div>
            {posterName && (
              <p className="mt-1.5 text-[11px] text-gray-500">Posting as {posterName}</p>
            )}
          </div>
        </section>
      </div>

      {effectiveClientReject && (
        <AlertDialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
          <AlertDialogContent
            className={cn(
              "mx-auto w-[calc(100vw-1.5rem)] max-w-md sm:w-full",
              BTN_RADIUS,
            )}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Reject candidate?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject <strong>{displayName}</strong>? This action will move
                them to Rejected and notify your hiring team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {rejectReason.trim() && (
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <span className="font-medium">Reason: </span>
                {rejectReason.trim()}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={effectiveClientReject.isRejecting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                disabled={effectiveClientReject.isRejecting || !rejectReason.trim()}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmReject();
                }}
              >
                {effectiveClientReject.isRejecting ? "Rejecting…" : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  left,
  right,
  mutedPanel = false,
  taRail = false,
  className,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  mutedPanel?: boolean;
  taRail?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 sm:gap-3 sm:px-4",
        taRail ? "min-h-[44px] py-3" : "py-2.5",
        mutedPanel ? "border-gray-200 bg-gray-50/80" : "border-gray-200",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {left}
        <h2
          className={cn(
            "truncate text-xs font-semibold uppercase tracking-wider",
            mutedPanel ? "text-gray-600" : "text-gray-600",
          )}
        >
          {title}
        </h2>
      </div>
      {right ? <div className="flex shrink-0 items-center">{right}</div> : null}
    </div>
  );
}

function PipelineNav({
  index,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const position = index >= 0 ? index + 1 : 1;
  return (
    <div className="flex shrink-0 items-center gap-1" data-testid="pipeline-candidate-nav">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className={cn(
          "flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30",
          BTN_RADIUS,
        )}
        aria-label="Previous candidate"
        data-testid="button-prev-candidate"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-gray-500">
        {position} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={cn(
          "flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30",
          BTN_RADIUS,
        )}
        aria-label="Next candidate"
        data-testid="button-next-candidate"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={cn("mb-4 border border-gray-200 bg-white p-4 shadow-sm", BTN_RADIUS)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function DetailCardWithActions({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("mb-4 border border-gray-200 bg-white p-4 shadow-sm", BTN_RADIUS)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

function CandidateProfilePhoto({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imgFailed;

  return (
    <div
      className={cn(
        "relative min-h-[96px] w-full overflow-hidden bg-white",
        BTN_RADIUS,
        className,
      )}
      data-testid="session-candidate-profile-photo"
    >
      {showImage ? (
        <img
          src={imageUrl!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <AvatarInitials name={name} variant="card" />
      )}
    </div>
  );
}

function ContactDetailCard({
  email,
  phone,
  location,
  preferredLocation,
  portfolioUrl,
  websiteUrl,
  onCopyEmail,
  onCopyPhone,
}: {
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  preferredLocation?: string | null;
  portfolioUrl?: string | null;
  websiteUrl?: string | null;
  onCopyEmail?: () => void;
  onCopyPhone?: () => void;
}) {
  type ContactItem = {
    key: string;
    icon: ReactNode;
    label: string;
    value?: string | null;
    href?: string;
    onCopy?: () => void;
    isLink?: boolean;
  };

  const items: ContactItem[] = [
    {
      key: "email",
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      value: email,
      href: email ? `mailto:${email}` : undefined,
      onCopy: onCopyEmail,
    },
    {
      key: "phone",
      icon: <Phone className="h-4 w-4" />,
      label: "Phone",
      value: phone,
      href: phone ? `tel:${phone}` : undefined,
      onCopy: onCopyPhone,
    },
    {
      key: "location",
      icon: <MapPin className="h-4 w-4" />,
      label: "Location",
      value: location,
    },
    ...(preferredLocation
      ? [
          {
            key: "preferred",
            icon: <MapPin className="h-4 w-4" />,
            label: "Preferred location",
            value: preferredLocation,
          } as ContactItem,
        ]
      : []),
    ...(portfolioUrl
      ? [
          {
            key: "portfolio",
            icon: <ExternalLink className="h-4 w-4" />,
            label: "Portfolio",
            value: portfolioUrl,
            href: portfolioUrl,
            isLink: true,
          } as ContactItem,
        ]
      : []),
    ...(websiteUrl
      ? [
          {
            key: "website",
            icon: <ExternalLink className="h-4 w-4" />,
            label: "Website",
            value: websiteUrl,
            href: websiteUrl,
            isLink: true,
          } as ContactItem,
        ]
      : []),
  ];

  const useTwoColumns = items.length > 4;
  const primaryItems = useTwoColumns ? items.filter((i) => !i.isLink) : items;
  const linkItems = useTwoColumns ? items.filter((i) => i.isLink) : [];

  return (
    <DetailCard title="Contact">
      <div className={cn(useTwoColumns ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-0")}>
        <div className={useTwoColumns ? "space-y-0" : undefined}>
          {primaryItems.map((item) => (
            <ContactRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              value={item.value}
              href={item.href}
              onCopy={item.onCopy}
            />
          ))}
        </div>
        {linkItems.length > 0 && (
          <div className={cn(useTwoColumns && "border-l border-gray-100 pl-4 sm:pl-4")}>
            {linkItems.map((item) => (
              <ContactRow
                key={item.key}
                icon={item.icon}
                label={item.label}
                value={item.value}
                href={item.href}
              />
            ))}
          </div>
        )}
      </div>
    </DetailCard>
  );
}

function AvatarInitials({
  name,
  size,
  variant = "round",
  dark = false,
}: {
  name: string;
  size?: "sm" | "lg";
  variant?: "round" | "card";
  dark?: boolean;
}) {
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-semibold text-white",
          BTN_RADIUS,
        )}
      >
        {initials}
      </div>
    );
  }

  const sizeClass = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-9 w-9 text-xs" : "h-9 w-9 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold text-white",
        sizeClass,
        BTN_RADIUS,
        dark
          ? "bg-gradient-to-br from-blue-600 to-indigo-700"
          : "bg-gradient-to-br from-blue-500 to-indigo-600",
      )}
    >
      {initials}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  href,
  external,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50",
    BTN_RADIUS,
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
      >
        {icon}
        {label}
        {external && <ExternalLink className="h-3 w-3 opacity-60" />}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  onCopy,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  href?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {value ? (
          href ? (
            <a href={href} className="break-all text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            <p className="text-sm text-gray-900">{value}</p>
          )
        ) : (
          <p className="text-sm text-gray-400">Not available</p>
        )}
      </div>
      {value && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
