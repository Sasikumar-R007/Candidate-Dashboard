import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  BULK_PARSE_BATCH_RETRIES,
  BULK_PARSE_BATCH_SIZE,
  BULK_UPLOAD_LIMIT,
  createApiUrl,
  getBulkImportApiBase,
  getBulkImportPortalPath,
  type BulkParseProgress,
  type BulkParseResult,
  type BulkImportResults,
  type ImportStep,
  type ParsedResumeFields,
} from "@/lib/bulk-resume-import-config";
import { BulkImportFloatingBubble } from "@/components/master-database/bulk-import-floating-bubble";

type SingleCandidateForm = {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  experience: string;
  skills: string;
  location: string;
  company: string;
  education: string;
  linkedinUrl: string;
  portfolioUrl: string;
  websiteUrl: string;
  currentRole: string;
};

const emptySingleForm = (): SingleCandidateForm => ({
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  experience: "",
  skills: "",
  location: "",
  company: "",
  education: "",
  linkedinUrl: "",
  portfolioUrl: "",
  websiteUrl: "",
  currentRole: "",
});

type BulkResumeImportContextValue = {
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isImportModalMinimized: boolean;
  setIsImportModalMinimized: (minimized: boolean) => void;
  isBulkUpload: boolean;
  setIsBulkUpload: (bulk: boolean) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  bulkFiles: File[];
  setBulkFiles: (files: File[]) => void;
  parsedData: ParsedResumeFields | null;
  setParsedData: (data: ParsedResumeFields | null) => void;
  bulkParsedResults: BulkParseResult[];
  setBulkParsedResults: (results: BulkParseResult[]) => void;
  importStep: ImportStep;
  setImportStep: (step: ImportStep) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  singleCandidateForm: SingleCandidateForm;
  setSingleCandidateForm: React.Dispatch<React.SetStateAction<SingleCandidateForm>>;
  importResults: BulkImportResults | null;
  setImportResults: (results: BulkImportResults | null) => void;
  bulkParseProgress: BulkParseProgress | null;
  showImportCloseConfirm: boolean;
  setShowImportCloseConfirm: (show: boolean) => void;
  BULK_UPLOAD_LIMIT: number;
  importModalHasUnsavedProgress: () => boolean;
  handleImportModalOpenChange: (open: boolean) => void;
  confirmLeaveImportModal: () => void;
  resetImportModal: () => void;
  runBulkParse: (acceptedFiles: File[]) => Promise<void>;
  expandImportModal: () => void;
  minimizeImportModal: () => void;
};

const BulkResumeImportContext = createContext<BulkResumeImportContextValue | null>(null);

