import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { number: 1, title: "Resume", description: "Upload Your Resume" },
  { number: 2, title: "About You", description: "Personal Information" },
  { number: 3, title: "Your Strength", description: "Career Details" },
  { number: 4, title: "Your Journey", description: "Company Information" },
  { number: 5, title: "Online Presence", description: "Social Profiles" },
  { number: 6, title: "Job Preferences", description: "Job Preferences" },
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
    <div className="w-full h-screen bg-gradient-to-b from-blue-600 to-blue-700 text-white p-8 flex flex-col">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-2">
          <span className="text-blue-600 font-bold text-lg">S</span>
        </div>
        <p className="text-sm font-semibold">StaffOS</p>
      </div>

      {/* Steps */}
      <div className="flex-1 space-y-6">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="relative flex items-start gap-4">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 transition-all ${
                    isCompleted ? "bg-white" : "bg-blue-400"
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                  isCompleted
                    ? "bg-white text-blue-600"
                    : isActive
                    ? "bg-white text-blue-600 ring-4 ring-blue-300"
                    : "bg-blue-500 text-white"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 mt-1">
                <p
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-blue-100"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-blue-200 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 1: Resume
  const Step1Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">Upload Resume</p>

      {/* Resume Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Upload Resume
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            Drag & Drop a file here or Click to Browse
          </p>
          <p className="text-gray-500 text-sm mb-4">Expected PDF Docx</p>
          <p className="text-gray-500 text-sm mb-4">Max file size 5MB</p>
          <div className="flex items-center justify-center gap-2">
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
              onClick={() => document.getElementById("resume-input")?.click()}
            >
              Select Resume
            </Button>
            <span className="text-red-500 text-sm">Skip now</span>
          </div>
          {resumeFileName && (
            <p className="text-sm text-green-600 mt-2">✓ {resumeFileName}</p>
          )}
        </div>
      </div>

      {/* Certificates Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Upload Certificates <span className="text-blue-600">+</span>
        </label>
        <div className="border border-gray-200 rounded-lg p-6">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 mb-2">
            Upload Image
          </Button>
          <p className="text-gray-600 text-sm">
            or drop a file, paste image, use{" "}
            <span className="text-gray-500">url</span>
          </p>
          <p className="text-red-500 text-sm mt-2">Skip now</p>
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
                <p key={idx} className="text-sm text-green-600">
                  ✓ {name}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: About You
  const Step2Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">About You</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">First Name</Label>
          <Input
            placeholder="First Name"
            className="border border-gray-300"
            {...step2Form.register("firstName")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Last Name</Label>
          <Input
            placeholder="Last Name"
            className="border border-gray-300"
            {...step2Form.register("lastName")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Mobile Number
          </Label>
          <Input
            placeholder="Mobile Number"
            className="border border-gray-300"
            {...step2Form.register("mobileNumber")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Alternative Mobile Number
          </Label>
          <Input
            placeholder="Alternative Mobile Number"
            className="border border-gray-300"
            {...step2Form.register("alternativeMobileNumber")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Primary Email
          </Label>
          <Input
            type="email"
            placeholder="Primary Email"
            className="border border-gray-300"
            {...step2Form.register("primaryEmail")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Secondary Email
          </Label>
          <Input
            type="email"
            placeholder="Secondary Email"
            className="border border-gray-300"
            {...step2Form.register("secondaryEmail")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Date of Birth
          </Label>
          <Input
            type="date"
            className="border border-gray-300"
            {...step2Form.register("dateOfBirth")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            WhatsApp Number
          </Label>
          <Input
            placeholder="WhatsApp Number"
            className="border border-gray-300"
            {...step2Form.register("whatsappNumber")}
          />
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-sm text-gray-700 mb-2 block">Current Status</Label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
          <option value="">Select Status</option>
          <option value="employed">Currently Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="freelance">Freelancer</option>
        </select>
      </div>
    </div>
  );

  // Step 3: Your Strength
  const Step3Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">Your Strength</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Job Type</Label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
            <option value="">Select Job Type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Primary Skill
          </Label>
          <Input
            placeholder="Marketing Analytics"
            className="border border-gray-300"
            {...step3Form.register("primarySkill")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            University Name
          </Label>
          <Input
            placeholder="University Name"
            className="border border-gray-300"
            {...step3Form.register("universityName")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Secondary Skill
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="SEO"
              className="border border-gray-300"
              {...step3Form.register("secondarySkill")}
            />
            <Button variant="outline" className="px-3">
              +
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            College Name
          </Label>
          <Input
            placeholder="College Name"
            className="border border-gray-300"
            {...step3Form.register("collegeName")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Resource Management
          </Label>
          <Input
            placeholder="Resource Management"
            className="border border-gray-300"
            readOnly
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Proficiency Level
          </Label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Business Strategy
          </Label>
          <Input
            placeholder="Business Strategy"
            className="border border-gray-300"
            readOnly
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Your Journey
  const Step4Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">Your Journey</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Current Company
          </Label>
          <Input
            placeholder="Company Name"
            className="border border-gray-300"
            {...step4Form.register("currentCompany")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Company Sector
          </Label>
          <Input
            placeholder="Company Sector"
            className="border border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Current Role
          </Label>
          <Input
            placeholder="Your Role"
            className="border border-gray-300"
            {...step4Form.register("currentRole")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Company Type
          </Label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
            <option value="">Select Type</option>
            <option value="startup">Startup</option>
            <option value="mid-size">Mid-size</option>
            <option value="enterprise">Enterprise</option>
            <option value="mnc">MNC</option>
          </select>
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Company Level
          </Label>
          <Input
            placeholder="Level/Grade"
            className="border border-gray-300"
            {...step4Form.register("companyLevel")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Product Category
          </Label>
          <Input
            placeholder="Product Category"
            className="border border-gray-300"
            {...step4Form.register("productCategory")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Product Domain
          </Label>
          <Input
            placeholder="Domain"
            className="border border-gray-300"
            {...step4Form.register("productDomain")}
          />
        </div>
      </div>
    </div>
  );

  // Step 5: Online Presence
  const Step5Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">Online Presence</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">LinkedIn</Label>
          <Input
            type="url"
            placeholder="LinkedIn URL"
            className="border border-gray-300"
            {...step5Form.register("linkedinUrl")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Portfolio</Label>
          <Input
            type="url"
            placeholder="Portfolio URL"
            className="border border-gray-300"
            {...step5Form.register("portfolioUrl")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Location</Label>
          <Input
            placeholder="City, Country"
            className="border border-gray-300"
            {...step5Form.register("currentLocation")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Website</Label>
          <Input
            type="url"
            placeholder="Website URL"
            className="border border-gray-300"
            {...step5Form.register("websiteUrl")}
          />
        </div>
      </div>
    </div>
  );

  // Step 6: Job Preferences
  const Step6Content = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Launchpad</h2>
      <p className="text-gray-600 mb-8">Job Preferences</p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">Job Title</Label>
          <Input
            placeholder="Desired Job Title"
            className="border border-gray-300"
            {...step6Form.register("jobTitle")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Employment type
          </Label>
          <Input
            placeholder="Full Time"
            className="border border-gray-300"
            {...step6Form.register("employmentType")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Preferred Location
          </Label>
          <Input
            placeholder="City, Country"
            className="border border-gray-300"
            {...step6Form.register("preferredLocation")}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700 mb-2 block">
            Starting date
          </Label>
          <Input
            type="date"
            className="border border-gray-300"
            {...step6Form.register("startingDate")}
          />
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-sm text-gray-700 mb-2 block">
          Instructions to Recruiter
        </Label>
        <Textarea
          placeholder="Any additional instructions or preferences..."
          className="border border-gray-300 min-h-24"
          {...step6Form.register("instructions")}
        />
      </div>

      {/* Password Section */}
      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create Your Password
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">Password</Label>
            <Input
              type="password"
              placeholder="Create a password (min 6 characters)"
              className="border border-gray-300"
              {...step6Form.register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {step6Form.formState.errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {step6Form.formState.errors.password.message as string}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              Confirm Password
            </Label>
            <Input
              type="password"
              placeholder="Confirm your password"
              className="border border-gray-300"
              {...step6Form.register("confirmPassword", {
                required: "Please confirm your password",
              })}
            />
            {step6Form.formState.errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {step6Form.formState.errors.confirmPassword.message as string}
              </p>
            )}
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
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <StepperSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <h3 className="text-lg font-semibold">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8">
              {renderContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                <Button
                  variant="ghost"
                  onClick={onPrevStep}
                  disabled={currentStep === 1}
                  className="text-gray-600"
                  data-testid="button-prev-step"
                >
                  ← Previous Step
                </Button>

                {currentStep === steps.length ? (
                  <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    data-testid="button-submit-registration"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                ) : (
                  <Button
                    onClick={onNextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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
    </div>
  );
}
