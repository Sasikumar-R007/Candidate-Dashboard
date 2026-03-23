import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Upload, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import staffosLogo2 from "@/assets/staffos logo 2.png";

interface RegistrationData {
  step1: {
    resume?: File;
    certificates?: FileList;
  };
  step2: {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    alternativeMobileNumber: string;
    primaryEmail: string;
    secondaryEmail: string;
    dateOfBirth: string;
    whatsappNumber: string;
    currentStatus: string;
  };
  step3: {
    jobType: string;
    universityName: string;
    collegeName: string;
    primarySkill: string;
    secondarySkill: string;
    proficiencyLevel: string;
  };
  step4: {
    currentCompany: string;
    currentRole: string;
    companyType: string;
    companyLevel: string;
    productCategory: string;
    productDomain: string;
  };
  step5: {
    linkedinUrl: string;
    portfolioUrl: string;
    currentLocation: string;
    websiteUrl: string;
  };
  step6: {
    jobTitle: string;
    employmentType: string;
    preferredLocation: string;
    startingDate: string;
    instructions: string;
    password: string;
    confirmPassword: string;
  };
}

const steps = [
  { number: 1, title: "Resume", description: "Upload. Parse. Progress." },
  { number: 2, title: "About You", description: "Let's Start with the basics - you just being you" },
  { number: 3, title: "Your Strength", description: "Show off what makes you awesome at what you do" },
  { number: 4, title: "Your Journey", description: "Tell us where you've been and what you learned so far" },
  { number: 5, title: "Online Presence", description: "Link up your digital world with us - we'd love to explore!" },
  { number: 6, title: "Job Preferences", description: "Define your goals, we'll help you reach them" },
];

