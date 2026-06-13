import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBulkResumeImport } from "@/contexts/bulk-resume-import-context";

export function BulkImportFloatingBubble() {
  const [location, navigate] = useLocation();
  const {
    isImportModalOpen,
    isImportModalMinimized,
    isBulkUpload,
    isProcessing,
    importStep,
    bulkParseProgress,
    bulkFiles,
    expandImportModal,
  } = useBulkResumeImport();

  const showBubble =
    isImportModalOpen &&
    isBulkUpload &&
    isProcessing &&
    importStep === "upload" &&
    (isImportModalMinimized || location !== "/master-database");

  if (!showBubble) return null;

  const done = bulkParseProgress?.filesDone ?? 0;
  const total = bulkParseProgress?.fileTotal ?? bulkFiles.length;

  const handleExpand = () => {
    expandImportModal();
    if (location !== "/master-database") {
      navigate("/master-database");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={handleExpand}
            className="relative h-14 w-14 rounded-md shadow-lg ring-1 ring-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all"
            data-testid="bubble-expand-import"
          >
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-md bg-background px-1.5 text-[11px] font-semibold text-primary border border-primary/30 shadow-sm">
              {done}/{total}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          Maximize
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
