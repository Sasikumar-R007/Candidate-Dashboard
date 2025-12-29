import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Filter, Search, MoreVertical, X, Download, Loader2, Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ProfileType = 'resume' | 'employee' | 'client';

type ResumeStatus = 'Inbound' | 'Existed' | 'Archived' | 'Looking for Jobs' | 'In working' | 'New' | 'Active';
type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Resigned';
type ClientStatus = 'Active' | 'Inactive' | 'On Hold' | 'Terminated' | 'frozen' | 'churned';

interface ResumeData {
  id: string;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: ResumeStatus;
  uploadedDate: string;
  email?: string;
  phone?: string;
  location?: string;
  resumeFile?: string;
}

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: EmployeeStatus;
  uploadedDate: string;
  email?: string;
  phone?: string;
  department?: string;
}

interface ClientData {
  id: string;
  name: string;
  position: string;
  experience: string;
  skills: string;
  source: string;
  status: ClientStatus;
  uploadedDate: string;
  email?: string;
  website?: string;
  location?: string;
}

export default function MasterDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const initialTab = (sessionStorage.getItem('masterDatabaseTab') as ProfileType) || 'resume';
  sessionStorage.removeItem('masterDatabaseTab');
  const [profileType, setProfileType] = useState<ProfileType>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isResumeDrawerOpen, setIsResumeDrawerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeData | EmployeeData | ClientData | null>(null);
  const [deletedIds, setDeletedIds] = useState<{
    resume: string[];
    employee: string[];
    client: string[];
  }>({
    resume: [],
    employee: [],
    client: []
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, profileType: ProfileType} | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  
  // Import Resume modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<{fullName: string | null; email: string | null; phone: string | null; designation?: string | null; experience?: string | null; skills?: string | null; location?: string | null; filePath?: string} | null>(null);
  const [bulkParsedResults, setBulkParsedResults] = useState<Array<{fileName: string; success: boolean; data?: {fullName: string | null; email: string | null; phone: string | null; designation?: string | null; experience?: string | null; skills?: string | null; location?: string | null; filePath?: string}; error?: string}>>([]);
  const [importStep, setImportStep] = useState<'upload' | 'confirm' | 'result'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [singleCandidateForm, setSingleCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    experience: '',
    skills: '',
    location: ''
  });
  const [importResults, setImportResults] = useState<{total: number; successCount: number; failedCount: number; results: Array<{fileName: string; success: boolean; error?: string}>} | null>(null);

  const { toast } = useToast();

  const BULK_UPLOAD_LIMIT = 20;
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    position: "",
    experience: "",
    skills: "",
    source: ""
  });

  // Fetch candidates (resumes) from API
  const { data: candidatesRaw = [], isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ['/api/admin/candidates'],
  });

  // Fetch employees from API
  const { data: employeesRaw = [], isLoading: isLoadingEmployees } = useQuery<any[]>({
    queryKey: ['/api/admin/employees'],
  });

  // Fetch clients from API
  const { data: clientsRaw = [], isLoading: isLoadingClients } = useQuery<any[]>({
    queryKey: ['/api/admin/clients'],
  });

  // Helper function to format date
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Map candidates to ResumeData format
  const resumeData: ResumeData[] = useMemo(() => {
    return candidatesRaw.map((candidate: any) => ({
      id: candidate.id,
      name: candidate.fullName || candidate.name || '-',
      position: candidate.position || candidate.designation || candidate.currentRole || '-',
      experience: candidate.experience || '-',
      skills: candidate.skills || '-',
      source: candidate.addedBy ? `Added by ${candidate.addedBy}` : (candidate.googleId ? 'Google OAuth' : 'Self Registration'),
      status: (candidate.pipelineStatus || 'New') as ResumeStatus,
      uploadedDate: formatDate(candidate.createdAt),
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location,
      resumeFile: candidate.resumeFile,
    }));
  }, [candidatesRaw]);

  // Map employees to EmployeeData format (Employees Master)
  // Include TL, TA, and other employees but exclude admin accounts (STAFFOS*) and clients
  const employeeData: EmployeeData[] = useMemo(() => {
    return employeesRaw
      .filter((employee: any) => 
        !employee.employeeId?.startsWith('STAFFOS') && 
        employee.role !== 'client' &&
        employee.role !== 'admin'
      )
      .map((employee: any) => ({
        id: employee.id,
        name: employee.name || '-',
        position: employee.designation || employee.role || '-',
        experience: '-',
        skills: employee.department || '-',
        source: 'Admin',
        status: (employee.isActive ? 'Active' : (employee.employmentStatus === 'Resigned' ? 'Resigned' : 'Inactive')) as EmployeeStatus,
        uploadedDate: formatDate(employee.joiningDate || employee.createdAt),
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
      }));
  }, [employeesRaw]);

  // Map clients to ClientData format
  const clientData: ClientData[] = useMemo(() => {
    return clientsRaw.map((client: any) => ({
      id: client.id,
      name: client.brandName || client.incorporatedName || '-',
      position: client.category || '-',
      experience: '-',
      skills: client.spoc || '-',
      source: client.source || 'Direct',
      status: (client.currentStatus === 'active' ? 'Active' : 
               client.currentStatus === 'frozen' ? 'On Hold' : 
               client.currentStatus === 'churned' ? 'Terminated' : 'Inactive') as ClientStatus,
      uploadedDate: formatDate(client.startDate || client.createdAt),
      email: client.email,
      website: client.website,
      location: client.location,
    }));
  }, [clientsRaw]);

  // Get loading state
  const isLoading = useMemo(() => {
    switch (profileType) {
      case 'resume': return isLoadingCandidates;
      case 'employee': return isLoadingEmployees;
      case 'client': return isLoadingClients;
      default: return false;
    }
  }, [profileType, isLoadingCandidates, isLoadingEmployees, isLoadingClients]);

  // Get current data based on profile type
  const getCurrentData = () => {
    switch (profileType) {
      case 'resume':
        return resumeData;
      case 'employee':
        return employeeData;
      case 'client':
        return clientData;
      default:
        return resumeData;
    }
  };

  // Get status options based on profile type
  const getStatusOptions = () => {
    switch (profileType) {
      case 'resume':
        return ['New', 'Inbound', 'Existed', 'Archived', 'Looking for Jobs', 'In working', 'L1', 'L2', 'L3', 'Final Round', 'HR Round', 'Offer Stage', 'Closure'];
      case 'employee':
        return ['Active', 'On Leave', 'Inactive', 'Resigned'];
      case 'client':
        return ['Active', 'Inactive', 'On Hold', 'Terminated'];
      default:
        return [];
    }
  };

  // Filter data based on search, status, and advanced filters
  const filteredData = getCurrentData().filter(item => {
    // Exclude deleted items for the current profile type
    if (deletedIds[profileType].includes(item.id)) {
      return false;
    }
    
    const searchMatch = searchQuery === "" || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const statusMatch = statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Advanced filter matches
    const positionMatch = !advancedFilters.position || 
      item.position.toLowerCase().includes(advancedFilters.position.toLowerCase());
    
    const experienceMatch = !advancedFilters.experience || 
      item.experience.toLowerCase().includes(advancedFilters.experience.toLowerCase());
    
    const skillsMatch = !advancedFilters.skills || 
      item.skills.toLowerCase().includes(advancedFilters.skills.toLowerCase());
    
    const sourceMatch = !advancedFilters.source || 
      item.source.toLowerCase().includes(advancedFilters.source.toLowerCase());
    
    // Date range filtering
    let dateMatch = true;
    if (advancedFilters.dateFrom || advancedFilters.dateTo) {
      const parseDate = (dateStr: string) => {
        // Handle DD-MM-YY format
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = 2000 + parseInt(parts[2]); // Assuming 20xx
          return new Date(year, month, day);
        }
        return new Date(dateStr);
      };
      
      const itemDate = parseDate(item.uploadedDate);
      
      if (advancedFilters.dateFrom) {
        const fromDate = new Date(advancedFilters.dateFrom);
        dateMatch = dateMatch && itemDate >= fromDate;
      }
      
      if (advancedFilters.dateTo) {
        const toDate = new Date(advancedFilters.dateTo);
        dateMatch = dateMatch && itemDate <= toDate;
      }
    }
    
    return searchMatch && statusMatch && positionMatch && experienceMatch && 
           skillsMatch && sourceMatch && dateMatch;
  });
  
  // Handle apply advanced filters
  const handleApplyFilters = () => {
    setIsAdvancedFilterOpen(false);
  };
  
  // Handle clear advanced filters
  const handleClearFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      position: "",
      experience: "",
      skills: "",
      source: ""
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    // Resume statuses
    if (lowerStatus === 'inbound') return 'bg-green-500 text-white';
    if (lowerStatus === 'existed') return 'bg-blue-500 text-white';
    if (lowerStatus === 'archived') return 'bg-gray-500 text-white';
    if (lowerStatus === 'looking for jobs') return 'bg-orange-500 text-white';
    if (lowerStatus === 'in working') return 'bg-purple-500 text-white';
    
    // Employee statuses
    if (lowerStatus === 'active') return 'bg-green-500 text-white';
    if (lowerStatus === 'on leave') return 'bg-yellow-500 text-white';
    if (lowerStatus === 'inactive') return 'bg-gray-500 text-white';
    if (lowerStatus === 'resigned') return 'bg-red-500 text-white';
    
    // Client statuses
    if (lowerStatus === 'on hold') return 'bg-orange-500 text-white';
    if (lowerStatus === 'terminated') return 'bg-red-500 text-white';
    
    return 'bg-gray-500 text-white';
  };

  // Get profile type label
  const getProfileTypeLabel = () => {
    switch (profileType) {
      case 'resume':
        return 'Resume';
      case 'employee':
        return 'Employee';
      case 'client':
        return 'Client';
      default:
        return 'Resume';
    }
  };

  // Handle row click to open resume drawer
  const handleRowClick = (item: ResumeData | EmployeeData | ClientData) => {
    // Only open drawer for resume profile type
    if (profileType === 'resume') {
      setSelectedResume(item);
      setIsResumeDrawerOpen(true);
    }
  };

  // Handle close drawer
  const handleCloseDrawer = () => {
    setIsResumeDrawerOpen(false);
    setSelectedResume(null);
  };

  // Handle delete row - Show 3-dot menu or password dialog
  const handleDeleteRow = (e: React.MouseEvent, item: ResumeData | EmployeeData | ClientData) => {
    e.stopPropagation();
    setItemToDelete({ id: item.id, name: item.name, profileType });
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsPasswordDialogOpen(true);
  };

  // Handle password verification for delete
  const handleVerifyPassword = async () => {
    if (!passwordInput) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/admin/verify-password', {
        password: passwordInput
      });
      
      // Parse the response JSON
      const responseData = await response.json() as any;

      if (responseData && responseData.success) {
        // Password verified - proceed with actual deletion from database
        if (itemToDelete) {
          // Determine the correct API endpoint based on profile type
          let deleteEndpoint = '';
          if (itemToDelete.profileType === 'resume') {
            deleteEndpoint = `/api/admin/candidates/${itemToDelete.id}`;
          } else if (itemToDelete.profileType === 'employee') {
            deleteEndpoint = `/api/admin/employees/${itemToDelete.id}`;
          } else if (itemToDelete.profileType === 'client') {
            deleteEndpoint = `/api/admin/clients/${itemToDelete.id}`;
          }

          if (deleteEndpoint) {
            try {
              // Call the actual delete API endpoint
              const deleteResponse = await apiRequest('DELETE', deleteEndpoint, {});
              
              // Parse the response
              const deleteResult = await deleteResponse.json();
              
              if (!deleteResponse.ok) {
                throw new Error(deleteResult.message || 'Failed to delete item');
              }

              // Invalidate the query cache to refetch data
              if (itemToDelete.profileType === 'resume') {
                await queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
              } else if (itemToDelete.profileType === 'employee') {
                await queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
              } else if (itemToDelete.profileType === 'client') {
                await queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
              }

              // Close drawer if the deleted item is currently displayed
              if (selectedResume && selectedResume.id === itemToDelete.id && profileType === itemToDelete.profileType) {
                setIsResumeDrawerOpen(false);
                setSelectedResume(null);
              }

              toast({
                title: "Success",
                description: `${itemToDelete.name} has been permanently deleted from the database`
              });
            } catch (deleteError) {
              console.error('Deletion failed:', deleteError);
              throw deleteError;
            }
          }
        }
        setIsPasswordDialogOpen(false);
        setPasswordInput("");
        setPasswordAttempts(0);
        setItemToDelete(null);
      } else {
        // Wrong password
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordInput("");

        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Maximum password attempts exceeded. Logging out for security.",
            variant: "destructive"
          });
          setIsPasswordDialogOpen(false);
          setItemToDelete(null);
          // Auto logout
          await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
          window.location.href = '/admin-login';
        } else {
          toast({
            title: "Incorrect Password",
            description: `${3 - newAttempts} attempt(s) remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsPasswordDialogOpen(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setItemToDelete(null);
  };

  // Handle dialog close via backdrop or ESC
  const handleDialogOpenChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      handleCancelDelete();
    }
  };

  // Handle download resume
  const handleDownloadResume = () => {
    if (!selectedResume || !('resumeFile' in selectedResume) || !selectedResume.resumeFile) {
      toast({
        title: "Error",
        description: "Resume file not available",
        variant: "destructive"
      });
      return;
    }

    const resumeUrl = selectedResume.resumeFile;
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${selectedResume.name || 'resume'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Reset import modal state
  const resetImportModal = () => {
    setUploadedFile(null);
    setBulkFiles([]);
    setParsedData(null);
    setBulkParsedResults([]);
    setImportStep('upload');
    setIsProcessing(false);
    setSingleCandidateForm({
      fullName: '',
      email: '',
      phone: '',
      designation: '',
      experience: '',
      skills: '',
      location: '',
      company: '',
      education: '',
      linkedinUrl: '',
      portfolioUrl: '',
      websiteUrl: '',
      currentRole: ''
    });
    setImportResults(null);
  };

  // Handle single file drop
  const onSingleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setIsProcessing(true);
      
      try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/admin/parse-resume', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to parse resume');
        }
        
        const result = await response.json();
        setParsedData(result.data);
        setSingleCandidateForm(prev => ({
          ...prev,
          fullName: result.data.fullName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          designation: result.data.designation || '',
          experience: result.data.experience || '',
          skills: result.data.skills || '',
          location: result.data.location || '',
          company: result.data.company || '',
          education: result.data.education || '',
          linkedinUrl: result.data.linkedinUrl || '',
          portfolioUrl: result.data.portfolioUrl || '',
          websiteUrl: result.data.websiteUrl || '',
          currentRole: result.data.currentRole || ''
        }));
        setImportStep('confirm');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse resume. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [toast]);

  // Handle bulk files drop
  const onBulkDrop = useCallback(async (acceptedFiles: File[]) => {
    const limitedFiles = acceptedFiles.slice(0, BULK_UPLOAD_LIMIT);
    setBulkFiles(limitedFiles);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      limitedFiles.forEach(file => {
        formData.append('resumes', file);
      });
      
      const response = await fetch('/api/admin/parse-resumes-bulk', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse resumes');
      }
      
      const result = await response.json();
      setBulkParsedResults(result.results);
      setImportStep('confirm');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse resumes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const singleDropzone = useDropzone({
    onDrop: onSingleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const bulkDropzone = useDropzone({
    onDrop: onBulkDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: BULK_UPLOAD_LIMIT,
    disabled: isProcessing
  });

  // Handle single candidate import
  const handleSingleImport = async () => {
    if (!singleCandidateForm.fullName || !singleCandidateForm.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/import-candidate', {
        fullName: singleCandidateForm.fullName,
        email: singleCandidateForm.email,
        phone: singleCandidateForm.phone || null,
        designation: singleCandidateForm.designation || null,
        experience: singleCandidateForm.experience || null,
        skills: singleCandidateForm.skills || null,
        location: singleCandidateForm.location || null,
        company: singleCandidateForm.company || null,
        education: singleCandidateForm.education || null,
        linkedinUrl: singleCandidateForm.linkedinUrl || null,
        portfolioUrl: singleCandidateForm.portfolioUrl || null,
        websiteUrl: singleCandidateForm.websiteUrl || null,
        currentRole: singleCandidateForm.currentRole || null,
        resumeFilePath: parsedData?.filePath,
        addedBy: 'Admin Import'
      });
      
      toast({
        title: "Success",
        description: "Candidate imported successfully!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      setIsImportModalOpen(false);
      resetImportModal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import candidate.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    const validCandidates = bulkParsedResults
      .filter(r => r.success && r.data?.fullName && r.data?.email)
      .map(r => ({
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
        fileName: r.fileName
      }));
    
    if (validCandidates.length === 0) {
      toast({
        title: "No Valid Candidates",
        description: "No resumes with valid name and email found.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/admin/import-candidates-bulk', {
        method: 'POST',
        body: JSON.stringify({
          candidates: validCandidates,
          addedBy: 'Admin Bulk Import'
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to import candidates');
      }
      
      const result = await response.json();
      setImportResults(result);
      setImportStep('result');
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      
      toast({
        title: "Import Complete",
        description: `${result.successCount} candidates imported, ${result.failedCount} failed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import candidates.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="icon"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Master Database</h1>
          </div>
          <Button
            onClick={() => {
              resetImportModal();
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2"
            data-testid="button-import-resume"
          >
            <Upload className="h-4 w-4" />
            Import Resume
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search across all database......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800"
              data-testid="input-search"
            />
          </div>
          
          <Select value={profileType} onValueChange={(value) => {
            setProfileType(value as ProfileType);
            setStatusFilter("all");
          }}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800" data-testid="select-profile-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800" data-testid="select-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {getStatusOptions().map(status => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Only show Advanced Filter for Resume, hide for Employee and Client */}
          {profileType === 'resume' && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white dark:bg-gray-800" 
              onClick={() => setIsAdvancedFilterOpen(true)}
              data-testid="button-advanced-filter"
            >
              <Filter size={16} />
              Advanced Filter
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area - Side by Side Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Table Section */}
        <div className={`${isResumeDrawerOpen ? 'flex-1' : 'w-full'} overflow-hidden p-6 transition-all duration-300 flex flex-col`}>
          <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200 dark:bg-blue-900 sticky top-0">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Name</th>
                    {profileType === 'resume' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Position</th>
                        <th className={`text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 ${isResumeDrawerOpen ? 'hidden' : ''}`}>Experience</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Skills</th>
                        <th className={`text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 ${isResumeDrawerOpen ? 'hidden' : ''}`}>Status</th>
                      </>
                    )}
                    {profileType === 'employee' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Position</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                      </>
                    )}
                    {profileType === 'client' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Location</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">SPOC</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                      </>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Uploaded Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={profileType === 'resume' ? (isResumeDrawerOpen ? 6 : 8) : 8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-gray-500 dark:text-gray-400">Loading {getProfileTypeLabel().toLowerCase()}s...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={profileType === 'resume' ? (isResumeDrawerOpen ? 6 : 8) : 8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            {searchQuery || statusFilter !== 'all' 
                              ? `No ${getProfileTypeLabel().toLowerCase()}s match your filters` 
                              : `No ${getProfileTypeLabel().toLowerCase()}s found in the database`}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {profileType === 'resume' && "Candidates will appear here when added by recruiters or via individual registration"}
                            {profileType === 'employee' && "Employees will appear here when added by Admin"}
                            {profileType === 'client' && "Clients will appear here when added by Admin"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr 
                        key={item.id} 
                        onClick={() => handleRowClick(item)}
                        className={`border-b border-gray-200 dark:border-gray-700 ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-750'
                        } ${profileType === 'resume' ? 'cursor-pointer hover-elevate' : ''}`}
                        data-testid={`row-${profileType}-${item.id}`}
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100" data-testid={`text-name-${item.id}`}>
                          {item.name}
                        </td>
                        {profileType === 'resume' && (
                          <>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.position}</td>
                            <td className={`py-3 px-4 text-gray-900 dark:text-gray-100 ${isResumeDrawerOpen ? 'hidden' : ''}`}>{item.experience}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                              {item.skills && item.skills !== '-' ? (item.skills.split(',')[0] + (item.skills.includes(',') ? '...' : '')) : '-'}
                            </td>
                            <td className={`py-3 px-4 ${isResumeDrawerOpen ? 'hidden' : ''}`}>
                              <Badge className={`${getStatusBadgeColor(item.status)} rounded-full px-3 py-1`}>
                                {item.status}
                              </Badge>
                            </td>
                          </>
                        )}
                        {profileType === 'employee' && (
                          <>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.position}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                              {'department' in item ? (item as any).department : item.skills}
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                              {'email' in item ? (item as any).email : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${getStatusBadgeColor(item.status)} rounded-full px-3 py-1`}>
                                {item.status}
                              </Badge>
                            </td>
                          </>
                        )}
                        {profileType === 'client' && (
                          <>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.position}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                              {'location' in item ? (item as any).location : '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.skills}</td>
                            <td className="py-3 px-4">
                              <Badge className={`${getStatusBadgeColor(item.status)} rounded-full px-3 py-1`}>
                                {item.status}
                              </Badge>
                            </td>
                          </>
                        )}
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.uploadedDate}</td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                data-testid={`button-actions-${item.id}`}
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRow(e as any, item);
                                }}
                                className="text-red-600 dark:text-red-400"
                                data-testid={`menu-delete-${item.id}`}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resume Display Section - Right Side Panel */}
        {isResumeDrawerOpen && selectedResume && (
          <div className="w-full max-w-lg min-w-[450px] h-full border-l-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
              {/* Candidate Profile Header - Redesigned */}
              <div className="flex items-start justify-between gap-4">
                {/* Left Side: Profile Info */}
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={selectedResume.name} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {getInitials(selectedResume.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100" data-testid="text-candidate-name">
                        {selectedResume.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-candidate-position">
                        {selectedResume.position}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getStatusBadgeColor(selectedResume.status)} rounded-full px-3 py-1 text-xs`}>
                        {selectedResume.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right Side: Close Button */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDrawer}
                    className="h-8 w-8 rounded-full"
                    data-testid="button-close-drawer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Resume Display Area */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-md flex flex-col relative overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '800px' }}>
                  {selectedResume && 'resumeFile' in selectedResume && selectedResume.resumeFile ? (
                    <>
                      {(() => {
                        const resumeUrl = selectedResume.resumeFile;
                        const lowerUrl = resumeUrl.toLowerCase();
                        // Check file extension from URL (handle URLs with query params)
                        const urlWithoutQuery = lowerUrl.split('?')[0];
                        const isPdf = urlWithoutQuery.endsWith('.pdf');
                        const isDocx = urlWithoutQuery.endsWith('.docx');
                        const isDoc = urlWithoutQuery.endsWith('.doc') && !isDocx;
                        
                        if (isPdf) {
                          return (
                            <iframe
                              key={resumeUrl}
                              src={resumeUrl}
                              className="w-full h-full border-0"
                              title="Resume Preview"
                              data-testid="resume-iframe"
                            />
                          );
                        } else if (isDocx || isDoc) {
                          // Word documents can't be displayed directly in browser
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                              <div className="text-center space-y-4 p-8 max-w-md">
                                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Word Document
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Word documents cannot be previewed in the browser. Please download the file to view it.
                                  </p>
                                  <Button
                                    onClick={handleDownloadResume}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resume
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Try to display as image (fallback for other file types)
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                              <div className="text-center space-y-4 p-8 max-w-md">
                                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Resume File
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    This file type cannot be previewed. Please download to view.
                                  </p>
                                  <Button
                                    onClick={handleDownloadResume}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resume
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                      {/* Download Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDownloadResume}
                          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md"
                          data-testid="button-download-resume"
                          title="Download Resume"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resume</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Resume Not Available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Uploaded Date Badge - Below Resume */}
                <div className="flex justify-center mt-4">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    Uploaded: {selectedResume.uploadedDate}
                  </Badge>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter Dialog */}
      <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-advanced-filter">
          <DialogHeader>
            <DialogTitle>Advanced Filter</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={advancedFilters.dateFrom}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                data-testid="input-date-from"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={advancedFilters.dateTo}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                data-testid="input-date-to"
              />
            </div>
            
            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Position/Role</Label>
              <Input
                id="position"
                type="text"
                placeholder="e.g. Software Engineer"
                value={advancedFilters.position}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, position: e.target.value }))}
                data-testid="input-position"
              />
            </div>
            
            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                type="text"
                placeholder="e.g. 2 years, 3-5 years"
                value={advancedFilters.experience}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, experience: e.target.value }))}
                data-testid="input-experience"
              />
            </div>
            
            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                type="text"
                placeholder="e.g. Python, React, SQL"
                value={advancedFilters.skills}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, skills: e.target.value }))}
                data-testid="input-skills"
              />
            </div>
            
            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select 
                value={advancedFilters.source} 
                onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger data-testid="select-source">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Naukri">Naukri</SelectItem>
                  <SelectItem value="Indeed">Indeed</SelectItem>
                  <SelectItem value="Monster">Monster</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Behance">Behance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
            <Button 
              onClick={handleApplyFilters}
              data-testid="button-apply-filters"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Protected Delete Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogOpenChange} data-testid="dialog-password-delete">
        <DialogContent className="max-w-md" data-testid="dialog-password-confirm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To delete "{itemToDelete?.name}", please enter your admin password for security.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="delete-password">Admin Password</Label>
              <PasswordInput
                id="delete-password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifyingPassword) {
                    handleVerifyPassword();
                  }
                }}
                disabled={isVerifyingPassword || passwordAttempts >= 3}
                data-testid="input-delete-password"
              />
            </div>

            {passwordAttempts > 0 && passwordAttempts < 3 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {3 - passwordAttempts} attempt(s) remaining
              </p>
            )}

            {passwordAttempts >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                Maximum attempts exceeded. You will be logged out.
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isVerifyingPassword}
              data-testid="button-cancel-password"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleVerifyPassword}
              disabled={isVerifyingPassword || passwordAttempts >= 3 || !passwordInput}
              data-testid="button-confirm-password"
            >
              {isVerifyingPassword ? 'Verifying...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Resume Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        setIsImportModalOpen(open);
        if (!open) resetImportModal();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-import-resume">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Resume
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center gap-2">
                <Label htmlFor="bulk-toggle" className="text-sm font-medium">Bulk Upload</Label>
                <span className="text-xs text-muted-foreground">(Max {BULK_UPLOAD_LIMIT} files)</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">
                <Switch
                  id="bulk-toggle"
                  checked={isBulkUpload}
                  onCheckedChange={(checked) => {
                    setIsBulkUpload(checked);
                    resetImportModal();
                  }}
                  disabled={importStep !== 'upload'}
                  data-testid="switch-bulk-upload"
                />
              </div>
            </div>

            {/* Single Upload Mode */}
            {!isBulkUpload && (
              <>
                {importStep === 'upload' && (
                  <div
                    {...singleDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      singleDropzone.isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                    }`}
                    data-testid="dropzone-single"
                  >
                    <input {...singleDropzone.getInputProps()} data-testid="input-resume-file" />
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Parsing resume...</p>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop a resume here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, DOC, DOCX
                        </p>
                      </>
                    )}
                  </div>
                )}

                {importStep === 'confirm' && parsedData && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Resume Parsed Successfully</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {uploadedFile?.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={singleCandidateForm.fullName}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter full name"
                          data-testid="input-fullName"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={singleCandidateForm.email}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email"
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={singleCandidateForm.phone}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          value={singleCandidateForm.designation}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, designation: e.target.value }))}
                          placeholder="e.g. Software Engineer"
                          data-testid="input-designation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience</Label>
                        <Input
                          id="experience"
                          value={singleCandidateForm.experience}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, experience: e.target.value }))}
                          placeholder="e.g. 5 years"
                          data-testid="input-experience"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={singleCandidateForm.location}
                          onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. New York, USA"
                          data-testid="input-location"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Input
                        id="skills"
                        value={singleCandidateForm.skills}
                        onChange={(e) => setSingleCandidateForm(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="e.g. JavaScript, React, Node.js"
                        data-testid="input-skills-import"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Bulk Upload Mode */}
            {isBulkUpload && (
              <>
                {importStep === 'upload' && (
                  <div
                    {...bulkDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      bulkDropzone.isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                    }`}
                    data-testid="dropzone-bulk"
                  >
                    <input {...bulkDropzone.getInputProps()} data-testid="input-resume-files-bulk" />
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Parsing {bulkFiles.length} resumes...</p>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop multiple resumes here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, DOC, DOCX (Max {BULK_UPLOAD_LIMIT} files)
                        </p>
                      </>
                    )}
                  </div>
                )}

                {importStep === 'confirm' && bulkParsedResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <span className="font-medium">Parsed Resumes</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {bulkParsedResults.filter(r => r.success && r.data?.fullName && r.data?.email).length} valid
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          {bulkParsedResults.filter(r => !r.success || !r.data?.fullName || !r.data?.email).length} invalid
                        </span>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {bulkParsedResults.map((result, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-md border ${
                            result.success && result.data?.fullName && result.data?.email
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}
                          data-testid={`bulk-result-${index}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {result.success && result.data?.fullName && result.data?.email ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium truncate">{result.fileName}</span>
                              </div>
                              {result.success && result.data ? (
                                <div className="mt-1 text-xs text-muted-foreground ml-6 space-y-1">
                                  <div>{result.data.fullName || 'No name'} {result.data.email ? `| ${result.data.email}` : ''}</div>
                                  {result.data.designation && <div className="text-xs">Position: {result.data.designation}</div>}
                                  {result.data.experience && <div className="text-xs">Experience: {result.data.experience}</div>}
                                </div>
                              ) : (
                                <div className="mt-1 text-xs text-red-600 ml-6">
                                  {result.error || 'Missing name or email'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importStep === 'result' && importResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                        <div className="text-2xl font-bold">{importResults.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
                        <div className="text-2xl font-bold text-green-600">{importResults.successCount}</div>
                        <div className="text-sm text-green-600">Imported</div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md text-center">
                        <div className="text-2xl font-bold text-red-600">{importResults.failedCount}</div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                    </div>

                    {importResults.results.filter(r => !r.success).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">Failed Imports:</p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {importResults.results.filter(r => !r.success).map((result, index) => (
                            <div key={index} className="text-xs text-red-600 flex items-center gap-2">
                              <XCircle className="h-3 w-3" />
                              <span>{result.fileName}: {result.error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {importStep === 'upload' && (
              <Button 
                variant="outline" 
                onClick={() => setIsImportModalOpen(false)}
                data-testid="button-cancel-import"
              >
                Cancel
              </Button>
            )}
            
            {importStep === 'confirm' && !isBulkUpload && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportStep('upload');
                    setUploadedFile(null);
                    setParsedData(null);
                  }}
                  data-testid="button-back-import"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSingleImport}
                  disabled={isProcessing || !singleCandidateForm.fullName || !singleCandidateForm.email}
                  data-testid="button-confirm-import"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Candidate'
                  )}
                </Button>
              </>
            )}

            {importStep === 'confirm' && isBulkUpload && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportStep('upload');
                    setBulkFiles([]);
                    setBulkParsedResults([]);
                  }}
                  data-testid="button-back-bulk-import"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleBulkImport}
                  disabled={isProcessing || bulkParsedResults.filter(r => r.success && r.data?.fullName && r.data?.email).length === 0}
                  data-testid="button-confirm-bulk-import"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${bulkParsedResults.filter(r => r.success && r.data?.fullName && r.data?.email).length} Candidates`
                  )}
                </Button>
              </>
            )}

            {importStep === 'result' && (
              <Button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  resetImportModal();
                }}
                data-testid="button-close-import"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
