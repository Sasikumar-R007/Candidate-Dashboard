import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Upload, Check, FileText, User, Briefcase, Building2, Globe, Target } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface RegistrationStep1 {
  resume?: File;
  certificates?: File[];
}

interface RegistrationStep2 {
  firstName: string;
  lastName: string;
  primaryEmail: string;
  secondaryEmail: string;
  mobileNumber: string;
  alternativeMobileNumber: string;
  dateOfBirth: string;
  whatsappNumber: string;
  currentStatus: string;
}

interface RegistrationStep3 {
  jobType: string;
  universityName: string;
  collegeName: string;
  proficiencyLevel: string;
  primarySkills: string;
  secondarySkills: string;
}

interface RegistrationStep4 {
  currentCompany: string;
  companyRole: string;
  companyType: string;
  companyLevel: string;
  productCategory: string;
  productDomain: string;
}

interface RegistrationStep5 {
  linkedinUrl: string;
  portfolioUrl: string;
  currentLocation: string;
  websiteUrl: string;
}

interface RegistrationStep6 {
  jobTitle: string;
  employmentType: string;
  preferredLocation: string;
  startDate: string;
  instructions: string;
  password: string;
  confirmPassword: string;
}

const steps = [
  { id: 1, title: "Resume", icon: FileText, label: "Upload Resume" },
  { id: 2, title: "About You", icon: User, label: "Personal Info" },
  { id: 3, title: "Your Strength", icon: Briefcase, label: "Career Details" },
  { id: 4, title: "Your Journey", icon: Building2, label: "Company History" },
  { id: 5, title: "Online Presence", icon: Globe, label: "Social Links" },
  { id: 6, title: "Job Preferences", icon: Target, label: "Job Preferences" },
];

