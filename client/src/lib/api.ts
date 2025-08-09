import { apiRequest } from './queryClient';

export const api = {
  // Profile APIs
  getProfile: () => fetch('/api/profile').then(res => res.json()),
  updateProfile: (data: any) => apiRequest('PATCH', '/api/profile', data),
  
  // Job Preferences APIs
  getJobPreferences: () => fetch('/api/job-preferences').then(res => res.json()),
  updateJobPreferences: (data: any) => apiRequest('PATCH', '/api/job-preferences', data),
  
  // Skills APIs
  getSkills: () => fetch('/api/skills').then(res => res.json()),
  
  // Activities APIs
  getActivities: () => fetch('/api/activities').then(res => res.json()),
  
  // Job Applications APIs
  getJobApplications: () => fetch('/api/job-applications').then(res => res.json()),
  
  // File Upload APIs
  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return fetch('/api/upload/banner', {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  uploadProfile: (file: File) => {
    const formData = new FormData();
    formData.append('profile', file);
    return fetch('/api/upload/profile', {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fetch('/api/upload/resume', {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
};
