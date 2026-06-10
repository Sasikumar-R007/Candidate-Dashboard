import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building, Tag, BarChart3, Target, FolderOpen, Hash, User, TrendingUp, MapPin, Laptop, Briefcase, DollarSign, Upload, X, Loader2, Plus, Image, Search, RefreshCw, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { mapRequirementToJobForm } from '@shared/requirement-to-job-form';
import {
  formatRoleIdDropdownLabel,
  resolveDisplayRoleId,
  resolveRequirementDisplayId,
} from '@shared/requirement-jd-extras';
import { cn } from '@/lib/utils';

interface JobFormData {
  id?: string | number;
  requirementId?: string;
  companyName: string;
  companyTagline: string;
  companyType: string;
  market: string;
  field: string;
  noOfPositions: string;
  role: string;
  experience: string;
  location: string;
  workMode: string;
  employmentType: string;
  salaryPackage: string;
  aboutCompany: string;
  roleDefinitions: string;
  keyResponsibility: string;
  primarySkills: string[];
  secondarySkills: string[];
  knowledgeOnly: string[];
  companyLogo: string;
}

export type PostJobRequirementOption = {
  id: string;
  displayRequirementId?: string | null;
  position?: string;
  company?: string;
  talentAdvisor?: string | null;
  talentAdvisorId?: string | null;
  managementStatus?: string;
  isRecentlyClosed?: boolean;
  jdText?: string | null;
  sourceDetails?: string | null;
  noOfPositions?: number;
  [key: string]: unknown;
};

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formData: JobFormData;
  setFormData: (data: JobFormData) => void;
  formError: string;
  setFormError: (error: string) => void;
  /** When set, TL must pick a requirement; fields auto-fill and TA is mapped on post. */
  linkableRequirements?: PostJobRequirementOption[];
}