export default function CandidateRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Form = useForm<RegistrationStep1>();
  const step2Form = useForm<RegistrationStep2>();
  const step3Form = useForm<RegistrationStep3>();
  const step4Form = useForm<RegistrationStep4>();
  const step5Form = useForm<RegistrationStep5>();
  const step6Form = useForm<RegistrationStep6>();

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/candidate/registration', data);
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Step Saved",
          description: "Your information has been saved successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save information",
        variant: "destructive"
      });
    }
  });

  const onNextStep = async () => {
    if (currentStep < steps.length) {
      // Save current step data
      let formData = {};
      switch (currentStep) {
        case 1:
          formData = step1Form.getValues();
          break;
        case 2:
          formData = step2Form.getValues();
          break;
        case 3:
          formData = step3Form.getValues();
          break;
        case 4:
          formData = step4Form.getValues();
          break;
        case 5:
          formData = step5Form.getValues();
          break;
        case 6:
          formData = step6Form.getValues();
          break;
      }

      if (user?.data) {
        const candidateId = 'id' in user.data ? user.data.id : (user.data as any).candidateId;
        saveMutation.mutate({
          candidateId,
          step: currentStep,
          data: formData
        });
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const onPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = step6Form.getValues();
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (user?.data) {
        const candidateId = 'id' in user.data ? user.data.id : (user.data as any).candidateId;
        await saveMutation.mutateAsync({
          candidateId,
          step: 6,
          data: formData,
          isComplete: true
        });
      }

      toast({
        title: "Registration Complete!",
        description: "Your profile has been successfully created.",
      });

      setTimeout(() => {
        setLocation('/candidate');
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete registration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animated sidebar stepper
  const renderAnimatedSidebar = () => (
    <div className="w-full lg:w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white p-6 lg:p-8 rounded-r-2xl">
      <h3 className="text-lg font-bold mb-6 text-center">Career Launchpad</h3>
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-white text-blue-600 scale-105'
                      : isActive
                      ? 'bg-white text-blue-600 ring-4 ring-white/30 scale-110'
                      : 'bg-blue-500/50 text-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm transition-all ${isActive ? 'text-white' : 'text-blue-100'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">{step.title}</p>

                  {/* Fill animation */}
                  {isCompleted && (
                    <div className="mt-2 h-1 bg-white rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-5 top-12 w-0.5 h-8 transition-all duration-500 ${
                    isCompleted ? 'bg-white' : 'bg-blue-500/30'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Resume</h2>
        <p className="text-gray-600">Upload your resume and certificates to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag & Drop or Click to Browse</p>
          <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Max 5MB)</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            id="resume-input"
            {...step1Form.register("resume")}
          />
          <Button variant="outline" onClick={() => document.getElementById('resume-input')?.click()}>
            Select Resume
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload Certificates</p>
          <p className="text-sm text-gray-500 mb-4">Images, PDF (Max 5MB each)</p>
          <input
            type="file"
            accept=".pdf,.jpg,.png,.jpeg"
            multiple
            className="hidden"
            id="cert-input"
            {...step1Form.register("certificates")}
          />
          <Button variant="outline" onClick={() => document.getElementById('cert-input')?.click()}>
            Select Certificates
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">About You</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input placeholder="First Name" {...step2Form.register("firstName")} />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input placeholder="Last Name" {...step2Form.register("lastName")} />
        </div>
        <div>
          <Label>Primary Email</Label>
          <Input type="email" placeholder="Primary Email" {...step2Form.register("primaryEmail")} />
        </div>
        <div>
          <Label>Secondary Email</Label>
          <Input type="email" placeholder="Secondary Email" {...step2Form.register("secondaryEmail")} />
        </div>
        <div>
          <Label>Mobile Number</Label>
          <Input placeholder="Mobile Number" {...step2Form.register("mobileNumber")} />
        </div>
        <div>
          <Label>Alternative Mobile Number</Label>
          <Input placeholder="Alternative Mobile Number" {...step2Form.register("alternativeMobileNumber")} />
        </div>
        <div>
          <Label>Date of Birth</Label>
          <Input type="date" {...step2Form.register("dateOfBirth")} />
        </div>
        <div>
          <Label>WhatsApp Number</Label>
          <Input placeholder="WhatsApp Number" {...step2Form.register("whatsappNumber")} />
        </div>
      </div>

      <div>
        <Label>Current Status</Label>
        <select className="w-full h-10 border border-gray-300 rounded-lg px-3" {...step2Form.register("currentStatus")}>
          <option value="">Select Status</option>
          <option value="employed">Currently Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="freelance">Freelancer</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Strength</h2>
        <p className="text-gray-600">Tell us about your career strengths</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Job Type</Label>
          <select className="w-full h-10 border border-gray-300 rounded-lg px-3" {...step3Form.register("jobType")}>
            <option value="">Select Job Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div>
          <Label>University Name</Label>
          <Input placeholder="University Name" {...step3Form.register("universityName")} />
        </div>
        <div>
          <Label>College Name</Label>
          <Input placeholder="College Name" {...step3Form.register("collegeName")} />
        </div>
        <div>
          <Label>Proficiency Level</Label>
          <select className="w-full h-10 border border-gray-300 rounded-lg px-3" {...step3Form.register("proficiencyLevel")}>
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Primary Skills</Label>
        <Input placeholder="Comma separated skills" {...step3Form.register("primarySkills")} />
      </div>
      <div>
        <Label>Secondary Skills</Label>
        <Input placeholder="Comma separated skills" {...step3Form.register("secondarySkills")} />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Journey</h2>
        <p className="text-gray-600">Tell us about your work history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Current Company</Label>
          <Input placeholder="Company Name" {...step4Form.register("currentCompany")} />
        </div>
        <div>
          <Label>Company Role</Label>
          <Input placeholder="Your Role" {...step4Form.register("companyRole")} />
        </div>
        <div>
          <Label>Company Type</Label>
          <select className="w-full h-10 border border-gray-300 rounded-lg px-3" {...step4Form.register("companyType")}>
            <option value="">Select Type</option>
            <option value="startup">Startup</option>
            <option value="mid-size">Mid-size</option>
            <option value="enterprise">Enterprise</option>
            <option value="mnc">MNC</option>
          </select>
        </div>
        <div>
          <Label>Company Level</Label>
          <Input placeholder="Level/Grade" {...step4Form.register("companyLevel")} />
        </div>
        <div>
          <Label>Product Category</Label>
          <Input placeholder="Product Category" {...step4Form.register("productCategory")} />
        </div>
        <div>
          <Label>Product Domain</Label>
          <Input placeholder="Domain" {...step4Form.register("productDomain")} />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Online Presence</h2>
        <p className="text-gray-600">Share your online profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>LinkedIn URL</Label>
          <Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...step5Form.register("linkedinUrl")} />
        </div>
        <div>
          <Label>Portfolio URL</Label>
          <Input type="url" placeholder="https://yourportfolio.com" {...step5Form.register("portfolioUrl")} />
        </div>
        <div>
          <Label>Current Location</Label>
          <Input placeholder="City, Country" {...step5Form.register("currentLocation")} />
        </div>
        <div>
          <Label>Website URL</Label>
          <Input type="url" placeholder="https://yourwebsite.com" {...step5Form.register("websiteUrl")} />
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Job Preferences</h2>
        <p className="text-gray-600">Tell us what you're looking for</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Job Title</Label>
          <Input placeholder="Desired Job Title" {...step6Form.register("jobTitle")} />
        </div>
        <div>
          <Label>Employment Type</Label>
          <select className="w-full h-10 border border-gray-300 rounded-lg px-3" {...step6Form.register("employmentType")}>
            <option value="">Select Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        <div>
          <Label>Preferred Location</Label>
          <Input placeholder="City, Country" {...step6Form.register("preferredLocation")} />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input type="date" {...step6Form.register("startDate")} />
        </div>
      </div>

      <div>
        <Label>Additional Instructions</Label>
        <textarea
          className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Any additional instructions or preferences..."
          {...step6Form.register("instructions")}
        />
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Create Your Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Password</Label>
            <Input 
              type="password" 
              placeholder="Create a password (min 6 characters)"
              {...step6Form.register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {step6Form.formState.errors.password && (
              <p className="text-red-600 text-sm mt-1">{step6Form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input 
              type="password" 
              placeholder="Confirm your password"
              {...step6Form.register("confirmPassword", {
                required: "Please confirm your password"
              })}
            />
            {step6Form.formState.errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{step6Form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      {/* Left Sidebar - Animated Stepper */}
      <div className="hidden lg:flex flex-col">
        {renderAnimatedSidebar()}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Sidebar */}
        <div className="lg:hidden bg-gradient-to-b from-blue-600 to-blue-700 text-white p-4">
          {renderAnimatedSidebar()}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-12 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {renderContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={onPrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                  data-testid="button-prev-step"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === steps.length ? (
                  <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    data-testid="button-submit-registration"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </Button>
                ) : (
                  <Button
                    onClick={onNextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    data-testid="button-next-step"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 text-center text-gray-600">
              <p>Step {currentStep} of {steps.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