export function BulkResumeImportProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const parseSessionIdRef = useRef(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportModalMinimized, setIsImportModalMinimized] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<ParsedResumeFields | null>(null);
  const [bulkParsedResults, setBulkParsedResults] = useState<BulkParseResult[]>([]);
  const [importStep, setImportStep] = useState<ImportStep>("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [singleCandidateForm, setSingleCandidateForm] = useState<SingleCandidateForm>(emptySingleForm);
  const [importResults, setImportResults] = useState<BulkImportResults | null>(null);
  const [bulkParseProgress, setBulkParseProgress] = useState<BulkParseProgress | null>(null);
  const [showImportCloseConfirm, setShowImportCloseConfirm] = useState(false);

  const expandImportModal = useCallback(() => {
    setIsImportModalMinimized(false);
    setIsImportModalOpen(true);
  }, []);

  const minimizeImportModal = useCallback(() => {
    setIsImportModalMinimized(true);
  }, []);

  useEffect(() => {
    const portalPath = getBulkImportPortalPath(location);
    if (
      location !== portalPath &&
      location !== "/master-database" &&
      isImportModalOpen &&
      isProcessing &&
      isBulkUpload &&
      importStep === "upload"
    ) {
      setIsImportModalMinimized(true);
    }
  }, [location, isImportModalOpen, isProcessing, isBulkUpload, importStep]);

  const resetImportModal = useCallback(() => {
    parseSessionIdRef.current += 1;
    setUploadedFile(null);
    setBulkFiles([]);
    setParsedData(null);
    setBulkParsedResults([]);
    setImportStep("upload");
    setIsProcessing(false);
    setIsImportModalMinimized(false);
    setBulkParseProgress(null);
    setSingleCandidateForm(emptySingleForm());
    setImportResults(null);
  }, []);

  const importModalHasUnsavedProgress = useCallback(() => {
    if (isProcessing) return true;
    if (importStep === "confirm") {
      if (isBulkUpload && bulkParsedResults.length > 0) return true;
      if (!isBulkUpload && parsedData) return true;
    }
    return false;
  }, [isProcessing, importStep, isBulkUpload, bulkParsedResults.length, parsedData]);

  const handleImportModalOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        expandImportModal();
        return;
      }
      if (isProcessing && isBulkUpload && importStep === "upload") {
        minimizeImportModal();
        return;
      }
      if (importModalHasUnsavedProgress()) {
        setShowImportCloseConfirm(true);
        return;
      }
      setIsImportModalOpen(false);
      resetImportModal();
    },
    [
      expandImportModal,
      minimizeImportModal,
      isProcessing,
      isBulkUpload,
      importStep,
      importModalHasUnsavedProgress,
      resetImportModal,
    ],
  );

  const confirmLeaveImportModal = useCallback(() => {
    setShowImportCloseConfirm(false);
    setIsImportModalOpen(false);
    resetImportModal();
  }, [resetImportModal]);

  const runBulkParse = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast({
          title: "No files selected",
          description: "Choose PDF, DOC, or DOCX resume files to upload.",
          variant: "destructive",
        });
        return;
      }

      const limitedFiles = acceptedFiles.slice(0, BULK_UPLOAD_LIMIT);
      if (acceptedFiles.length > BULK_UPLOAD_LIMIT) {
        toast({
          title: "Large selection",
          description: `You selected ${acceptedFiles.length} files. Only the first ${BULK_UPLOAD_LIMIT} will be parsed (recommended per session).`,
        });
      }

      const sessionId = ++parseSessionIdRef.current;
      expandImportModal();
      setBulkFiles(limitedFiles);
      setIsProcessing(true);
      const totalBatches = Math.max(1, Math.ceil(limitedFiles.length / BULK_PARSE_BATCH_SIZE));
      setBulkParseProgress({
        batch: 0,
        totalBatches,
        filesDone: 0,
        fileTotal: limitedFiles.length,
      });

      const failedBatchRows = (batch: File[], reason: string): BulkParseResult[] =>
        batch.map((file) => ({
          fileName: file.name,
          success: false,
          error: reason,
        }));

      const parseOneBatch = async (batch: File[]): Promise<BulkParseResult[]> => {
        const formData = new FormData();
        batch.forEach((file) => {
          formData.append("resumes", file);
        });

        const response = await fetch(
          createApiUrl(`${getBulkImportApiBase(location)}/parse-resumes-bulk`),
          {
          method: "POST",
          body: formData,
          credentials: "include",
        },
        );

        let result: { message?: string; results?: BulkParseResult[] } = {};
        try {
          result = await response.json();
        } catch {
          // non-JSON (e.g. gateway timeout HTML)
        }

        if (!response.ok || !Array.isArray(result.results)) {
          throw new Error(
            result.message || "Server could not parse this batch (timeout or error).",
          );
        }

        return result.results;
      };

      try {
        const allResults: BulkParseResult[] = [];

        for (let offset = 0; offset < limitedFiles.length; offset += BULK_PARSE_BATCH_SIZE) {
          if (parseSessionIdRef.current !== sessionId) return;

          const batchIndex = Math.floor(offset / BULK_PARSE_BATCH_SIZE) + 1;
          const batch = limitedFiles.slice(offset, offset + BULK_PARSE_BATCH_SIZE);
          setBulkParseProgress({
            batch: batchIndex,
            totalBatches,
            filesDone: offset,
            fileTotal: limitedFiles.length,
          });

          let batchRows: BulkParseResult[] | null = null;
          let lastError = "Unknown error";

          for (let attempt = 0; attempt < BULK_PARSE_BATCH_RETRIES; attempt++) {
            try {
              batchRows = await parseOneBatch(batch);
              break;
            } catch (err: unknown) {
              lastError =
                err instanceof Error ? err.message : "Failed to parse batch";
              if (attempt < BULK_PARSE_BATCH_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
              }
            }
          }

          if (parseSessionIdRef.current !== sessionId) return;

          if (batchRows) {
            allResults.push(...batchRows);
          } else {
            allResults.push(
              ...failedBatchRows(
                batch,
                lastError || `Batch ${batchIndex} failed after retries`,
              ),
            );
          }
        }

        if (parseSessionIdRef.current !== sessionId) return;

        setBulkParseProgress({
          batch: totalBatches,
          totalBatches,
          filesDone: limitedFiles.length,
          fileTotal: limitedFiles.length,
        });

        if (allResults.length === 0) {
          toast({
            title: "Parsing failed",
            description:
              limitedFiles.length > 0
                ? `None of the ${limitedFiles.length} resume(s) could be parsed. Try again with up to ${BULK_UPLOAD_LIMIT} smaller PDF/DOC files, or check that the API server and OpenAI key are configured.`
                : "No resume files were processed. Select resume files and try again.",
            variant: "destructive",
          });
          return;
        }

        setBulkParsedResults(allResults);
        setImportStep("confirm");
        expandImportModal();
        const portalPath = getBulkImportPortalPath(location);
        if (location !== portalPath && location !== "/master-database") {
          navigate(portalPath);
        }

        const failedCount = allResults.filter((r) => !r.success).length;
        const validCount = allResults.filter(
          (r) => r.success && r.data?.fullName && r.data?.email,
        ).length;

        toast({
          title: "Parsing complete",
          description:
            validCount > 0
              ? `${validCount} of ${allResults.length} resume(s) are ready to import.${failedCount > 0 ? ` ${failedCount} could not be used.` : ""}`
              : `${allResults.length} file(s) processed, but none have both a name and email. Edit the PDFs or try different files.`,
          variant: validCount > 0 ? "default" : "destructive",
        });
      } catch (error: unknown) {
        if (parseSessionIdRef.current !== sessionId) return;
        console.error("Parse bulk resumes error:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to parse resumes. Please ensure all files are valid PDF, DOC, or DOCX files and try again.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        if (parseSessionIdRef.current === sessionId) {
          setIsProcessing(false);
        }
      }
    },
    [toast, expandImportModal, location, navigate],
  );

  const value: BulkResumeImportContextValue = {
    isImportModalOpen,
    setIsImportModalOpen,
    isImportModalMinimized,
    setIsImportModalMinimized,
    isBulkUpload,
    setIsBulkUpload,
    uploadedFile,
    setUploadedFile,
    bulkFiles,
    setBulkFiles,
    parsedData,
    setParsedData,
    bulkParsedResults,
    setBulkParsedResults,
    importStep,
    setImportStep,
    isProcessing,
    setIsProcessing,
    singleCandidateForm,
    setSingleCandidateForm,
    importResults,
    setImportResults,
    bulkParseProgress,
    showImportCloseConfirm,
    setShowImportCloseConfirm,
    BULK_UPLOAD_LIMIT,
    importModalHasUnsavedProgress,
    handleImportModalOpenChange,
    confirmLeaveImportModal,
    resetImportModal,
    runBulkParse,
    expandImportModal,
    minimizeImportModal,
  };

  return (
    <BulkResumeImportContext.Provider value={value}>
      {children}
      <BulkImportFloatingBubble />
    </BulkResumeImportContext.Provider>
  );
}

export function useBulkResumeImport() {
  const ctx = useContext(BulkResumeImportContext);
  if (!ctx) {
    throw new Error("useBulkResumeImport must be used within BulkResumeImportProvider");
  }
  return ctx;
}
