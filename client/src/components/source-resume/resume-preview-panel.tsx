import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Download, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveUploadAssetUrl } from "@/lib/resolve-upload-url";

type LoadState = "loading" | "ready" | "unavailable";

function getExtension(url: string): string {
  const path = url.split("?")[0].toLowerCase();
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot) : "";
}

async function probeResumeUrl(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", credentials: "omit" });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, { method: "GET", credentials: "omit" });
      return get.ok;
    }
    return false;
  } catch {
    return false;
  }
}

type ResumePreviewPanelProps = {
  resumeFile: string;
  candidateName?: string;
};

export function ResumePreviewPanel({ resumeFile, candidateName }: ResumePreviewPanelProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  const resumeUrl = useMemo(
    () => resolveUploadAssetUrl(resumeFile, "uploads/resumes"),
    [resumeFile],
  );

  const ext = resumeUrl ? getExtension(resumeUrl) : "";
  const isPdf = ext === ".pdf";
  const isDocx = ext === ".docx";
  const isDoc = ext === ".doc" && !isDocx;
  const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

  const verifyAndLoad = useCallback(async () => {
    if (!resumeUrl) {
      setLoadState("unavailable");
      return;
    }
    setLoadState("loading");
    const ok = await probeResumeUrl(resumeUrl);
    setLoadState(ok ? "ready" : "unavailable");
  }, [resumeUrl]);

  useEffect(() => {
    void verifyAndLoad();
  }, [verifyAndLoad, retryKey]);

  const openResume = () => {
    if (resumeUrl) window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  if (!resumeUrl || loadState === "unavailable") {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-gray-50 p-8 text-center dark:bg-gray-900">
        <FileText className="mb-4 h-16 w-16 text-gray-400" />
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resume not available</p>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {candidateName
            ? `We could not load the resume for ${candidateName}. It may be missing on the server or still processing.`
            : "The resume file could not be loaded from the server."}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setRetryKey((k) => k + 1)}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (loadState === "loading") {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-3 text-sm text-gray-500">Loading resume…</p>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="relative h-full w-full min-h-[400px]">
        <iframe
          key={`${resumeUrl}-${retryKey}`}
          src={resumeUrl}
          className="h-full w-full border-0"
          title="Resume Preview"
          onError={() => setLoadState("unavailable")}
        />
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="relative flex h-full min-h-[400px] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <img
          src={resumeUrl}
          alt="Resume"
          className="max-h-full max-w-full object-contain"
          onError={() => setLoadState("unavailable")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-gray-50 p-8 text-center dark:bg-gray-900">
      <FileText className="mb-4 h-16 w-16 text-gray-400" />
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {isDocx || isDoc ? "Word document" : "Resume file"}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        This format cannot be previewed in the browser. Download to view.
      </p>
      <Button type="button" className="mt-6 bg-blue-600 text-white hover:bg-blue-700" onClick={openResume}>
        <Download className="mr-2 h-4 w-4" />
        Download resume
      </Button>
    </div>
  );
}