export default function CandidateRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [certificateFileNames, setCertificateFileNames] = useState<string[]>([]);
  
  // Check if candidate already exists when email is entered in step 2
  const checkExistingCandidate = async (email: string) => {
    if (!email) return;
    try {
      // We'll check this when they try to submit, but we can also check on blur
      // For now, we'll handle it in the registration mutation error handler
    } catch (error) {
      // Silent check - we'll show error on submit
    }
  };

  const step1Form = useForm();
  const step2Form = useForm();
  const step3Form = useForm();
  const step4Form = useForm();
  const step5Form = useForm();
  const step6Form = useForm();

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/candidate/registration", data);
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
        variant: "destructive",
      });
    },
  });

  const onNextStep = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onSkip = async () => {
    onNextStep();
  };

  const onPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/candidate-register", data);
      return await res.json();
    },
    onSuccess: (response) => {
      if (response.requiresVerification) {
        toast({
          title: "Registration Successful!",
          description: `Verification code sent to ${response.email}. Please check your email.`,
        });
        // Navigate to login page with email pre-filled and OTP form shown
        setTimeout(() => {
          setLocation(`/candidate-login?email=${encodeURIComponent(response.email)}&verify=true`);
        }, 1500);
      } else {
        toast({
          title: "Registration Complete!",
          description: "Your profile has been successfully created.",
        });
        setTimeout(() => {
          setLocation("/candidate");
        }, 1500);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to complete registration";
      // apiRequest throws errors in format "409: Email already registered"
      if (errorMessage.includes("409") || errorMessage.includes("already registered") || errorMessage.includes("Email already registered")) {
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please login instead.",
          variant: "destructive",
        });
        // Redirect to login after showing error
        setTimeout(() => {
          setLocation("/candidate-login");
        }, 2000);
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const step2Data = step2Form.getValues();
      const step6Data = step6Form.getValues();

      // Validate password
      if (step6Data.password !== step6Data.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (step6Data.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate required fields
      if (!step2Data.primaryEmail || !step2Data.firstName || !step2Data.lastName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields (Name and Email)",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare registration data
      const registrationData = {
        fullName: `${step2Data.firstName} ${step2Data.lastName}`,
        email: step2Data.primaryEmail,
        password: step6Data.password,
        phone: step2Data.mobileNumber || undefined,
        location: step5Form.getValues().currentLocation || undefined,
        company: step4Form.getValues().currentCompany || undefined,
        designation: step4Form.getValues().currentRole || undefined,
      };

      // Call registration API
      registrationMutation.mutate(registrationData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sidebar Component
  const StepperSidebar = () => (
    <div className="w-full h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #F5F3FF, #E8E4FF, #8776FF)' }}>
      <div className="w-full h-screen text-gray-900 p-6 flex flex-col overflow-y-auto relative">
        {/* StaffOS logo at top */}
        <div className="flex items-center space-x-2 mb-8">
          <img
            src={staffosLogo2}
            alt="StaffOS Logo"
            className="h-10 w-10 rounded-lg object-contain"
          />
          <span className="text-xl font-bold text-gray-900 font-poppins">StaffOS</span>
        </div>
        
        {/* Vertical Progress Line */}
        <div className="absolute left-8 top-24 bottom-0 w-1 bg-gray-300/40 rounded-full" />

      {/* Steps */}
      <div className="relative space-y-8 flex-1">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="relative flex items-start gap-4 pl-6">
              {/* Filled Progress Line Behind Circle */}
              {isCompleted && (
                <div className="absolute left-1 top-0 w-1 h-20 bg-purple-600 rounded-full" />
              )}

              {/* Circle with Icon */}
              <div
                className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all font-poppins ${
                  isCompleted
                    ? "bg-purple-600 text-white shadow-lg"
                    : isActive
                    ? "bg-purple-600 text-white ring-4 ring-purple-200 shadow-lg"
                    : "bg-white/60 text-gray-700 border-2 border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : (
                  step.number
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-base font-bold text-gray-900 leading-tight font-poppins">
                  {step.title}
                </p>
                <p className="text-sm text-gray-700 mt-1 leading-snug font-poppins">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );

  // Step 1: Resume
  const Step1Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">Upload Resume</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4">
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-purple-600 mb-3 font-poppins">
            Upload Resume
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium text-sm mb-1 font-poppins">
              Drag & Drop a file here or Click to Browse
            </p>
            <p className="text-gray-500 text-xs mb-3 font-poppins">Expected PDF Docx</p>
            <p className="text-gray-500 text-xs mb-4 font-poppins">Max file size 5MB</p>
            <div className="flex items-center justify-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResumeFileName(e.target.files[0].name);
                    step1Form.setValue("resume", e.target.files[0]);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("resume-input")?.click()}
                className="text-xs px-4 h-9"
              >
                Select Resume
              </Button>
              <button
                type="button"
                onClick={onSkip}
                className="text-red-500 text-sm font-medium hover:text-red-700 transition"
                data-testid="button-skip-resume"
              >
                Skip now
              </button>
            </div>
            {resumeFileName && (
              <p className="text-xs text-green-600 mt-3">✓ {resumeFileName}</p>
            )}
          </div>
        </div>

        {/* Certificates Upload */}
        <div>
          <label className="block text-sm font-medium text-purple-600 mb-3 font-poppins">
            Upload Certificates <span className="text-purple-600">+</span>
          </label>
          <div className="border border-gray-200 rounded-lg p-6">
            <Button
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 text-xs px-4 h-9 mb-3 font-poppins"
              size="sm"
            >
              Upload Image
            </Button>
            <p className="text-gray-600 text-sm font-poppins">
              or drop a file, paste image, use{" "}
              <span className="text-gray-500">url</span>
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="text-red-500 text-sm font-medium hover:text-red-700 transition mt-3 block"
              data-testid="button-skip-certificates"
            >
              Skip now
            </button>
            <input
              type="file"
              accept=".pdf,.jpg,.png,.jpeg"
              multiple
              className="hidden"
              id="cert-input"
              onChange={(e) => {
                if (e.target.files) {
                  const names = Array.from(e.target.files).map((f) => f.name);
                  setCertificateFileNames(names);
                  step1Form.setValue("certificates", e.target.files);
                }
              }}
            />
            {certificateFileNames.length > 0 && (
              <div className="mt-3 space-y-1">
                {certificateFileNames.map((name, idx) => (
                  <p key={idx} className="text-xs text-green-600">
                    ✓ {name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: About You
  const Step2Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">About You</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              First Name
            </Label>
            <Input
              placeholder="First Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("firstName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Last Name
            </Label>
            <Input
              placeholder="Last Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("lastName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Mobile Number
            </Label>
            <Input
              placeholder="Mobile Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("mobileNumber")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Alternative Mobile Number
            </Label>
            <Input
              placeholder="Alternative Mobile Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("alternativeMobileNumber")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Primary Email
            </Label>
            <Input
              type="email"
              placeholder="Primary Email"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("primaryEmail")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Secondary Email
            </Label>
            <Input
              type="email"
              placeholder="Secondary Email"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("secondaryEmail")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Date of Birth
            </Label>
            <Input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("dateOfBirth")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              WhatsApp Number
            </Label>
            <Input
              placeholder="WhatsApp Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step2Form.register("whatsappNumber")}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
            Current Status
          </Label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins">
            <option value="">Select Status</option>
            <option value="employed">Currently Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="freelance">Freelancer</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 3: Your Strength
  const Step3Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">Your Strength</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Job Type
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins">
              <option value="">Select Job Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Primary Skill
            </Label>
            <Input
              placeholder="Marketing Analytics"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step3Form.register("primarySkill")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              University Name
            </Label>
            <Input
              placeholder="University Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step3Form.register("universityName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Secondary Skill
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="SEO"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
                {...step3Form.register("secondarySkill")}
              />
              <Button variant="outline" className="px-3 h-10">
                +
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              College Name
            </Label>
            <Input
              placeholder="College Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step3Form.register("collegeName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Resource Management
            </Label>
            <Input
              placeholder="Resource Management"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              readOnly
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Proficiency Level
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins">
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Business Strategy
            </Label>
            <Input
              placeholder="Business Strategy"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Your Journey
  const Step4Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">Your Journey</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Current Company
            </Label>
            <Input
              placeholder="Company Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step4Form.register("currentCompany")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Company Sector
            </Label>
            <Input
              placeholder="Company Sector"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Current Role
            </Label>
            <Input
              placeholder="Your Role"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step4Form.register("currentRole")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Company Type
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins">
              <option value="">Select Type</option>
              <option value="startup">Startup</option>
              <option value="mid-size">Mid-size</option>
              <option value="enterprise">Enterprise</option>
              <option value="mnc">MNC</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Company Level
            </Label>
            <Input
              placeholder="Level/Grade"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step4Form.register("companyLevel")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Product Category
            </Label>
            <Input
              placeholder="Product Category"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step4Form.register("productCategory")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Product Domain
            </Label>
            <Input
              placeholder="Domain"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step4Form.register("productDomain")}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Online Presence
  const Step5Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">Online Presence</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              LinkedIn
            </Label>
            <Input
              type="url"
              placeholder="LinkedIn URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step5Form.register("linkedinUrl")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Portfolio
            </Label>
            <Input
              type="url"
              placeholder="Portfolio URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step5Form.register("portfolioUrl")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Location
            </Label>
            <Input
              placeholder="City, Country"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step5Form.register("currentLocation")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Website
            </Label>
            <Input
              type="url"
              placeholder="Website URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step5Form.register("websiteUrl")}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 6: Job Preferences
  const Step6Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 font-poppins">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1 font-poppins">Job Preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Job Title
            </Label>
            <Input
              placeholder="Desired Job Title"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step6Form.register("jobTitle")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Employment type
            </Label>
            <Input
              placeholder="Full Time"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step6Form.register("employmentType")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Preferred Location
            </Label>
            <Input
              placeholder="City, Country"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step6Form.register("preferredLocation")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
              Starting date
            </Label>
            <Input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
              {...step6Form.register("startingDate")}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
            Instructions to Recruiter
          </Label>
          <Textarea
            placeholder="Any additional instructions or preferences..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-20 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
            {...step6Form.register("instructions")}
          />
        </div>

        {/* Password Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 font-poppins">
            Create Your Password
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
                Password
              </Label>
              <PasswordInput
                placeholder="Create a password (min 6 characters)"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
                {...step6Form.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {step6Form.formState.errors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {step6Form.formState.errors.password.message as string}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-purple-600 mb-2 block font-poppins">
                Confirm Password
              </Label>
              <PasswordInput
                placeholder="Confirm your password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-poppins"
                {...step6Form.register("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {step6Form.formState.errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {step6Form.formState.errors.confirmPassword.message as string}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Content />;
      case 2:
        return <Step2Content />;
      case 3:
        return <Step3Content />;
      case 4:
        return <Step4Content />;
      case 5:
        return <Step5Content />;
      case 6:
        return <Step6Content />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <StepperSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold font-poppins">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-8">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            {/* Back Button */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4 text-gray-600 hover:text-gray-900 self-start font-poppins">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="bg-white rounded-lg flex-1 flex flex-col overflow-hidden p-8">
              {renderContent()}
            </div>

            {/* Navigation - Fixed at bottom */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t flex-shrink-0">
              <Button
                variant="ghost"
                onClick={onPrevStep}
                disabled={currentStep === 1}
                className="text-gray-600 text-sm px-4 h-10 font-poppins"
                data-testid="button-prev-step"
              >
                ← Previous Step
              </Button>

              {currentStep === steps.length ? (
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-8 h-10 rounded-md font-poppins"
                  data-testid="button-submit-registration"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button
                  onClick={onNextStep}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-8 h-10 rounded-md font-poppins"
                  data-testid="button-next-step"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
