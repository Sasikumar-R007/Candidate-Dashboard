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
import { parseRequirementJdExtras } from "@shared/requirement-jd-extras";
import { Check, FileText, Upload, X, Plus, Trash2 } from "lucide-react";

interface AddRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    position?: string;
    noOfPositions?: number;
    splitRequirement?: boolean;
    criticality?: string;
    toughness?: string;
    company?: string;
    spoc?: string;
    talentAdvisor?: string;
    teamLead?: string;
    jdFile?: string;
    jdText?: string;
    sourceType?: string;
    sourceDetails?: string;
    reRequirementContext?: {
      actionType?: string;
      candidate?: string;
      assignedTL?: string;
      assignedTA?: string;
      offeredDate?: string;
      joinedDate?: string;
      selectedDate?: string;
      sourceRequirementId?: string;
    };
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
  const isEditMode = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    position: initialData?.position || '',
    noOfPositions: initialData?.noOfPositions || 1,
    splitRequirement: initialData?.splitRequirement || false,
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
  const [positionsInput, setPositionsInput] = useState<string>(String(initialData?.noOfPositions ?? 1));
  const [instructions, setInstructions] = useState('');
  /** Additional TL names when split requirement is enabled (Team Leader 2, 3, …). */
  const [additionalTeamLeads, setAdditionalTeamLeads] = useState<string[]>([]);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        position: initialData.position || prev.position,
        noOfPositions: initialData.noOfPositions || prev.noOfPositions,
        splitRequirement: initialData.splitRequirement || false,
        criticality: initialData.criticality || prev.criticality,
        toughness: initialData.toughness || prev.toughness,
        company: initialData.company || prev.company,
        spoc: initialData.spoc || prev.spoc,
        talentAdvisor: initialData.talentAdvisor || prev.talentAdvisor,
        teamLead: initialData.teamLead || prev.teamLead,
      }));
      setPositionsInput(String(initialData.noOfPositions ?? 1));
      // If JD file URL is provided in initialData, set it as preview URL
      if (initialData.jdFile) {
        setJdFilePreviewUrl(initialData.jdFile);
      }
      // If JD text is provided, set it
      if (initialData.jdText) {
        setJdText(initialData.jdText);
      }
      const extras = parseRequirementJdExtras(initialData);
      setInstructions(extras.specialInstructions || '');
    } else if (isOpen) {
      setFormData({
        position: '',
        noOfPositions: 1,
        splitRequirement: false,
        criticality: '',
        toughness: '',
        company: '',
        spoc: '',
        talentAdvisor: '',
        teamLead: ''
      });
      setPositionsInput('1');
      setJdText('');
      setJdFile(null);
      setJdFilePreviewUrl(null);
      setAdditionalTeamLeads([]);
      setInstructions('');
    }
  }, [initialData, isOpen]);

  // Fetch all employees from backend
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees'],
    enabled: isOpen,
  });

  // Filter team leads from employees
  const teamLeads = employees.filter(emp => emp.role === 'team_leader');

  const createRequirementMutation = useMutation({
    mutationFn: async (
      data: typeof formData & {
        jdFile?: string | null;
        jdText?: string | null;
        sourceType?: string | null;
        sourceDetails?: string | null;
        additionalTeamLeads?: string[];
        specialInstructions?: string | null;
      },
    ) => {
      const response = await apiRequest("POST", "/api/admin/requirements", {
        ...data,
        talentAdvisor: null,
        teamLead: data.teamLead === "Unassigned" ? null : data.teamLead,
        jdFile: data.jdFile || null,
        jdText: data.jdText || null,
        sourceType: data.sourceType || null,
        sourceDetails: data.sourceDetails || null,
        specialInstructions: data.specialInstructions?.trim() || null,
        additionalTeamLeads: data.additionalTeamLeads || [],
        preservedRoleId: jdIdToDelete || undefined,
        createdAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: async (result: { requirements?: unknown[]; count?: number; sharedRoleId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requirements"] });

      if (jdIdToDelete) {
        try {
          await apiRequest("DELETE", `/api/admin/requirements/${jdIdToDelete}`);
          queryClient.invalidateQueries({ queryKey: ["/api/admin/client-jds"] });
        } catch (error) {
          console.error("Failed to delete JD requirement:", error);
        }
      }

      const createdCount = Array.isArray(result?.requirements)
        ? result.requirements.length
        : 1;
      const sharedRoleId = result?.sharedRoleId;

      toast({
        title: "Success",
        description:
          createdCount > 1
            ? `${createdCount} requirements created for selected teams${sharedRoleId ? ` (Role ID ${sharedRoleId})` : ""}.`
            : "Requirement added successfully!",
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

  const updateRequirementMutation = useMutation({
    mutationFn: async (data: typeof formData & { jdFile?: string | null; jdText?: string | null; sourceType?: string | null; sourceDetails?: string | null; specialInstructions?: string | null }) => {
      const response = await apiRequest('PATCH', `/api/admin/requirements/${initialData?.id}`, {
        ...data,
        teamLead: data.teamLead === 'Unassigned' ? null : data.teamLead,
        jdFile: data.jdFile || null,
        jdText: data.jdText || null,
        specialInstructions: data.specialInstructions?.trim() || null,
        sourceType: data.sourceType || null,
        sourceDetails: data.sourceDetails || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archived-requirements'] });
      toast({
        title: "Success",
        description: "Requirement updated successfully!",
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
        description: "Failed to update requirement. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.criticality || !formData.toughness || !formData.company || !formData.spoc || !formData.teamLead || formData.teamLead === 'Unassigned') {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields including Team Leader.",
        variant: "destructive",
      });
      return;
    }

    if (formData.splitRequirement) {
      const extraLeads = additionalTeamLeads.map((name) => name.trim()).filter(Boolean);
      if (extraLeads.length === 0) {
        toast({
          title: "Split Requirement",
          description: "Select at least one additional Team Leader (Team Leader 2).",
          variant: "destructive",
        });
        return;
      }
      const allLeads = [formData.teamLead, ...extraLeads];
      if (new Set(allLeads).size !== allLeads.length) {
        toast({
          title: "Duplicate Team Leaders",
          description: "Each Team Leader in a split requirement must be different.",
          variant: "destructive",
        });
        return;
      }
    }
    if (!jdFilePreviewUrl && !jdFile && !jdText.trim()) {
      toast({
        title: "Missing JD",
        description: "Please provide either a JD file or JD text.",
        variant: "destructive",
      });
      return;
    }
    if (!Number.isFinite(formData.noOfPositions) || formData.noOfPositions < 1) {
      toast({
        title: "Invalid Positions",
        description: "No. of positions must be at least 1.",
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

      const payload = {
        ...formData,
        noOfPositions: Number(formData.noOfPositions) || 1,
        splitRequirement: formData.splitRequirement,
        additionalTeamLeads: formData.splitRequirement
          ? additionalTeamLeads.map((name) => name.trim()).filter(Boolean)
          : [],
        jdFile: jdFileUrl,
        jdText: jdText.trim() || null,
        sourceType: initialData?.sourceType || null,
        sourceDetails: initialData?.sourceDetails || null,
        specialInstructions: instructions.trim() || null,
      };

      if (isEditMode) {
        updateRequirementMutation.mutate(payload);
      } else {
        createRequirementMutation.mutate(payload);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} requirement. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      position: '',
      noOfPositions: 1,
      splitRequirement: false,
      criticality: '',
      toughness: '',
      company: '',
      spoc: '',
      talentAdvisor: '',
      teamLead: ''
    });
    setPositionsInput('1');
    setAdditionalTeamLeads([]);
    setInstructions('');
    setJdText('');
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

  const handlePositionsChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, '');
    setPositionsInput(sanitized);

    if (sanitized === '') {
      setFormData(prev => ({
        ...prev,
        noOfPositions: 0,
      }));
      return;
    }

    const parsed = Number(sanitized);
    setFormData(prev => ({
      ...prev,
      noOfPositions: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
    }));
  };

  const handlePositionsBlur = () => {
    if (!positionsInput || Number(positionsInput) < 1) {
      setPositionsInput('1');
      setFormData(prev => ({
        ...prev,
        noOfPositions: 1,
      }));
    }
  };

  const handleSplitRequirementToggle = () => {
    if (isEditMode) return;
    setFormData((prev) => {
      const nextSplit = !prev.splitRequirement;
      if (nextSplit) {
        setAdditionalTeamLeads((current) => (current.length === 0 ? [""] : current));
      } else {
        setAdditionalTeamLeads([]);
      }
      return { ...prev, splitRequirement: nextSplit };
    });
  };

  const getTeamLeadOptionsForSlot = (slotIndex: number | 'primary') => {
    const selected = new Set<string>();
    if (formData.teamLead && formData.teamLead !== 'Unassigned') {
      selected.add(formData.teamLead);
    }
    additionalTeamLeads.forEach((name, index) => {
      if (slotIndex !== index && name) {
        selected.add(name);
      }
    });
    return teamLeads.filter(
      (lead) => !selected.has(lead.name) || (slotIndex === 'primary' ? formData.teamLead === lead.name : additionalTeamLeads[slotIndex as number] === lead.name),
    );
  };

  const canAddAnotherTeamLead = () => {
    const selectedCount =
      (formData.teamLead && formData.teamLead !== 'Unassigned' ? 1 : 0) +
      additionalTeamLeads.filter((name) => name.trim()).length;
    return selectedCount < teamLeads.length;
  };

  const handleAddTeamLeadSlot = () => {
    if (!canAddAnotherTeamLead()) return;
    setAdditionalTeamLeads((prev) => [...prev, '']);
  };

  const handleRemoveTeamLeadSlot = (index: number) => {
    setAdditionalTeamLeads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdditionalTeamLeadChange = (index: number, value: string) => {
    setAdditionalTeamLeads((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden" data-testid="modal-add-requirement">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Requirement' : 'Add New Requirement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[85vh] overflow-y-auto px-6 py-5 space-y-6">
          {initialData?.sourceType === 're_require' && initialData?.reRequirementContext && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Re-Require
                </span>
                <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Requirement recreated from a closure exception
                </p>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-rose-900 dark:text-rose-100 md:grid-cols-2">
                <p>Candidate: {initialData.reRequirementContext.candidate || '-'}</p>
                <p>Action: {initialData.reRequirementContext.actionType || '-'}</p>
                <p>Assigned TL: {initialData.reRequirementContext.assignedTL || '-'}</p>
                <p>Assigned TA: {initialData.reRequirementContext.assignedTA || '-'}</p>
                <p>Offered Date: {initialData.reRequirementContext.offeredDate || '-'}</p>
                <p>Joined Date: {initialData.reRequirementContext.joinedDate || '-'}</p>
                <p>Selected Date: {initialData.reRequirementContext.selectedDate || '-'}</p>
                <p>Source Requirement ID: {initialData.reRequirementContext.sourceRequirementId || '-'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Position *
              </Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="HR"
                className="bg-gray-50 border-slate-200 placeholder:text-slate-300 dark:bg-gray-800 dark:border-slate-700 dark:placeholder:text-slate-500"
                required
                data-testid="input-position"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company *
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Gumlet Marketing Private Limited"
                className="bg-gray-50 border-slate-200 placeholder:text-slate-300 dark:bg-gray-800 dark:border-slate-700 dark:placeholder:text-slate-500"
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
                placeholder="Dheena"
                className="bg-gray-50 border-slate-200 placeholder:text-slate-300 dark:bg-gray-800 dark:border-slate-700 dark:placeholder:text-slate-500"
                required
                data-testid="input-spoc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noOfPositions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No. of Positions *
              </Label>
              <Input
                id="noOfPositions"
                type="text"
                inputMode="numeric"
                min={1}
                value={positionsInput}
                onChange={(e) => handlePositionsChange(e.target.value)}
                onBlur={handlePositionsBlur}
                placeholder="1"
                className="bg-gray-50 border-slate-200 placeholder:text-slate-300 dark:bg-gray-800 dark:border-slate-700 dark:placeholder:text-slate-500"
                required
                data-testid="input-no-of-positions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Criticality *
              </Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) => handleInputChange('criticality', value)}
                required
              >
                <SelectTrigger className="bg-gray-50 border-slate-200 dark:bg-gray-800 dark:border-slate-700" data-testid="select-criticality">
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
                <SelectTrigger className="bg-gray-50 border-slate-200 dark:bg-gray-800 dark:border-slate-700" data-testid="select-toughness">
                  <SelectValue placeholder="Select toughness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Tough">Tough</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamLead" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Leader *
              </Label>
              <Select
                value={formData.teamLead}
                onValueChange={(value) => handleInputChange('teamLead', value)}
                disabled={isLoadingEmployees}
              >
                <SelectTrigger className="h-10 bg-gray-50 border-slate-200 dark:bg-gray-800 dark:border-slate-700" data-testid="select-team-lead">
                  <SelectValue placeholder={isLoadingEmployees ? "Loading..." : "Select team leader"} />
                </SelectTrigger>
                <SelectContent>
                  {getTeamLeadOptionsForSlot('primary').map((lead) => (
                    <SelectItem key={lead.id} value={lead.name}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Split Requirement
              </Label>
              <button
                type="button"
                onClick={handleSplitRequirementToggle}
                disabled={isEditMode}
                title={isEditMode ? "Split teams are set when creating a requirement" : "Assign this requirement to multiple team leaders as separate records"}
                className={`flex h-10 w-full items-center gap-2 rounded-md border px-3 text-left transition-colors ${
                  isEditMode
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                    : formData.splitRequirement
                      ? 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
                data-testid="button-split-requirement"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    formData.splitRequirement
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm font-medium truncate">Split</span>
              </button>
            </div>
          </div>

          {formData.splitRequirement && !isEditMode && (
            <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
              <p className="text-xs text-sky-800 dark:text-sky-300">
                One requirement record per team — same details, JD, and instructions.
              </p>
              {additionalTeamLeads.map((teamLeadValue, index) => (
                <div key={`additional-tl-${index}`} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Team Leader {index + 2} *
                    </Label>
                    <Select
                      value={teamLeadValue}
                      onValueChange={(value) => handleAdditionalTeamLeadChange(index, value)}
                      disabled={isLoadingEmployees}
                    >
                      <SelectTrigger
                        className="bg-white border-slate-200 dark:bg-gray-800 dark:border-slate-700"
                        data-testid={`select-team-lead-${index + 2}`}
                      >
                        <SelectValue placeholder="Select team leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTeamLeadOptionsForSlot(index).map((lead) => (
                          <SelectItem key={lead.id} value={lead.name}>
                            {lead.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {additionalTeamLeads.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveTeamLeadSlot(index)}
                      data-testid={`button-remove-team-lead-${index + 2}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {canAddAnotherTeamLead() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-sky-300 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:text-sky-300"
                  onClick={handleAddTeamLeadSlot}
                  data-testid="button-add-team-lead"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add TL
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Notes or instructions for the team working on this requirement..."
              rows={3}
              className="resize-y bg-gray-50 border-slate-200 dark:bg-gray-800 dark:border-slate-700"
              data-testid="textarea-instructions"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              JD File *
            </Label>
            {jdFilePreviewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">JD Files.pdf</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {jdFile ? `${(jdFile.size / 1024).toFixed(0)}KB of 128 KB` : '89KB of 128 KB'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveJdFile}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  id="jdFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleJdFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="jdFile"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 dark:bg-gray-800"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Click to upload JD file</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequirementMutation.isPending || updateRequirementMutation.isPending || isUploadingJd}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-[6px]"
              data-testid="button-add-requirement"
            >
              {isUploadingJd ? 'Uploading JD...' : isEditMode ? (updateRequirementMutation.isPending ? 'Updating...' : 'Update Requirement') : (createRequirementMutation.isPending ? 'Adding...' : 'Submit Requirement')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
