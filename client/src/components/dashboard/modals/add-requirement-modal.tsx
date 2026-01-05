import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, X } from "lucide-react";

interface AddRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    position?: string;
    company?: string;
    spoc?: string;
    [key: string]: any;
  } | null;
  onSuccess?: () => void;
  jdIdToDelete?: string | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export default function AddRequirementModal({ isOpen, onClose, initialData, onSuccess, jdIdToDelete }: AddRequirementModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    position: initialData?.position || '',
    criticality: '',
    toughness: '',
    company: initialData?.company || '',
    spoc: initialData?.spoc || '',
    talentAdvisor: '',
    teamLead: ''
  });
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdFilePreviewUrl, setJdFilePreviewUrl] = useState<string | null>(null);
  const [isUploadingJd, setIsUploadingJd] = useState(false);
  const [jdText, setJdText] = useState<string>('');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        position: initialData.position || prev.position,
        company: initialData.company || prev.company,
        spoc: initialData.spoc || prev.spoc,
      }));
      // If JD file URL is provided in initialData, set it as preview URL
      if (initialData.jdFile) {
        setJdFilePreviewUrl(initialData.jdFile);
      }
      // If JD text is provided, set it
      if (initialData.jdText) {
        setJdText(initialData.jdText);
      }
    }
  }, [initialData]);

  // Fetch all employees from backend
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees'],
    enabled: isOpen,
  });

  // Filter team leads from employees
  const teamLeads = employees.filter(emp => emp.role === 'team_leader');

  const createRequirementMutation = useMutation({
    mutationFn: async (data: typeof formData & { jdFile?: string | null; jdText?: string | null }) => {
      const response = await apiRequest('POST', '/api/admin/requirements', {
        ...data,
        // Admin doesn't assign TA - TL will assign later
        talentAdvisor: null,
        teamLead: data.teamLead === 'Unassigned' ? null : data.teamLead,
        jdFile: data.jdFile || null,
        jdText: data.jdText || null,
        createdAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/requirements'] });
      
      // Delete the JD requirement if it was converted from a client JD
      if (jdIdToDelete) {
        try {
          await apiRequest('DELETE', `/api/admin/requirements/${jdIdToDelete}`);
          queryClient.invalidateQueries({ queryKey: ['/api/admin/client-jds'] });
        } catch (error) {
          console.error('Failed to delete JD requirement:', error);
          // Don't show error to user, just log it
        }
      }
      
      toast({
        title: "Success",
        description: "Requirement added successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add requirement. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.criticality || !formData.toughness || !formData.company || !formData.spoc) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let jdFileUrl = null;
      
      // If JD file URL is already available (from shared JD), use it directly
      if (jdFilePreviewUrl) {
        jdFileUrl = jdFilePreviewUrl;
      } 
      // Otherwise, upload JD file if present
      else if (jdFile) {
        setIsUploadingJd(true);
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('jdFile', jdFile);
          
          const uploadResponse = await fetch('/api/admin/upload/jd-file', {
            method: 'POST',
            body: formDataUpload,
            credentials: 'include'
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload JD file');
          }
          
          const uploadData = await uploadResponse.json();
          jdFileUrl = uploadData.url;
        } catch (error) {
          toast({
            title: "Upload Error",
            description: "Failed to upload JD file. Please try again.",
            variant: "destructive",
          });
          setIsUploadingJd(false);
          return;
        } finally {
          setIsUploadingJd(false);
        }
      }

      createRequirementMutation.mutate({ ...formData, jdFile: jdFileUrl, jdText: jdText.trim() || null });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      position: '',
      criticality: '',
      toughness: '',
      company: '',
      spoc: '',
      talentAdvisor: '',
      teamLead: ''
    });
    setJdFile(null);
    if (jdFilePreviewUrl) {
      URL.revokeObjectURL(jdFilePreviewUrl);
    }
    setJdFilePreviewUrl(null);
    onClose();
  };

  const handleJdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = /\.(pdf|doc|docx)$/i;
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setJdFile(file);
      const previewUrl = URL.createObjectURL(file);
      setJdFilePreviewUrl(previewUrl);
    }
  };

  const handleRemoveJdFile = () => {
    setJdFile(null);
    if (jdFilePreviewUrl) {
      URL.revokeObjectURL(jdFilePreviewUrl);
    }
    setJdFilePreviewUrl(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-add-requirement">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Requirement
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Position *
            </Label>
            <Input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="input-styled"
              required
              data-testid="input-position"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="criticality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Criticality *
              </Label>
              <Select 
                value={formData.criticality} 
                onValueChange={(value) => handleInputChange('criticality', value)}
                required
              >
                <SelectTrigger className="input-styled" data-testid="select-criticality">
                  <SelectValue placeholder="Select criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toughness" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Toughness *
              </Label>
              <Select 
                value={formData.toughness} 
                onValueChange={(value) => handleInputChange('toughness', value)}
                required
              >
                <SelectTrigger className="input-styled" data-testid="select-toughness">
                  <SelectValue placeholder="Select toughness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Tough">Tough</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company *
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g. TechCorp"
                className="input-styled"
                required
                data-testid="input-company"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spoc" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SPOC *
              </Label>
              <Input
                id="spoc"
                type="text"
                value={formData.spoc}
                onChange={(e) => handleInputChange('spoc', e.target.value)}
                placeholder="e.g. John Doe"
                className="input-styled"
                required
                data-testid="input-spoc"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamLead" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Lead
            </Label>
            <Select 
              value={formData.teamLead} 
              onValueChange={(value) => handleInputChange('teamLead', value)}
              disabled={isLoadingEmployees}
            >
              <SelectTrigger className="input-styled" data-testid="select-team-lead">
                <SelectValue placeholder={isLoadingEmployees ? "Loading..." : "Select team lead"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                {teamLeads.map(lead => (
                  <SelectItem key={lead.id} value={lead.name}>{lead.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {jdFilePreviewUrl ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                JD File
              </Label>
              <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      JD file will be shared from client submission
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">File is already available and will be included</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="jdFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                JD File (Optional)
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="jdFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleJdFileSelect}
                  className="hidden"
                />
                {jdFile ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{jdFile.name}</p>
                          <p className="text-xs text-gray-500">{(jdFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveJdFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="jdFile"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload JD file</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 rounded"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequirementMutation.isPending || isUploadingJd}
              className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-6 py-2 rounded"
              data-testid="button-add-requirement"
            >
              {isUploadingJd ? 'Uploading JD...' : createRequirementMutation.isPending ? 'Adding...' : 'Add Requirement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}