export default function PostJobModal({
  isOpen,
  onClose,
  onSuccess,
  formData,
  setFormData,
  formError,
  setFormError,
  linkableRequirements,
}: PostJobModalProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [skillInputs, setSkillInputs] = useState({ primary: '', secondary: '', knowledge: '' });
  const [selectedClientCompany, setSelectedClientCompany] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isPostingInfoOpen, setIsPostingInfoOpen] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const infoHoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback((id: string) => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
    setActiveDropdown(id);
  }, []);

  const scheduleCloseDropdown = useCallback(() => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
    }
    closeDropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
      closeDropdownTimerRef.current = null;
    }, 120);
  }, []);

  const cancelCloseDropdown = useCallback(() => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
  }, []);
  const openPostingInfo = useCallback(() => {
    if (infoHoverCloseTimerRef.current) {
      clearTimeout(infoHoverCloseTimerRef.current);
      infoHoverCloseTimerRef.current = null;
    }
    setIsPostingInfoOpen(true);
  }, []);

  const scheduleClosePostingInfo = useCallback(() => {
    if (infoHoverCloseTimerRef.current) {
      clearTimeout(infoHoverCloseTimerRef.current);
    }
    infoHoverCloseTimerRef.current = setTimeout(() => {
      setIsPostingInfoOpen(false);
      infoHoverCloseTimerRef.current = null;
    }, 160);
  }, []);

  useEffect(() => {
    return () => {
      if (infoHoverCloseTimerRef.current) {
        clearTimeout(infoHoverCloseTimerRef.current);
      }
    };
  }, []);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getFilteredSkills = (skills: string[] | undefined | null) =>
    (skills || []).filter((s) => s && s.trim() !== "");

  const hasRequiredText = (value: unknown) =>
    value !== undefined && value !== null && String(value).trim() !== "";

  const requiredTextFields = [
    { key: "companyName" as const, label: "Company Name" },
    { key: "role" as const, label: "Role" },
    { key: "experience" as const, label: "Experience" },
    { key: "location" as const, label: "Location" },
    { key: "salaryPackage" as const, label: "Salary Package" },
    { key: "aboutCompany" as const, label: "About Company" },
    { key: "roleDefinitions" as const, label: "Role Definitions" },
    { key: "keyResponsibility" as const, label: "Key Responsibilities" },
  ];

  const handlePositionsChange = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    setFormData({ ...formData, noOfPositions: sanitized });
  };

  const handlePositionsBlur = () => {
    if (!formData.noOfPositions?.trim() || Number(formData.noOfPositions) < 1) {
      setFormData({ ...formData, noOfPositions: "1" });
    }
  };

  const postJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      if (jobData.id) {
        return apiRequest('PUT', `/api/recruiter/jobs/${jobData.id}`, jobData);
      }
      return apiRequest('POST', '/api/recruiter/jobs', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter/jobs/counts'] });
      toast({ title: formData.id ? 'Job updated successfully!' : 'Job posted successfully!', description: formData.id ? 'Your job listing has been updated.' : 'Your job listing is now active.' });
      onClose();
      onSuccess();
      setFormError('');
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to post job', description: error.message || 'Please try again.', variant: 'destructive' });
      setFormError(error.message || 'Failed to post job. Please try again.');
    }
  });

  const postableRequirements = useMemo(() => {
    if (!linkableRequirements?.length) return [];
    return linkableRequirements.filter(
      (req) =>
        !req.isRecentlyClosed &&
        req.managementStatus !== "closed" &&
        (req.talentAdvisorId || req.talentAdvisor),
    );
  }, [linkableRequirements]);

  const clientOptions = useMemo(
    () =>
      Array.from(
        new Set(
          postableRequirements
            .map((req) => String(req.company || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [postableRequirements],
  );

  const roleOptions = useMemo(() => {
    const byRole = new Map<string, { roleId: string; position: string }>();
    for (const req of postableRequirements) {
      const company = String(req.company || "").trim();
      if (!company || (selectedClientCompany && company !== selectedClientCompany)) continue;
      const roleId = resolveDisplayRoleId(req);
      const position = String(req.position || "Role");
      if (!byRole.has(roleId)) {
        byRole.set(roleId, { roleId, position });
      }
    }
    return Array.from(byRole.values()).sort((a, b) => a.roleId.localeCompare(b.roleId));
  }, [postableRequirements, selectedClientCompany]);

  const filteredRequirements = useMemo(
    () =>
      postableRequirements.filter((req) => {
        const company = String(req.company || "").trim();
        const roleId = resolveDisplayRoleId(req);
        if (selectedClientCompany && company !== selectedClientCompany) return false;
        if (selectedRoleId && roleId !== selectedRoleId) return false;
        return true;
      }),
    [postableRequirements, selectedClientCompany, selectedRoleId],
  );

  const requiresRequirementLink = Boolean(linkableRequirements?.length) && !formData.id;

  const getInvalidPostJobFields = (): Set<string> => {
    const invalid = new Set<string>();

    if (requiresRequirementLink) {
      if (!selectedClientCompany) invalid.add("linkClient");
      if (!selectedRoleId) invalid.add("linkRoleId");
      if (!formData.requirementId?.trim()) invalid.add("linkRequirement");
    }

    for (const { key } of requiredTextFields) {
      if (!hasRequiredText(formData[key])) {
        invalid.add(key);
      }
    }

    const positions = parseInt(formData.noOfPositions, 10);
    if (!formData.noOfPositions?.trim() || !Number.isFinite(positions) || positions < 1) {
      invalid.add("noOfPositions");
    }

    if (getFilteredSkills(formData.primarySkills).length === 0) {
      invalid.add("primarySkills");
    }
    if (getFilteredSkills(formData.secondarySkills).length === 0) {
      invalid.add("secondarySkills");
    }

    return invalid;
  };

  const fieldBorder = (field: string, baseClass: string) =>
    cn(
      baseClass,
      invalidFields.has(field) &&
        "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500",
    );

  useEffect(() => {
    if (invalidFields.size === 0) return;
    const currentInvalid = getInvalidPostJobFields();
    setInvalidFields((prev) => {
      const next = new Set(Array.from(prev).filter((field) => currentInvalid.has(field)));
      return next.size === prev.size ? prev : next;
    });
  }, [formData, selectedClientCompany, selectedRoleId, requiresRequirementLink]);

  const applyRequirementSelection = (requirementId: string) => {
    const requirement = postableRequirements.find((r) => r.id === requirementId);
    if (!requirement) return;
    const mapped = mapRequirementToJobForm(requirement);
    setSelectedClientCompany(String(requirement.company || "").trim());
    setSelectedRoleId(resolveDisplayRoleId(requirement));
    setFormData({
      ...formData,
      ...mapped,
      id: undefined,
      requirementId,
    });
    setFormError("");
    setInvalidFields(new Set());
  };

  const handleRequirementSelect = (requirementId: string) => {
    applyRequirementSelection(requirementId);
  };

  const autoSelectRequirementForRole = (
    clientCompany: string,
    roleId: string,
  ) => {
    const matches = postableRequirements.filter((req) => {
      const company = String(req.company || "").trim();
      return company === clientCompany && resolveDisplayRoleId(req) === roleId;
    });
    if (matches.length > 0) {
      applyRequirementSelection(matches[0].id);
    } else {
      setFormData({ ...formData, requirementId: "" });
    }
  };

  const resetForm = () => {
    setSelectedClientCompany("");
    setSelectedRoleId("");
    setFormData({
      requirementId: '',
      companyName: '',
      companyTagline: '',
      companyType: '',
      market: '',
      field: '',
      noOfPositions: '',
      role: '',
      experience: '',
      location: '',
      workMode: '',
      employmentType: '',
      salaryPackage: '',
      aboutCompany: '',
      roleDefinitions: '',
      keyResponsibility: '',
      primarySkills: [],
      secondarySkills: [],
      knowledgeOnly: [],
      companyLogo: ''
    });
    setLogoPreview(null);
    setInvalidFields(new Set());
  };

  const parseExperience = (exp: string): { min: number | null; max: number | null } => {
    if (!exp) return { min: null, max: null };
    const match = exp.match(/(\d+)/g);
    if (match && match.length >= 2) {
      return { min: parseInt(match[0]), max: parseInt(match[1]) };
    } else if (match && match.length === 1) {
      return { min: parseInt(match[0]), max: null };
    }
    return { min: null, max: null };
  };

  useEffect(() => {
    if (!formData.requirementId) return;
    const selectedReq = postableRequirements.find((req) => req.id === formData.requirementId);
    if (!selectedReq) return;
    setSelectedClientCompany(String(selectedReq.company || "").trim());
    setSelectedRoleId(resolveDisplayRoleId(selectedReq));
  }, [formData.requirementId, postableRequirements]);

  const sanitizeSalaryInput = (value: string) => {
    // Allow decimals like 2.2 LPA; normalize to a single dot.
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  };

  const parseSalary = (salary: string): { min: number | null; max: number | null } => {
    if (!salary) return { min: null, max: null };

    const normalized = salary.trim().toLowerCase().replace(/\s+/g, "");
    const rangeParts = normalized.split("-").map((part) => part.replace(/[^0-9.]/g, ""));
    const parseLpa = (value: string): number | null => {
      if (!value) return null;
      const parsed = Number.parseFloat(value);
      if (!Number.isFinite(parsed)) return null;
      return Math.round(parsed * 100000);
    };

    if (rangeParts.length >= 2) {
      return { min: parseLpa(rangeParts[0]), max: parseLpa(rangeParts[1]) };
    }

    return { min: parseLpa(rangeParts[0] || normalized), max: null };
  };

// Custom Suggestions Dropdown Component
const SuggestionsList = ({
  options,
  searchTerm,
  onSelect,
  isVisible,
  onClose,
  onPointerDownInList,
  allowCustomAdd = false,
}: {
  options: string[];
  searchTerm: string;
  onSelect: (val: string) => void;
  isVisible: boolean;
  onClose: () => void;
  onPointerDownInList?: () => void;
  allowCustomAdd?: boolean;
}) => {
  const trimmedRaw = (searchTerm || '').trim();
  const trimmed = trimmedRaw.toLowerCase();
  const filteredOptions = options.filter(
    (opt) => !trimmed || opt.toLowerCase().includes(trimmed),
  );
  const showCustomAdd =
    allowCustomAdd &&
    trimmedRaw.length > 0 &&
    !options.some((opt) => opt.toLowerCase() === trimmed);

  if (!isVisible) return null;

  return (
    <div
      data-suggestion-list
      className="absolute z-50 w-full top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto py-1"
      onMouseDown={(e) => {
        e.preventDefault();
        onPointerDownInList?.();
      }}
    >
      {filteredOptions.map((opt) => (
        <div
          key={opt}
          role="option"
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 cursor-pointer transition-colors font-medium text-left"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(opt);
            onClose();
          }}
        >
          {opt}
        </div>
      ))}
      {showCustomAdd && (
        <div
          role="option"
          className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer transition-colors font-medium text-left border-t border-gray-100 dark:border-gray-800"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(trimmedRaw);
            onClose();
          }}
        >
          Add {trimmedRaw}
        </div>
      )}
      {filteredOptions.length === 0 && !showCustomAdd && (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No matches</div>
      )}
    </div>
  );
};

