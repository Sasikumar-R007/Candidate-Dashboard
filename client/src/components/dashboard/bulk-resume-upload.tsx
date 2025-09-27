import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Upload, X, FileText, AlertCircle, CheckCircle, Download, RefreshCw } from "lucide-react";
import { useMutation, useQuery } from '@tanstack/react-query';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'failed';
  progress: number;
  error?: string;
}

interface BulkUploadJob {
  id: string;
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  totalFiles: string;
  processedFiles: string;
  successfulFiles: string;
  failedFiles: string;
  errorReportUrl?: string;
  createdAt: string;
  completedAt?: string;
}

interface BulkUploadFile {
  id: string;
  originalName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  errorMessage?: string;
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
}

interface JobStatusResponse {
  job: BulkUploadJob;
  files: BulkUploadFile[];
}

export default function BulkResumeUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Accepted file types
  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file count
    if (acceptedFiles.length + files.length > 1000) {
      toast({
        title: "Too many files",
        description: "Maximum 1000 files allowed per batch",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1000,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setCurrentJobId(null);
    setShowResults(false);
    setUploadProgress(0);
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
  };

  // Job status polling
  const { data: jobStatus, refetch: refetchJobStatus } = useQuery({
    queryKey: ['bulkUploadStatus', currentJobId],
    queryFn: async (): Promise<JobStatusResponse> => {
      if (!currentJobId) throw new Error('No job ID');
      const response = await fetch(`/api/admin/bulk-upload-jobs/${currentJobId}/status`);
      if (!response.ok) throw new Error('Failed to fetch job status');
      return response.json();
    },
    enabled: !!currentJobId,
    refetchInterval: 2000
  });

  // Bulk upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (filesToUpload: UploadedFile[]) => {
      const formData = new FormData();
      filesToUpload.forEach(({ file }) => {
        formData.append('resumes', file);
      });
      formData.append('adminId', 'admin'); // In real app, get from user context

      const response = await fetch('/api/admin/bulk-resume-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setIsUploading(false);
      
      // Mark all files as processing
      setFiles(prev => prev.map(file => ({ ...file, status: 'processing', progress: 100 })));

      toast({
        title: "Upload Complete",
        description: `${data.totalFiles} files uploaded successfully. Processing started.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Start polling for status
      startStatusPolling();
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Mark all files as failed
      setFiles(prev => prev.map(file => ({ 
        ...file, 
        status: 'failed', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      })));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  });

  const startStatusPolling = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    statusCheckIntervalRef.current = setInterval(() => {
      refetchJobStatus();
    }, 2000);
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    uploadMutation.mutate(files);
  };

  // Download error report
  const downloadErrorReport = () => {
    if (currentJobId) {
      const link = document.createElement('a');
      link.href = `/api/admin/bulk-upload-jobs/${currentJobId}/error-report`;
      link.download = `bulk-upload-errors-${currentJobId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Show results when job is completed
  useEffect(() => {
    if (jobStatus?.job?.status === 'completed' || jobStatus?.job?.status === 'failed') {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      setShowResults(true);
    }
  }, [jobStatus?.job?.status]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card data-testid="bulk-upload-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Resume Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            data-testid="dropzone"
          >
            <input {...getInputProps()} data-testid="file-input" />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop resume files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF and DOCX files • Max 10MB per file • Up to 1000 files
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Selected Files ({files.length})</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFiles}
                    disabled={isUploading}
                    data-testid="clear-files-button"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || files.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="upload-button"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {files.length} Files
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* File Preview List */}
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={file.file.name}>
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file.size)} • {file.file.type.includes('pdf') ? 'PDF' : 'DOCX'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      {!isUploading && file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          data-testid={`remove-file-${file.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {currentJobId && jobStatus && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-900">Processing Status</h3>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(jobStatus.job.status)}
                    data-testid="job-status-badge"
                  >
                    {jobStatus.job.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Total Files</p>
                    <p className="text-lg font-semibold">{jobStatus.job.totalFiles}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Processed</p>
                    <p className="text-lg font-semibold">{jobStatus.job.processedFiles}</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Successful</p>
                    <p className="text-lg font-semibold text-green-700">{jobStatus.job.successfulFiles}</p>
                  </div>
                  <div>
                    <p className="text-red-600 font-medium">Failed</p>
                    <p className="text-lg font-semibold text-red-700">{jobStatus.job.failedFiles}</p>
                  </div>
                </div>
                {jobStatus.job.status === 'processing' && (
                  <div className="mt-3">
                    <Progress 
                      value={(parseInt(jobStatus.job.processedFiles) / parseInt(jobStatus.job.totalFiles)) * 100} 
                      className="w-full"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Processing {jobStatus.job.processedFiles} of {jobStatus.job.totalFiles} files...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Results</DialogTitle>
            <DialogDescription>
              Processing completed. Here are the results for your bulk resume upload.
            </DialogDescription>
          </DialogHeader>
          
          {jobStatus && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{jobStatus.job.successfulFiles}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{jobStatus.job.failedFiles}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{jobStatus.job.totalFiles}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              {parseInt(jobStatus.job.failedFiles) > 0 && (
                <div className="flex justify-center">
                  <Button 
                    onClick={downloadErrorReport} 
                    variant="outline"
                    data-testid="download-error-report-button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Report
                  </Button>
                </div>
              )}

              {/* Detailed Results */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-medium">File Processing Details</h4>
                {jobStatus.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        {file.extractedName && (
                          <p className="text-xs text-gray-600">Name: {file.extractedName}</p>
                        )}
                        {file.extractedEmail && (
                          <p className="text-xs text-gray-600">Email: {file.extractedEmail}</p>
                        )}
                        {file.errorMessage && (
                          <p className="text-xs text-red-600">Error: {file.errorMessage}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}