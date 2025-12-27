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
import { Check, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const step6Data = step6Form.getValues();

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

      toast({
        title: "Registration Complete!",
        description: "Your profile has been successfully created.",
      });

      setTimeout(() => {
        setLocation("/candidate");
      }, 1500);
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
    <div className="w-full h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white p-6 flex flex-col overflow-y-auto relative">
      {/* Vertical Progress Line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/20 rounded-full" />

      {/* Steps */}
      <div className="relative space-y-8 flex-1">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="relative flex items-start gap-4 pl-6">
              {/* Filled Progress Line Behind Circle */}
              {isCompleted && (
                <div className="absolute left-1 top-0 w-1 h-20 bg-white rounded-full" />
              )}

              {/* Circle with Icon */}
              <div
                className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  isCompleted
                    ? "bg-white text-blue-600 shadow-lg"
                    : isActive
                    ? "bg-white text-blue-600 ring-4 ring-white/40 shadow-lg"
                    : "bg-white/30 text-white border-2 border-white/50"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                ) : (
                  step.number
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-base font-bold text-white leading-tight">
                  {step.title}
                </p>
                <p className="text-sm text-white/80 mt-1 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 1: Resume
  const Step1Content = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">Upload Resume</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4">
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-3">
            Upload Resume
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium text-sm mb-1">
              Drag & Drop a file here or Click to Browse
            </p>
            <p className="text-gray-500 text-xs mb-3">Expected PDF Docx</p>
            <p className="text-gray-500 text-xs mb-4">Max file size 5MB</p>
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
          <label className="block text-sm font-medium text-blue-600 mb-3">
            Upload Certificates <span className="text-blue-600">+</span>
          </label>
          <div className="border border-gray-200 rounded-lg p-6">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-xs px-4 h-9 mb-3"
              size="sm"
            >
              Upload Image
            </Button>
            <p className="text-gray-600 text-sm">
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
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">About You</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              First Name
            </Label>
            <Input
              placeholder="First Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("firstName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Last Name
            </Label>
            <Input
              placeholder="Last Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("lastName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Mobile Number
            </Label>
            <Input
              placeholder="Mobile Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("mobileNumber")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Alternative Mobile Number
            </Label>
            <Input
              placeholder="Alternative Mobile Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("alternativeMobileNumber")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Primary Email
            </Label>
            <Input
              type="email"
              placeholder="Primary Email"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("primaryEmail")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Secondary Email
            </Label>
            <Input
              type="email"
              placeholder="Secondary Email"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("secondaryEmail")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Date of Birth
            </Label>
            <Input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("dateOfBirth")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              WhatsApp Number
            </Label>
            <Input
              placeholder="WhatsApp Number"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step2Form.register("whatsappNumber")}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium text-blue-600 mb-2 block">
            Current Status
          </Label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
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
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">Your Strength</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Job Type
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select Job Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Primary Skill
            </Label>
            <Input
              placeholder="Marketing Analytics"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step3Form.register("primarySkill")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              University Name
            </Label>
            <Input
              placeholder="University Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step3Form.register("universityName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Secondary Skill
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="SEO"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                {...step3Form.register("secondarySkill")}
              />
              <Button variant="outline" className="px-3 h-10">
                +
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              College Name
            </Label>
            <Input
              placeholder="College Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step3Form.register("collegeName")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Resource Management
            </Label>
            <Input
              placeholder="Resource Management"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              readOnly
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Proficiency Level
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Business Strategy
            </Label>
            <Input
              placeholder="Business Strategy"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">Your Journey</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Current Company
            </Label>
            <Input
              placeholder="Company Name"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step4Form.register("currentCompany")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Company Sector
            </Label>
            <Input
              placeholder="Company Sector"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Current Role
            </Label>
            <Input
              placeholder="Your Role"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step4Form.register("currentRole")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Company Type
            </Label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select Type</option>
              <option value="startup">Startup</option>
              <option value="mid-size">Mid-size</option>
              <option value="enterprise">Enterprise</option>
              <option value="mnc">MNC</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Company Level
            </Label>
            <Input
              placeholder="Level/Grade"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step4Form.register("companyLevel")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Product Category
            </Label>
            <Input
              placeholder="Product Category"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step4Form.register("productCategory")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Product Domain
            </Label>
            <Input
              placeholder="Domain"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">Online Presence</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              LinkedIn
            </Label>
            <Input
              type="url"
              placeholder="LinkedIn URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step5Form.register("linkedinUrl")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Portfolio
            </Label>
            <Input
              type="url"
              placeholder="Portfolio URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step5Form.register("portfolioUrl")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Location
            </Label>
            <Input
              placeholder="City, Country"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step5Form.register("currentLocation")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Website
            </Label>
            <Input
              type="url"
              placeholder="Website URL"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <h2 className="text-2xl font-bold text-blue-600">Career Launchpad</h2>
        <p className="text-gray-600 text-sm mt-1">Job Preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Job Title
            </Label>
            <Input
              placeholder="Desired Job Title"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step6Form.register("jobTitle")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Employment type
            </Label>
            <Input
              placeholder="Full Time"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step6Form.register("employmentType")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Preferred Location
            </Label>
            <Input
              placeholder="City, Country"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step6Form.register("preferredLocation")}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-600 mb-2 block">
              Starting date
            </Label>
            <Input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              {...step6Form.register("startingDate")}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium text-blue-600 mb-2 block">
            Instructions to Recruiter
          </Label>
          <Textarea
            placeholder="Any additional instructions or preferences..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-20"
            {...step6Form.register("instructions")}
          />
        </div>

        {/* Password Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Create Your Password
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-blue-600 mb-2 block">
                Password
              </Label>
              <PasswordInput
                placeholder="Create a password (min 6 characters)"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
              <Label className="text-sm font-medium text-blue-600 mb-2 block">
                Confirm Password
              </Label>
              <PasswordInput
                placeholder="Confirm your password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-8">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            <div className="bg-white rounded-lg flex-1 flex flex-col overflow-hidden p-8">
              {renderContent()}
            </div>

            {/* Navigation - Fixed at bottom */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t flex-shrink-0">
              <Button
                variant="ghost"
                onClick={onPrevStep}
                disabled={currentStep === 1}
                className="text-gray-600 text-sm px-4 h-10"
                data-testid="button-prev-step"
              >
                ← Previous Step
              </Button>

              {currentStep === steps.length ? (
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-8 h-10 rounded-md"
                  data-testid="button-submit-registration"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button
                  onClick={onNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-8 h-10 rounded-md"
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
