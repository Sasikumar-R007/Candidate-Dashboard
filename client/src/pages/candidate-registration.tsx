import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Upload, Edit3, Check } from "lucide-react";

interface ResumeForm {
  resume?: File;
  customJD?: string;
}

interface AboutYouForm {
  jobTitle: string;
  jobNature: string;
  salaryRange: string;
  secondarySkill: string;
}

interface YourStrengthForm {
  jobType: string;
  noticePeriod: string;
  designation: string;
  skillset: string;
}

interface YourJourneyForm {
  primarySkill: string;
  experience: string;
  qualification: string;
  alternativeSkill: string;
}

interface OnlinePresenceForm {
  currentCompany: string;
  companyStatus: string;
  previousRole: string;
  expectedSalary: string;
}

interface JobPreferencesForm {
  workedAt: string;
  problemCategory: string;
  currentLevel: string;
  positionsOpen: string;
}

const steps = [
  { id: 1, title: "Resume", icon: Upload },
  { id: 2, title: "About You", icon: Edit3 },
  { id: 3, title: "Your Strength", icon: Check },
  { id: 4, title: "Your Journey", icon: Check },
  { id: 5, title: "Online presence", icon: Check },
  { id: 6, title: "Job Preferences", icon: Check },
  { id: 7, title: "Complete", icon: Check }
];

