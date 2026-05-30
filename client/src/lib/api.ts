import { apiRequest } from './queryClient';

// API base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  // Profile APIs
  getProfile: () => fetch(createApiUrl('/api/profile'), { credentials: 'include' }).then(res => res.json()),
  updateProfile: (data: any) => apiRequest('PATCH', '/api/profile', data),
  
  // Job Preferences APIs
  getJobPreferences: () => fetch(createApiUrl('/api/job-preferences'), { credentials: 'include' }).then(res => res.json()),
  updateJobPreferences: async (data: any) => {
    const res = await apiRequest('PATCH', '/api/job-preferences', data);
    const body = await res.json();
    if (!body || !body.profileId) {
      throw new Error('Failed to save job preferences');
    }
    return body;
  },
  
  // Skills APIs
  getSkills: () => fetch(createApiUrl('/api/skills'), { credentials: 'include' }).then(res => res.json()),
  
  // Activities APIs
  getActivities: () => fetch(createApiUrl('/api/activities'), { credentials: 'include' }).then(res => res.json()),
  logActivity: (data: { description: string; type: string }) => apiRequest('POST', '/api/activities', data),
  
  // Job Applications APIs
  getJobApplications: () => fetch(createApiUrl('/api/job-applications'), { credentials: 'include' }).then(res => res.json()),
  
  // File Upload APIs
  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return fetch(createApiUrl('/api/upload/banner'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },
  
  uploadProfile: (file: File) => {
    const formData = new FormData();
    formData.append('profile', file);
    return fetch(createApiUrl('/api/upload/profile'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },
  
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fetch(createApiUrl('/api/upload/resume'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },

  previewResumeMerge: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(createApiUrl('/api/candidate/resume/preview'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to analyze resume');
    }
    return data as {
      fileUrl: string;
      fileName: string;
      fromResume: ResumeMergeFieldChange[];
      retained: ResumeMergeFieldChange[];
      changes: ResumeMergeFieldChange[];
    };
  },

  applyResumeMerge: async () => {
    const res = await fetch(createApiUrl('/api/candidate/resume/apply'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to apply resume updates');
    }
    return data;
  },
};

export type ResumeMergeFieldChange = {
  key: string;
  label: string;
  category: string;
  currentValue: string | null;
  newValue: string | null;
  source: 'from_resume' | 'retained';
};