const deriveLocationType = (workMode: string): string => {
    const lower = workMode.toLowerCase();
    if (lower.includes('remote')) return 'Remote';
    if (lower.includes('hybrid')) return 'Hybrid';
    if (lower.includes('office') || lower.includes('onsite') || lower.includes('on-site')) return 'On-site';
    return 'On-site';
  };

  const deriveEmploymentType = (empType: string): string => {
    const lower = empType.toLowerCase();
    if (lower.includes('full')) return 'Full-time';
    if (lower.includes('part')) return 'Part-time';
    if (lower.includes('contract')) return 'Contract';
    if (lower.includes('intern')) return 'Internship';
    return 'Full-time';
  };

  const handlePostJob = () => {
    const invalid = getInvalidPostJobFields();
    if (invalid.size > 0) {
      setInvalidFields(invalid);
      toast({
        title: "Please complete the highlighted fields",
        variant: "destructive",
      });
      return;
    }

    setInvalidFields(new Set());
    setFormError("");

    const expRange = parseExperience(formData.experience);
    const salaryRange = parseSalary(formData.salaryPackage);
    
    const jobData = {
      id: formData.id,
      title: formData.role || 'Software Developer',
      company: formData.companyName,
      companyTagline: formData.companyTagline,
      companyType: formData.companyType,
      market: formData.market,
      department: formData.field || 'Engineering',
      openings: parseInt(formData.noOfPositions) || 1,
      location: formData.location,
      locationType: formData.workMode,
      experienceMin: expRange.min,
      experienceMax: expRange.max,
      salaryMin: salaryRange.min,
      salaryMax: salaryRange.max,
      description: formData.aboutCompany,
      requirements: formData.roleDefinitions,
      responsibilities: formData.keyResponsibility,
      primarySkills: formData.primarySkills,
      secondarySkills: formData.secondarySkills,
      knowledgeOnly: formData.knowledgeOnly,
      employmentType: formData.employmentType,
      status: 'Active',
      companyLogo: formData.companyLogo || null,
      requirementId: formData.requirementId?.trim() || undefined,
      selectedClientCompany: selectedClientCompany || undefined,
      selectedRoleId: selectedRoleId || undefined,
    };

    postJobMutation.mutate(jobData);
  };

  const addSkill = (type: 'primary' | 'secondary' | 'knowledge', value: string) => {
    if (!value.trim()) return;
    const skillList = type === 'primary' ? 'primarySkills' : type === 'secondary' ? 'secondarySkills' : 'knowledgeOnly';
    const currentSkills = formData[skillList] || [];
    if (currentSkills.includes(value.trim())) return;
    if (currentSkills.length >= 10) return;
    
    setFormData({
      ...formData,
      [skillList]: [...currentSkills, value.trim()]
    });
  };

  const removeSkill = (type: 'primary' | 'secondary' | 'knowledge', index: number) => {
    const skillList = type === 'primary' ? 'primarySkills' : type === 'secondary' ? 'secondarySkills' : 'knowledgeOnly';
    const currentSkills = formData[skillList] || [];
    const newSkills = currentSkills.filter((_, i) => i !== index);
    setFormData({ ...formData, [skillList]: newSkills });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 600 * 1024) {
        toast({ title: 'Logo too large', description: 'Maximum allowed size is 600KB. Your file is ' + Math.round(file.size / 1024) + 'KB.', variant: 'destructive' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid format', description: 'Please upload a proper image file (PNG, JPG, etc.)', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData({ ...formData, companyLogo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData({ ...formData, companyLogo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBackgroundColor = () => {
    const colors = [
      'bg-gradient-to-br from-green-100 to-green-200',
      'bg-gradient-to-br from-pink-100 to-pink-200',
      'bg-gradient-to-br from-orange-100 to-orange-200',
      'bg-gradient-to-br from-blue-100 to-blue-200',
      'bg-gradient-to-br from-yellow-100 to-yellow-200',
      'bg-gradient-to-br from-purple-100 to-purple-200',
    ];
    const index = formData.companyName.length % colors.length;
    return colors[index];
  };

  const allSkills = [
    ...getFilteredSkills(formData.primarySkills),
    ...getFilteredSkills(formData.secondarySkills),
    ...getFilteredSkills(formData.knowledgeOnly)
  ];

  return (
    <>
      {/* Post Job Modal */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDropdown(null);
            onClose();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle>{formData.id ? 'Edit Job' : 'Post the job'}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-400 hover:text-blue-600 h-8 w-8 p-0 rounded-full transition-colors"
              title="Reset Form"
            >
              <RefreshCw size={16} />
            </Button>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
            
            <div className="space-y-4">
              {/* Required fields notice */}
              <div className="text-sm text-red-500 mb-4">* Required fields</div>
              
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              {requiresRequirementLink && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Label className="text-sm font-semibold text-gray-800">Link to requirement *</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Select Client, Role ID, and Requirement. Job details auto-fill; the mapped TA receives applicants.
                      </p>
                    </div>
                    <Popover open={isPostingInfoOpen} onOpenChange={setIsPostingInfoOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          aria-label="Posting flow information"
                          data-testid="button-post-job-flow-info"
                          onMouseEnter={openPostingInfo}
                          onMouseLeave={scheduleClosePostingInfo}
                          onClick={() => setIsPostingInfoOpen((prev) => !prev)}
                        >
                          <Info size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-96 text-sm space-y-2 bg-blue-50 border border-blue-200"
                        onMouseEnter={openPostingInfo}
                        onMouseLeave={scheduleClosePostingInfo}
                      >
                        <p className="font-semibold text-slate-800">Job posting flow</p>
                        <p className="text-slate-600">
                          Normal (not split): select Client, Role ID, and Requirement; posting succeeds and mapped TA gets applications.
                        </p>
                        <p className="text-slate-600">
                          Split requirements: multiple Requirements can share one Role ID. Only first post is allowed for that Role ID (first come, first serve).
                        </p>
                        <p className="text-slate-600">
                          If already posted for same Role ID, system blocks with: <span className="font-medium">Job already Posted for this JD</span>.
                        </p>
                        <p className="text-slate-600">
                          Candidate applications are distributed round-robin across split Requirements and their assigned TAs.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5 px-1">
                    <Label className="text-xs text-gray-600">Select Client</Label>
                    <Select
                      value={selectedClientCompany}
                      onValueChange={(value) => {
                        setSelectedClientCompany(value);
                        setSelectedRoleId("");
                        setFormData({ ...formData, requirementId: "" });
                      }}
                    >
                      <SelectTrigger
                        className={fieldBorder(
                          "linkClient",
                          "bg-slate-100 border-slate-300 h-10 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0",
                        )}
                        data-testid="select-post-job-client"
                      >
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientOptions.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No client companies
                          </SelectItem>
                        ) : (
                          clientOptions.map((company) => (
                            <SelectItem key={company} value={company}>
                              {company}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 px-1">
                    <Label className="text-xs text-gray-600">Select Role ID</Label>
                    <Select
                      value={selectedRoleId}
                      onValueChange={(value) => {
                        setSelectedRoleId(value);
                        autoSelectRequirementForRole(selectedClientCompany, value);
                      }}
                      disabled={!selectedClientCompany}
                    >
                      <SelectTrigger
                        className={fieldBorder(
                          "linkRoleId",
                          "bg-slate-100 border-slate-300 h-10 disabled:bg-slate-200 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0",
                        )}
                        data-testid="select-post-job-role-id"
                      >
                        <SelectValue placeholder="Select Role ID" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No role IDs
                          </SelectItem>
                        ) : (
                          roleOptions.map((role) => (
                            <SelectItem key={role.roleId} value={role.roleId}>
                              {formatRoleIdDropdownLabel(role.roleId, role.position)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-slate-500">
                      First posted Role ID is locked for duplicate job posting.
                    </p>
                  </div>

                  <div className="space-y-1.5 px-1">
                    <Label className="text-xs text-gray-600">Requirement</Label>
                    <Select
                      value={formData.requirementId || ""}
                      onValueChange={handleRequirementSelect}
                      disabled={!selectedRoleId}
                    >
                      <SelectTrigger
                        className={fieldBorder(
                          "linkRequirement",
                          "bg-slate-100 border-slate-300 h-10 disabled:bg-slate-200 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0",
                        )}
                        data-testid="select-linked-requirement"
                      >
                        <SelectValue placeholder="Select Requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredRequirements.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No matching requirements
                          </SelectItem>
                        ) : (
                          filteredRequirements.map((req) => (
                            <SelectItem key={req.id} value={req.id}>
                              {resolveRequirementDisplayId(req, req.displayRequirementId ?? undefined)} ·{" "}
                              {req.position}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!selectedRoleId && (
                      <p className="text-[11px] text-slate-500">Choose Client and Role ID first.</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Company Name */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Building size={16} />
                </div>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className={fieldBorder(
                    "companyName",
                    "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400",
                  )}
                  placeholder="Company Name *"
                  data-testid="input-company-name"
                />
              </div>

              {/* Company Tagline */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  <Tag size={16} />
                </div>
                <Input
                  value={formData.companyTagline}
                  onChange={(e) => setFormData({...formData, companyTagline: e.target.value})}
                  className="pl-10 bg-gray-50 rounded-sm border pr-16 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                  placeholder="Company Tagline (max 100 characters)"
                  data-testid="input-company-tagline"
                  maxLength={100}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] font-medium">
                  {formData.companyTagline?.length || 0}/100
                </span>
              </div>

              {/* Row 1: Company Type, Market */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <BarChart3 size={16} />
                  </div>
                  <Input
                    value={formData.companyType}
                    onFocus={() => openDropdown('companyType')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, companyType: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                    placeholder="Company Type"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'companyType'}
                    searchTerm={formData.companyType}
                    options={["MNC", "Startup", "Product Based", "Service Based", "Corporate", "Mid-size"]}
                    onSelect={(val) => setFormData({...formData, companyType: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Target size={16} />
                  </div>
                  <Input
                    value={formData.market}
                    onFocus={() => openDropdown('market')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, market: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                    placeholder="Market"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'market'}
                    searchTerm={formData.market}
                    options={["Domestic", "International", "B2B", "B2C", "SaaS", "Fintech", "Healthcare"]}
                    onSelect={(val) => setFormData({...formData, market: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
              </div>

              {/* Row 2: Field, No of Positions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <FolderOpen size={16} />
                  </div>
                  <Input
                    value={formData.field}
                    onFocus={() => openDropdown('field')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                    placeholder="Field"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'field'}
                    searchTerm={formData.field}
                    options={["Engineering", "Marketing", "Sales", "Human Resources", "Finance", "Operations", "Design"]}
                    onSelect={(val) => setFormData({...formData, field: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Hash size={16} />
                  </div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formData.noOfPositions}
                    onChange={(e) => handlePositionsChange(e.target.value)}
                    onBlur={handlePositionsBlur}
                    className={fieldBorder(
                      "noOfPositions",
                      "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    )}
                    placeholder="No of Positions"
                    data-testid="input-positions"
                  />
                </div>
              </div>

              {/* Row 3: Role, Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <User size={16} />
                  </div>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className={fieldBorder(
                      "role",
                      "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400",
                    )}
                    placeholder="Role *"
                    data-testid="input-role"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <TrendingUp size={16} />
                  </div>
                  <Input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className={fieldBorder(
                      "experience",
                      "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400",
                    )}
                    placeholder="Experience (in years) *"
                    data-testid="input-experience"
                  />
                </div>
              </div>

              {/* Row 4: Location, Work Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <MapPin size={16} />
                  </div>
                  <Input
                    value={formData.location}
                    onFocus={() => openDropdown('location')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={fieldBorder(
                      "location",
                      "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400",
                    )}
                    placeholder="Location *"
                    data-testid="input-location"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'location'}
                    searchTerm={formData.location}
                    options={["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Remote"]}
                    onSelect={(val) => setFormData({...formData, location: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Laptop size={16} />
                  </div>
                  <Input
                    value={formData.workMode}
                    onFocus={() => openDropdown('workMode')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                    placeholder="Work Type"
                    data-testid="input-work-type"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'workMode'}
                    searchTerm={formData.workMode}
                    options={["On-site", "Remote", "Hybrid"]}
                    onSelect={(val) => setFormData({...formData, workMode: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
              </div>

              {/* Row 5: Employment Type, Salary Package */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <Briefcase size={16} />
                  </div>
                  <Input
                    value={formData.employmentType}
                    onFocus={() => openDropdown('employmentType')}
                    onBlur={scheduleCloseDropdown}
                    onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                    className="pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400"
                    placeholder="Employment Type"
                    data-testid="input-employment-type"
                  />
                  <SuggestionsList 
                    isVisible={activeDropdown === 'employmentType'}
                    searchTerm={formData.employmentType}
                    options={["Full-time", "Part-time", "Contract", "Internship"]}
                    onSelect={(val) => setFormData({...formData, employmentType: val})}
                    onClose={() => setActiveDropdown(null)}
                    onPointerDownInList={cancelCloseDropdown}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 z-10">
                    <DollarSign size={16} />
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    value={formData.salaryPackage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryPackage: sanitizeSalaryInput(e.target.value),
                      })
                    }
                    className={fieldBorder(
                      "salaryPackage",
                      "pl-10 bg-gray-50 rounded-sm border focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-gray-400",
                    )}
                    placeholder="Salary Package in LPA* e.g. 15"
                    data-testid="input-salary"
                  />
                </div>
              </div>

              {/* About Company */}
              <div className="relative">
                <textarea
                  value={formData.aboutCompany}
                  onChange={(e) => setFormData({...formData, aboutCompany: e.target.value})}
                  className={fieldBorder(
                    "aboutCompany",
                    "w-full bg-gray-50 border rounded-sm p-3 min-h-[140px] text-sm resize-none pr-16 placeholder:text-gray-400",
                  )}
                  placeholder="About Company * (max 1000 characters)"
                  data-testid="textarea-about-company"
                  maxLength={1000}
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-[10px] font-medium">
                  {formData.aboutCompany?.length || 0}/1000
                </span>
              </div>

              {/* Role Definitions */}
              <div className="relative">
                <textarea
                  value={formData.roleDefinitions}
                  onChange={(e) => setFormData({...formData, roleDefinitions: e.target.value})}
                  className={fieldBorder(
                    "roleDefinitions",
                    "w-full bg-gray-50 border rounded-sm p-3 min-h-[140px] text-sm resize-none pr-16 placeholder:text-gray-400",
                  )}
                  placeholder="Role Definitions * (max 1500 characters)"
                  data-testid="textarea-role-definitions"
                  maxLength={1500}
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-[10px] font-medium">
                  {formData.roleDefinitions?.length || 0}/1500
                </span>
              </div>

              {/* Key Responsibility */}
              <div className="relative">
                <textarea
                  value={formData.keyResponsibility}
                  onChange={(e) => setFormData({...formData, keyResponsibility: e.target.value})}
                  className={fieldBorder(
                    "keyResponsibility",
                    "w-full bg-gray-50 border rounded-sm p-3 min-h-[140px] text-sm resize-none pr-20 placeholder:text-gray-400",
                  )}
                  placeholder="Key Responsibilities * (Enter as bullet points or sentences)"
                  data-testid="textarea-key-responsibility"
                  maxLength={2000}
                />
                <span className="absolute right-3 bottom-3 text-gray-400 text-[10px] font-medium">
                  {formData.keyResponsibility?.length || 0}/2000
                </span>
              </div>

              {/* Add up to 15 skills */}
              <div className="space-y-6">
                <Label className="text-sm font-bold text-gray-900 block mb-2">Add Skills</Label>
                
                {/* Primary Skills */}
                <div
                  className={cn(
                    "space-y-3 rounded-md",
                    invalidFields.has("primarySkills") && "border border-red-500 ring-1 ring-red-500 p-2",
                  )}
                >
                  <Label className="text-xs text-gray-500 font-medium block">
                    Primary Skills <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 max-w-sm relative">
                    <Input 
                      value={skillInputs.primary}
                      onFocus={() => openDropdown('primarySkill')}
                      onBlur={scheduleCloseDropdown}
                      onChange={(e) => setSkillInputs({...skillInputs, primary: e.target.value})}
                      placeholder="Add primary skill..."
                      className="bg-gray-50 h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('primary', skillInputs.primary);
                          setSkillInputs({...skillInputs, primary: ''});
                        }
                      }}
                    />
                    <SuggestionsList 
                      isVisible={activeDropdown === 'primarySkill'}
                      searchTerm={skillInputs.primary}
                      options={["Java", "Python", "React", "Angular", "Node.js", "AWS", "SQL", "Project Management"]}
                      allowCustomAdd
                      onSelect={(val) => {
                        addSkill('primary', val);
                        setSkillInputs({...skillInputs, primary: ''});
                      }}
                      onClose={() => setActiveDropdown(null)}
                      onPointerDownInList={cancelCloseDropdown}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addSkill('primary', skillInputs.primary);
                        setSkillInputs({...skillInputs, primary: ''});
                      }}
                      className="h-9 w-9 bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.primarySkills || []).filter(s => s && s.trim() !== '').map((skill, index) => (
                      <Badge key={index} className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-medium">
                        {skill}
                        <X size={12} className="cursor-pointer hover:text-blue-900" onClick={() => removeSkill('primary', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Secondary Skills */}
                <div
                  className={cn(
                    "space-y-3 rounded-md",
                    invalidFields.has("secondarySkills") && "border border-red-500 ring-1 ring-red-500 p-2",
                  )}
                >
                  <Label className="text-xs text-gray-500 font-medium block">
                    Secondary Skills <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 max-w-sm relative">
                    <Input 
                      value={skillInputs.secondary}
                      onFocus={() => openDropdown('secondarySkill')}
                      onBlur={scheduleCloseDropdown}
                      onChange={(e) => setSkillInputs({...skillInputs, secondary: e.target.value})}
                      placeholder="Add secondary skill..."
                      className="bg-gray-50 h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('secondary', skillInputs.secondary);
                          setSkillInputs({...skillInputs, secondary: ''});
                        }
                      }}
                    />
                    <SuggestionsList 
                      isVisible={activeDropdown === 'secondarySkill'}
                      searchTerm={skillInputs.secondary}
                      options={["Git", "Docker", "Jira", "TypeScript", "CSS", "HTML", "Communication"]}
                      allowCustomAdd
                      onSelect={(val) => {
                        addSkill('secondary', val);
                        setSkillInputs({...skillInputs, secondary: ''});
                      }}
                      onClose={() => setActiveDropdown(null)}
                      onPointerDownInList={cancelCloseDropdown}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addSkill('secondary', skillInputs.secondary);
                        setSkillInputs({...skillInputs, secondary: ''});
                      }}
                      className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.secondarySkills || []).filter(s => s && s.trim() !== '').map((skill, index) => (
                      <Badge key={index} className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-medium">
                        {skill}
                        <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => removeSkill('secondary', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Knowledge Only */}
                <div className="space-y-3">
                  <Label className="text-xs text-gray-500 font-medium block">Knowledge Only</Label>
                  <div className="flex gap-2 max-w-sm relative">
                    <Input 
                      value={skillInputs.knowledge}
                      onFocus={() => openDropdown('knowledgeSkill')}
                      onBlur={scheduleCloseDropdown}
                      onChange={(e) => setSkillInputs({...skillInputs, knowledge: e.target.value})}
                      placeholder="Add knowledge-only skill..."
                      className="bg-gray-50 h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('knowledge', skillInputs.knowledge);
                          setSkillInputs({...skillInputs, knowledge: ''});
                        }
                      }}
                    />
                    <SuggestionsList 
                      isVisible={activeDropdown === 'knowledgeSkill'}
                      searchTerm={skillInputs.knowledge}
                      options={["Machine Learning", "Blockchain", "AI", "Cybersecurity", "Data Science"]}
                      allowCustomAdd
                      onSelect={(val) => {
                        addSkill('knowledge', val);
                        setSkillInputs({...skillInputs, knowledge: ''});
                      }}
                      onClose={() => setActiveDropdown(null)}
                      onPointerDownInList={cancelCloseDropdown}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addSkill('knowledge', skillInputs.knowledge);
                        setSkillInputs({...skillInputs, knowledge: ''});
                      }}
                      className="h-9 w-9 bg-gray-600 hover:bg-gray-700 shrink-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.knowledgeOnly || []).filter(s => s && s.trim() !== '').map((skill, index) => (
                      <Badge key={index} className="bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-medium">
                        {skill}
                        <X size={12} className="cursor-pointer hover:text-gray-900" onClick={() => removeSkill('knowledge', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Logo - Optional with Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Image size={16} className="text-blue-500" />
                  Company Logo <span className="text-gray-400 text-xs font-normal">(Optional - Max 500KB)</span>
                </Label>
                
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-50">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={removeLogo}
                      className="text-red-500 border-red-200"
                      data-testid="button-remove-logo"
                    >
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-md p-4 text-center cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="dropzone-logo"
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload company logo</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended size: 200x200px, Max: 500KB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="input-logo-file"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-50 text-blue-600 border-blue-200 rounded-[4px]"
                  onClick={() => setIsPreviewModalOpen(true)}
                  disabled={postJobMutation.isPending}
                  data-testid="button-preview-job"
                >
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 text-white rounded-[4px] disabled:bg-gray-300 disabled:text-gray-500"
                  onClick={handlePostJob}
                  disabled={postJobMutation.isPending}
                  data-testid="button-post-job"
                >
                  {postJobMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {formData.id ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    formData.id ? 'Update Job' : 'Post the Job'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal - Job Card Design matching Job Board */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-blue-50 dark:bg-blue-900/30">
          <DialogHeader>
            <DialogTitle>Job Card Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Job Card matching Job Board design */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
              <div className="flex gap-4">
                {/* Company Logo Section */}
                <div className="flex-shrink-0">
                  <div className={`${getBackgroundColor()} rounded-2xl p-6 w-36 h-52 flex flex-col items-center justify-center shadow-sm`}>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company logo"
                        className="w-16 h-16 rounded object-cover mb-3"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center mb-3">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                      {formData.companyName ? formData.companyName.split(' ')[0] : 'Company'}
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex-1 relative">
                  {/* Bookmark Button */}
                  <button className="absolute top-0 right-0 p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>

                  <div className="pr-12">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {formData.companyName || 'Company Name'}
                    </h3>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      {formData.role || 'Job Title'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {formData.companyTagline || formData.aboutCompany?.substring(0, 60) || 'Technology Product based hyper growth, innovative company.'}
                      {formData.aboutCompany && formData.aboutCompany.length > 60 ? '...' : ''}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {formData.experience || 'Experience'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formData.salaryPackage || 'Salary'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formData.location || 'Location'}
                      </span>
                      <span>{formData.workMode || 'Work from office'}</span>
                      <span>{formData.employmentType || 'Full Time'}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 px-3 py-1 rounded-md text-xs font-medium border border-red-200 dark:border-red-700">
                        Open Positions ~ {formData.noOfPositions || '1'}
                      </span>
                      {formData.companyType && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          {formData.companyType}
                        </span>
                      )}
                      {formData.market && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          {formData.market}
                        </span>
                      )}
                      {formData.employmentType && (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          {formData.employmentType}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {allSkills.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {allSkills.map((skill, index) => (
                          <span key={index} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1 rounded-md text-xs font-medium border border-green-200 dark:border-green-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Posted: Just now
                      </span>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium" 
                        size="sm"
                      >
                        View More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {formData.aboutCompany && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About Company</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{formData.aboutCompany}</p>
              </div>
            )}

            {formData.roleDefinitions && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Role Definition</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{formData.roleDefinitions}</p>
              </div>
            )}

            {formData.keyResponsibility && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Responsibilities</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{formData.keyResponsibility}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Edit
              </Button>
              <Button 
                className="flex-1 bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handlePostJob();
                }}
                disabled={postJobMutation.isPending}
              >
                {postJobMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post the Job'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
