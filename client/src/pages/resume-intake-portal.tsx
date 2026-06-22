import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
  Minimize2,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBulkResumeImport } from "@/contexts/bulk-resume-import-context";
import {
  BULK_IMPORT_BATCH_SIZE,
  BULK_UPLOAD_LIMIT,
  createApiUrl,
  getBulkImportApiBase,
} from "@/lib/bulk-resume-import-config";
import { DATA_ENTRY_PORTAL_TITLE } from "@shared/data-entry-roles";
import { useEmployeeAuth, useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import DataEntrySettingsModal from "@/components/resume-intake/data-entry-settings-modal";
import { useState } from "react";
import { useLocation } from "wouter";
import staffosLogo from "@/assets/staffos logo 2.png";

type RecentUpload = {
  id: string;
  candidateId: string | null;
  fullName: string | null;
  email: string | null;
  createdAt: string | null;
  pipelineStatus: string | null;
};

type Stats = {
  totalUploaded: number;
  todayUploaded: number;
  lastLoginAt: string | null;
};

type RecentUploadsResponse = {
  rows: RecentUpload[];
  total: number;
};

type DataEntryProfile = {
  name?: string;
  email?: string;
  phone?: string | null;
  employeeId?: string;
  joiningDate?: string | null;
};

const RECENT_UPLOADS_PAGE_SIZE = 10;

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function ResumeIntakePortal() {
  const employee = useEmployeeAuth();
  const { logout, beginSignOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recentUploadsPage, setRecentUploadsPage] = useState(0);

  const {
    isImportModalOpen,
    setIsImportModalOpen,
    isImportModalMinimized,
    isBulkUpload,
    setIsBulkUpload,
    bulkFiles,
    bulkParsedResults,
    importStep,
    setImportStep,
    isProcessing,
    setIsProcessing,
    importResults,
    setImportResults,
    bulkParseProgress,
    showImportCloseConfirm,
    setShowImportCloseConfirm,
    importModalHasUnsavedProgress,
    handleImportModalOpenChange,
    confirmLeaveImportModal,
    resetImportModal,
    runBulkParse,
    expandImportModal,
    minimizeImportModal,
    setBulkFiles,
    setBulkParsedResults,
  } = useBulkResumeImport();

  useEffect(() => {
    setIsBulkUpload(true);
  }, [setIsBulkUpload]);

  const { data: profile } = useQuery<DataEntryProfile>({
    queryKey: ["/api/data-entry/profile"],
    retry: false,
  });

  const profileName = profile?.name || employee?.name || "User";
  const profileEmployeeId = profile?.employeeId || employee?.employeeId || "—";
  const profileJoiningDate = profile?.joiningDate || employee?.joiningDate;

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/data-entry/stats"],
    refetchInterval: 60_000,
  });

  const { data: recentUploadsData } = useQuery<RecentUploadsResponse>({
    queryKey: ["/api/data-entry/recent-uploads", recentUploadsPage],
    queryFn: async () => {
      const offset = recentUploadsPage * RECENT_UPLOADS_PAGE_SIZE;
      const response = await fetch(
        createApiUrl(
          `/api/data-entry/recent-uploads?limit=${RECENT_UPLOADS_PAGE_SIZE}&offset=${offset}`,
        ),
        { credentials: "include" },
      );
      if (!response.ok) {
        throw new Error("Failed to load recent uploads");
      }
      return response.json();
    },
    refetchInterval: 60_000,
  });

  const recentUploads = recentUploadsData?.rows ?? [];
  const recentUploadsTotal = recentUploadsData?.total ?? 0;
  const recentUploadsTotalPages = Math.max(
    1,
    Math.ceil(recentUploadsTotal / RECENT_UPLOADS_PAGE_SIZE),
  );

  useEffect(() => {
    if (recentUploadsPage > 0 && recentUploadsPage >= recentUploadsTotalPages) {
      setRecentUploadsPage(Math.max(0, recentUploadsTotalPages - 1));
    }
  }, [recentUploadsPage, recentUploadsTotalPages]);

  const showRecentUploadsPagination = recentUploadsTotal > 0;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void runBulkParse(acceptedFiles);
    },
    [runBulkParse],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    disabled: isProcessing,
    maxFiles: BULK_UPLOAD_LIMIT,
  });

  const openBulkUpload = () => {
    if (isProcessing || importModalHasUnsavedProgress()) {
      expandImportModal();
      return;
    }
    resetImportModal();
    setIsBulkUpload(true);
    expandImportModal();
  };

  const handleBulkImport = async () => {
    const validCandidates = bulkParsedResults
      .filter((r) => r.success && r.data?.fullName && r.data?.email)
      .map((r) => ({
        fullName: r.data!.fullName,
        email: r.data!.email,
        phone: r.data!.phone,
        designation: r.data!.designation,
        experience: r.data!.experience,
        skills: r.data!.skills,
        location: r.data!.location,
        company: r.data!.company,
        education: r.data!.education,
        linkedinUrl: r.data!.linkedinUrl,
        portfolioUrl: r.data!.portfolioUrl,
        websiteUrl: r.data!.websiteUrl,
        currentRole: r.data!.currentRole,
        filePath: r.data!.filePath,
        fileName: r.fileName,
      }));

    if (validCandidates.length === 0) {
      toast({
        title: "No valid resumes",
        description: "No resumes with both name and email were found.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const apiBase = getBulkImportApiBase(location);
    const aggregated = {
      total: validCandidates.length,
      successCount: 0,
      failedCount: 0,
      results: [] as Array<{ fileName: string; success: boolean; error?: string }>,
    };

    try {
      for (let offset = 0; offset < validCandidates.length; offset += BULK_IMPORT_BATCH_SIZE) {
        const chunk = validCandidates.slice(offset, offset + BULK_IMPORT_BATCH_SIZE);
        const response = await fetch(createApiUrl(`${apiBase}/import-candidates-bulk`), {
          method: "POST",
          body: JSON.stringify({ candidates: chunk }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        let chunkResult: {
          message?: string;
          successCount?: number;
          failedCount?: number;
          results?: typeof aggregated.results;
        } = {};
        try {
          chunkResult = await response.json();
        } catch {
          // non-JSON
        }

        if (!response.ok || !Array.isArray(chunkResult.results)) {
          const msg = chunkResult.message || "Failed to import a batch";
          chunk.forEach((c) => {
            aggregated.failedCount += 1;
            aggregated.results.push({ fileName: c.fileName, success: false, error: msg });
          });
          continue;
        }

        aggregated.successCount += chunkResult.successCount ?? 0;
        aggregated.failedCount += chunkResult.failedCount ?? 0;
        aggregated.results.push(...chunkResult.results);
      }

      setImportResults(aggregated);
      setImportStep("result");
      setRecentUploadsPage(0);
      queryClient.invalidateQueries({ queryKey: ["/api/data-entry/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/data-entry/recent-uploads"] });

      toast({
        title: "Import complete",
        description: `${aggregated.successCount} imported, ${aggregated.failedCount} failed.`,
        variant: aggregated.successCount > 0 ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to import candidates.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validImportCount = bulkParsedResults.filter(
    (r) => r.success && r.data?.fullName && r.data?.email,
  ).length;

  const handleConfirmLogout = async () => {
    setLogoutConfirmOpen(false);
    setIsLoggingOut(true);
    beginSignOut();
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been signed out successfully.",
      });
      window.location.href = "/employer-login";
    } catch {
      window.location.href = "/employer-login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={staffosLogo}
              alt="StaffOS logo"
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              StaffOS
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="View profile"
                      className="h-9 w-9"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Profile</TooltipContent>
              </Tooltip>
              <PopoverContent
                align="end"
                className="w-64 border border-slate-200 bg-slate-50 p-0 shadow-lg dark:border-slate-600 dark:bg-slate-800"
              >
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/60">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profileName}
                  </p>
                </div>
                <div className="space-y-3 px-4 py-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Employee ID
                    </p>
                    <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                      {profileEmployeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Joining date
                    </p>
                    <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(profileJoiningDate)}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Settings"
                  className="h-9 w-9"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLogoutConfirmOpen(true)}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {DATA_ENTRY_PORTAL_TITLE}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Bulk resume upload workspace
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats?.totalUploaded ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Uploaded today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{stats?.todayUploaded ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Last login</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {formatDateTime(stats?.lastLoginAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Bulk resume upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Upload up to {BULK_UPLOAD_LIMIT} resumes per session (PDF, DOC, DOCX). Files are parsed,
              reviewed, then imported into the database.
            </p>
            <Button onClick={openBulkUpload} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="mr-2 h-4 w-4" />
              Start bulk upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg">Recent uploads</CardTitle>
            {showRecentUploadsPagination && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={recentUploadsPage === 0}
                  onClick={() => setRecentUploadsPage((page) => Math.max(0, page - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {Array.from({ length: recentUploadsTotalPages }, (_, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={recentUploadsPage === index ? "default" : "outline"}
                      size="sm"
                      className="h-8 min-w-8 px-2.5"
                      onClick={() => setRecentUploadsPage(index)}
                      aria-label={`Page ${index + 1}`}
                      aria-current={recentUploadsPage === index ? "page" : undefined}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={recentUploadsPage >= recentUploadsTotalPages - 1}
                  onClick={() =>
                    setRecentUploadsPage((page) =>
                      Math.min(recentUploadsTotalPages - 1, page + 1),
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 font-medium">Uploaded on</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">
                        No uploads yet. Start a bulk upload to add resumes.
                      </td>
                    </tr>
                  ) : (
                    recentUploads.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-3 pr-4">{row.fullName || "—"}</td>
                        <td className="py-3 pr-4">{row.email || "—"}</td>
                        <td className="py-3">{formatDateTime(row.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={isImportModalOpen && !isImportModalMinimized}
        onOpenChange={handleImportModalOpenChange}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (isProcessing && importStep === "upload") {
              e.preventDefault();
              minimizeImportModal();
              return;
            }
            if (importModalHasUnsavedProgress()) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk resume upload
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {importStep === "upload" && (
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 hover:border-primary/50 dark:border-slate-600"
                }`}
              >
                <input {...getInputProps()} />
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Parsing batch {bulkParseProgress?.batch ?? 0} of{" "}
                      {bulkParseProgress?.totalBatches ?? 1}…
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bulkParseProgress?.filesDone ?? 0} / {bulkParseProgress?.fileTotal ?? bulkFiles.length}{" "}
                      files
                    </p>
                  </div>
                ) : (
                  <>
                    <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop resumes here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Up to {BULK_UPLOAD_LIMIT} files · PDF, DOC, DOCX
                    </p>
                  </>
                )}
              </div>
            )}

            {importStep === "confirm" && (
              <div className="space-y-4">
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800 dark:text-emerald-200">
                      {validImportCount} of {bulkParsedResults.length} ready to import
                    </span>
                  </div>
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {bulkParsedResults.map((r, i) => (
                    <div
                      key={`${r.fileName}-${i}`}
                      className={`flex items-center gap-2 ${r.success && r.data?.fullName && r.data?.email ? "text-slate-700" : "text-red-600"}`}
                    >
                      {r.success && r.data?.fullName && r.data?.email ? (
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {r.fileName}
                        {r.data?.fullName ? ` — ${r.data.fullName}` : r.error ? ` — ${r.error}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importStep === "result" && importResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <div className="text-2xl font-bold">{importResults.total}</div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20">
                    <div className="text-2xl font-bold text-emerald-600">{importResults.successCount}</div>
                    <div className="text-xs text-emerald-600">Imported</div>
                  </div>
                  <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                    <div className="text-2xl font-bold text-red-600">{importResults.failedCount}</div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-wrap gap-2">
            {importStep === "upload" && isProcessing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="icon" onClick={() => minimizeImportModal()}>
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Minimize</TooltipContent>
              </Tooltip>
            )}

            {importStep === "upload" && !isProcessing && (
              <Button variant="outline" onClick={() => handleImportModalOpenChange(false)}>
                Cancel
              </Button>
            )}

            {importStep === "confirm" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportStep("upload");
                    setBulkFiles([]);
                    setBulkParsedResults([]);
                  }}
                >
                  Back
                </Button>
                <Button onClick={() => void handleBulkImport()} disabled={isProcessing || validImportCount === 0}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    `Import ${validImportCount} candidates`
                  )}
                </Button>
              </>
            )}

            {importStep === "result" && (
              <Button
                onClick={() => {
                  setIsImportModalOpen(false);
                  resetImportModal();
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showImportCloseConfirm} onOpenChange={setShowImportCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard upload progress?</AlertDialogTitle>
            <AlertDialogDescription>
              Parsed resume data will be lost if you close now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeaveImportModal}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataEntrySettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={(profile as { name?: string; phone?: string; email?: string }) || employee}
        onProfileUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/data-entry/profile"] });
        }}
      />

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of the Resume Upload Hub. Any unsaved upload progress in this
              tab will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmLogout();
              }}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLoggingOut ? "Logging out…" : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