export default function CandidateRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();

  const resumeForm = useForm<ResumeForm>();
  const aboutYouForm = useForm<AboutYouForm>();
  const strengthForm = useForm<YourStrengthForm>();
  const journeyForm = useForm<YourJourneyForm>();
  const presenceForm = useForm<OnlinePresenceForm>();
  const preferencesForm = useForm<JobPreferencesForm>();

  const onNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = () => {
    // Navigate to candidate dashboard after completion
    setLocation('/candidate');
  };

  const renderStepProgress = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step.id <= currentStep 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : step.id === currentStep + 1 
                ? 'border-blue-300 text-blue-600' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {step.id <= currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${
                step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepTitles = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`text-center ${
              step.id === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            <div className="text-sm">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResumeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload. Parse. Progress.</h2>
        <p className="text-gray-600">Finding the right job isn't easy — but we've built StaffOS.</p>
        <p className="text-gray-600">Upload your resume and let StaffOS help you get noticed by the right employers, faster.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag & Drop A file here or Click to Browse</p>
          <p className="text-sm text-gray-500">Supported: PDF, Docx</p>
          <p className="text-sm text-gray-500">Max File Size: 5MB</p>
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            {...resumeForm.register("resume")}
          />
        </div>

        {/* Custom JD */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-gray-600 mr-2" />
            <span className="text-gray-600">Copy & Paste Or Write Your Own JD</span>
          </div>
          <textarea
            className="w-full h-32 border border-gray-300 rounded-lg p-4 resize-none"
            placeholder="Write your job description here..."
            {...resumeForm.register("customJD")}
          />
        </div>
      </div>
    </div>
  );

  const renderAboutYouStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Show off what makes you awesome at what you do</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="jobTitle" className="block text-sm font-medium mb-2">Job Title</Label>
          <Input
            id="jobTitle"
            placeholder="First Name"
            className="w-full"
            {...aboutYouForm.register("jobTitle", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="jobNature" className="block text-sm font-medium mb-2">Job Nature</Label>
          <Input
            id="jobNature"
            placeholder="Last Name"
            className="w-full"
            {...aboutYouForm.register("jobNature", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="salaryRange" className="block text-sm font-medium mb-2">Salary Range</Label>
          <Input
            id="salaryRange"
            placeholder="Salary Range"
            className="w-full"
            {...aboutYouForm.register("salaryRange", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="secondarySkill" className="block text-sm font-medium mb-2">Secondary Skill</Label>
          <Input
            id="secondarySkill"
            placeholder="Secondary Skill"
            className="w-full"
            {...aboutYouForm.register("secondarySkill", { required: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="qualification" className="block text-sm font-medium mb-2">Qualification Type</Label>
          <Input
            id="qualification"
            placeholder="Enter your qualification"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="reason" className="block text-sm font-medium mb-2">Reason Of CV</Label>
          <Input
            id="reason"
            placeholder="Why are you looking for a job change?"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderYourStrengthStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Show off what makes you awesome at what you do</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="jobType" className="block text-sm font-medium mb-2">Job Type</Label>
          <Input
            id="jobType"
            placeholder="Product Analyst"
            className="w-full"
            {...strengthForm.register("jobType", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="noticePeriod" className="block text-sm font-medium mb-2">Notice Period</Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white"
            {...strengthForm.register("noticePeriod", { required: true })}
          >
            <option value="">Select notice period</option>
            <option value="immediate">Immediate</option>
            <option value="15days">15 Days</option>
            <option value="30days">30 Days</option>
            <option value="60days">60 Days</option>
            <option value="90days">90 Days</option>
          </select>
        </div>
        <div>
          <Label htmlFor="designation" className="block text-sm font-medium mb-2">Domain Group</Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white"
            {...strengthForm.register("designation", { required: true })}
          >
            <option value="">Select domain</option>
            <option value="it">Information Technology</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
            <option value="hr">Human Resources</option>
            <option value="sales">Sales</option>
          </select>
        </div>
        <div>
          <Label htmlFor="skillset" className="block text-sm font-medium mb-2">Primary Group</Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white"
            {...strengthForm.register("skillset", { required: true })}
          >
            <option value="">Select primary skill</option>
            <option value="frontend">Frontend Development</option>
            <option value="backend">Backend Development</option>
            <option value="fullstack">Full Stack Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="devops">DevOps</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="experience" className="block text-sm font-medium mb-2">Experience Days</Label>
          <Input
            id="experience"
            placeholder="Enter years of experience"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="alternateskill" className="block text-sm font-medium mb-2">Alternate Skills</Label>
          <Input
            id="alternateskill"
            placeholder="Additional skills you possess"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderYourJourneyStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Tell us where you've been and what you have done so far</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="currentCompany" className="block text-sm font-medium mb-2">Current Company</Label>
          <Input
            id="currentCompany"
            placeholder="Company Name"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="companyStatus" className="block text-sm font-medium mb-2">Company Status</Label>
          <Input
            id="companyStatus"
            placeholder="Company Status"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="previousRole" className="block text-sm font-medium mb-2">Previous Role</Label>
          <Input
            id="previousRole"
            placeholder="Previous Position"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="currentLevel" className="block text-sm font-medium mb-2">Current Level</Label>
          <Input
            id="currentLevel"
            placeholder="Position Category"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="currentLevel" className="block text-sm font-medium mb-2">Problem Domain</Label>
          <Input
            id="problemDomain"
            placeholder="Problem Domain"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="positionCategory" className="block text-sm font-medium mb-2">Position Category</Label>
          <Input
            id="positionCategory"
            placeholder="Position Category"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderResumeStep();
      case 2:
        return renderAboutYouStep();
      case 3:
        return renderYourStrengthStep();
      case 4:
        return renderYourJourneyStep();
      case 5:
      case 6:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600">This step will be available soon.</p>
          </div>
        );
      case 7:
        return (
          <div className="text-center py-12">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">Your profile has been successfully created.</p>
            <Button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Go to Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900 to-blue-700 clip-path-polygon"></div>
        <div className="absolute bottom-0 left-0 opacity-20">
          <svg width="400" height="400" viewBox="0 0 400 400" className="text-blue-600">
            <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.3" />
            <circle cx="150" cy="100" r="15" fill="currentColor" opacity="0.4" />
            <circle cx="100" cy="200" r="25" fill="currentColor" opacity="0.2" />
            <circle cx="250" cy="150" r="18" fill="currentColor" opacity="0.3" />
            <circle cx="200" cy="300" r="22" fill="currentColor" opacity="0.2" />
            <path d="M50,50 L150,100 L100,200 L250,150 L200,300" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Career Launchpad</h1>
          </div>
          <div className="absolute top-4 right-6">
            <div className="text-blue-900 font-bold text-xl">StaffOS</div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {renderStepProgress()}
        {renderStepTitles()}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          {currentStep < 7 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onPrevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
                data-testid="button-prev-step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <Button
                onClick={onNextStep}
                className="bg-slate-800 hover:bg-slate-700 text-white flex items-center space-x-2"
                data-testid="button-next-step"
              >
                <span>Submit</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}