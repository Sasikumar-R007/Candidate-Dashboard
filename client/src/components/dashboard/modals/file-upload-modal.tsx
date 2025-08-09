import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  title: string;
  accept?: string;
  isUploading?: boolean;
}

export default function FileUploadModal({
  open,
  onOpenChange,
  onUpload,
  title,
  accept = "*",
  isUploading = false
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-4"></i>
          
          {selectedFile ? (
            <div>
              <p className="text-green-600 mb-2">Selected: {selectedFile.name}</p>
              <p className="text-gray-600 mb-2">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
              <label className="text-secondary-blue hover:underline cursor-pointer">
                browse files
                <input 
                  type="file" 
                  className="hidden" 
                  accept={accept}
                  onChange={handleFileChange}
                />
              </label>
            </>
          )}
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-secondary-blue hover:bg-blue-600"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
