import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  ExternalLink,
  Download,
  FileText,
  Briefcase,
  GraduationCap,
  User,
  Building,
  Database,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface DatabaseCandidate {
  id: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  location?: string;
  experience?: string;
  skills?: string;
  profilePicture?: string;
  education?: string;
  currentRole?: string;
  ctc?: string;
  ectc?: string;
  noticePeriod?: string;
  position?: string;
  pedigreeLevel?: string;
  companyLevel?: string;
  companySector?: string;
  productService?: string;
  productCategory?: string;
  productDomain?: string;
  employmentType?: string;
  createdAt: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  highestQualification?: string;
  collegeName?: string;
  preferredLocation?: string;
  resumeFile?: string;
}

export default function CandidateProfile() {
  const [, params] = useRoute("/candidate-profile/:id");
  const [, setLocation] = useLocation();
  const candidateId = params?.id;

  const { data: candidate, isLoading, error } = useQuery<DatabaseCandidate>({
    queryKey: ['/api/admin/candidates', candidateId],
    enabled: !!candidateId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
          <p className="text-gray-600 mb-4">{error ? String(error) : 'The candidate profile could not be loaded.'}</p>
          <Button onClick={() => setLocation("/source-resume")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Source Resume
          </Button>
        </div>
      </div>
    );
  }

  const skillsArray = candidate.skills 
    ? candidate.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  
  const isFromDatabase = !!(candidate.candidateId || candidate.resumeFile);
  
  const resumeUrl = candidate.resumeFile;
  const lowerUrl = resumeUrl?.toLowerCase() || '';
  const urlWithoutQuery = lowerUrl.split('?')[0];
  const isPdf = urlWithoutQuery.endsWith('.pdf');
  const isDocx = urlWithoutQuery.endsWith('.docx');
  const isDoc = urlWithoutQuery.endsWith('.doc') && !isDocx;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/source-resume")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Candidate Profile</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              {/* Profile Picture */}
              <div className="flex justify-center mb-4">
                {candidate.profilePicture ? (
                  <img
                    src={candidate.profilePicture}
                    alt={candidate.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-3xl border-4 border-gray-100">
                    {candidate.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>

              {/* Name and Badge */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h2>
                  {isFromDatabase ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" title="From Master Database">
                      <Database className="w-3 h-3 mr-1" />
                      DB
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200" title="Direct Registration from StaffOS">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Registered
                    </Badge>
                  )}
                </div>
                <p className="text-blue-600 font-medium">
                  {candidate.designation || candidate.currentRole || candidate.position || 'Not Available'}
                </p>
                {candidate.company && candidate.company !== 'Not Available' && (
                  <p className="text-gray-600 text-sm mt-1">at {candidate.company}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${candidate.email}`} className="text-gray-700 hover:text-blue-600">
                    {candidate.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${candidate.phone}`} className="text-gray-700 hover:text-blue-600">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.location && candidate.location !== 'Not Available' && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{candidate.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-4 mb-6 border-t border-gray-200 pt-6">
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {candidate.websiteUrl && (
                  <a
                    href={candidate.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Website"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {candidate.portfolioUrl && (
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Portfolio"
                  >
                    <FileText className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {candidate.experience ? parseFloat(candidate.experience.replace(/[^\d.]/g, '')) || 0 : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Years Exp.</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{skillsArray.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Professional Summary
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Experience</p>
                  <p className="font-medium text-gray-900">
                    {candidate.experience ? `${candidate.experience} years` : 'Not Available'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Current CTC</p>
                  <p className="font-medium text-gray-900">
                    {candidate.ctc || candidate.ectc || 'Not Available'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Notice Period</p>
                  <p className="font-medium text-gray-900">
                    {candidate.noticePeriod || 'Not Available'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Preferred Location</p>
                  <p className="font-medium text-gray-900">
                    {candidate.preferredLocation || candidate.location || 'Not Available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {skillsArray.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {(candidate.education || candidate.highestQualification || candidate.collegeName) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-3 text-sm">
                  {candidate.education && candidate.education !== 'Not Available' && (
                    <div>
                      <p className="text-gray-500 mb-1">Qualification</p>
                      <p className="font-medium text-gray-900">{candidate.education}</p>
                    </div>
                  )}
                  {candidate.highestQualification && (
                    <div>
                      <p className="text-gray-500 mb-1">Highest Qualification</p>
                      <p className="font-medium text-gray-900">{candidate.highestQualification}</p>
                    </div>
                  )}
                  {candidate.collegeName && candidate.collegeName !== 'Not Available' && (
                    <div>
                      <p className="text-gray-500 mb-1">College/University</p>
                      <p className="font-medium text-gray-900">{candidate.collegeName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Details */}
            {(candidate.company || candidate.companyLevel || candidate.companySector) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Work Details
                </h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  {candidate.company && candidate.company !== 'Not Available' && (
                    <div>
                      <p className="text-gray-500 mb-1">Current Company</p>
                      <p className="font-medium text-gray-900">{candidate.company}</p>
                    </div>
                  )}
                  {candidate.companyLevel && (
                    <div>
                      <p className="text-gray-500 mb-1">Company Level</p>
                      <p className="font-medium text-gray-900">{candidate.companyLevel}</p>
                    </div>
                  )}
                  {candidate.companySector && (
                    <div>
                      <p className="text-gray-500 mb-1">Company Sector</p>
                      <p className="font-medium text-gray-900">{candidate.companySector}</p>
                    </div>
                  )}
                  {candidate.productService && (
                    <div>
                      <p className="text-gray-500 mb-1">Product/Service</p>
                      <p className="font-medium text-gray-900">{candidate.productService}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resume
                </h3>
                {candidate.resumeFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(candidate.resumeFile, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg bg-gray-100 overflow-hidden" style={{ minHeight: '600px', height: '600px' }}>
                {candidate.resumeFile ? (
                  <>
                    {isPdf ? (
                      <iframe
                        src={candidate.resumeFile}
                        className="w-full h-full border-0"
                        title="Resume Preview"
                      />
                    ) : isDocx || isDoc ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center space-y-4 p-8 max-w-md">
                          <FileText className="h-16 w-16 mx-auto text-gray-400" />
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              Word Document
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                              Word documents cannot be previewed in the browser. Please download the file to view it.
                            </p>
                            <Button
                              onClick={() => window.open(candidate.resumeFile, '_blank')}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Resume
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center space-y-4 p-8 max-w-md">
                          <FileText className="h-16 w-16 mx-auto text-gray-400" />
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                              Resume File
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                              This file type cannot be previewed. Please download to view.
                            </p>
                            <Button
                              onClick={() => window.open(candidate.resumeFile, '_blank')}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Resume
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-xl font-semibold text-gray-900">Resume</p>
                      <p className="text-sm text-gray-400 mt-4">Resume Not Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

