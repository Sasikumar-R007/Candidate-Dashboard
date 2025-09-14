import { apiRequest } from './queryClient';

// API base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  // Profile APIs
  getProfile: () => fetch(createApiUrl('/api/profile')).then(res => res.json()),
  updateProfile: (data: any) => apiRequest('PATCH', '/api/profile', data),
  
  // Job Preferences APIs
  getJobPreferences: () => fetch(createApiUrl('/api/job-preferences')).then(res => res.json()),
  updateJobPreferences: (data: any) => apiRequest('PATCH', '/api/job-preferences', data),
  
  // Skills APIs
  getSkills: () => fetch(createApiUrl('/api/skills')).then(res => res.json()),
  
  // Activities APIs
  getActivities: () => fetch(createApiUrl('/api/activities')).then(res => res.json()),
  
  // Job Applications APIs
  getJobApplications: () => fetch(createApiUrl('/api/job-applications')).then(res => res.json()),
  
  // File Upload APIs
  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return fetch(createApiUrl('/api/upload/banner'), {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  uploadProfile: (file: File) => {
    const formData = new FormData();
    formData.append('profile', file);
    return fetch(createApiUrl('/api/upload/profile'), {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fetch(createApiUrl('/api/upload/resume'), {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
};
