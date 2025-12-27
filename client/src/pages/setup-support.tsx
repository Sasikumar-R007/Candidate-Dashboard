import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Headset, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SupportSetupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface SupportInfo {
  email: string;
  name: string;
  note: string;
}

export default function SetupSupport() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [supportExists, setSupportExists] = useState(false);
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);
  const [checkingSupport, setCheckingSupport] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkSupportExists = async () => {
      try {
        const response = await apiRequest("GET", "/api/bootstrap/support/check", undefined);
        const result = await response.json();
        setSupportExists(result.supportExists);
        setSupportInfo(result.supportInfo);
      } catch (error) {
        console.error('Failed to check support status:', error);
      } finally {
        setCheckingSupport(false);
      }
    };
    
    checkSupportExists();
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SupportSetupForm>();

  const password = watch("password");

  const handleResetSupport = async () => {
    if (!securityKey.trim()) {
      toast({
        title: "Security Key Required",
        description: "Please enter the security key to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    
    try {
      const response = await apiRequest("DELETE", "/api/bootstrap/support", {
        securityKey: securityKey.trim(),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset support account");
      }

      toast({
        title: "Support Account Reset Successful",
        description: result.message,
      });

      setShowResetDialog(false);
      setSecurityKey("");
      setSupportExists(false);
      setSupportInfo(null);
      
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset support account. Please check your security key.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const onSubmit = async (data: SupportSetupForm) => {
    setIsLoading(true);
    
    try {
      const supportData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: "support",
        department: "Support",
        joiningDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      const response = await apiRequest("POST", "/api/bootstrap/support", supportData);
      const result = await response.json();

      if (!response.ok) {
        if (result.supportExists) {
          setSupportExists(true);
        }
        throw new Error(result.message || "Failed to create support account");
      }

      toast({
        title: "Support Account Created!",
        description: "Your support account has been successfully created. You can now login.",
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/support-login");
      }, 2000);

    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to create support account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSupport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Headset className="w-12 h-12 text-red-600 animate-pulse" />
              </div>
              <p className="text-gray-600">Checking system status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (supportExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Support Account Already Exists</h2>
              <p className="text-gray-600">
                A support team account has already been created for this system.
                <br />
                Please use the login page to access your account.
              </p>
              
              {supportInfo && (
                <Alert className="mt-4 bg-red-50 border-red-200" data-testid="alert-support-info">
                  <AlertDescription className="text-left space-y-2">
                    <div className="font-semibold text-red-900">Testing Information:</div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> 
                        <span className="ml-2" data-testid="text-support-name">{supportInfo.name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> 
                        <span className="ml-2" data-testid="text-support-email">{supportInfo.email}</span>
                      </div>
                      <div className="pt-2 text-xs text-amber-700 italic">
                        {supportInfo.note}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => navigate("/support-login")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-go-to-login"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="destructive"
                  className="flex-1"
                  data-testid="button-reset-support"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent data-testid="dialog-reset-support">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Reset Support Account
              </DialogTitle>
              <DialogDescription>
                This action will permanently delete the existing support account. You'll need to enter the security key to proceed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="securityKey">Security Key *</Label>
                <PasswordInput
                  id="securityKey"
                  placeholder="Enter security key"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  className="w-full"
                  data-testid="input-security-key"
                  showPasswordToggle={false}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleResetSupport();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  This key was configured by your system administrator
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setSecurityKey("");
                }}
                disabled={isResetting}
                data-testid="button-cancel-reset"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetSupport}
                disabled={isResetting}
                data-testid="button-confirm-reset"
              >
                {isResetting ? "Resetting..." : "Reset Support Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
              <p className="text-gray-600">
                Your support account has been created successfully.
                <br />
                Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Headset className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">StaffOS Support Team Setup</CardTitle>
            <CardDescription>
              Create your support team account to get started
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-support-setup">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name", { 
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
                className={errors.name ? "border-red-500" : ""}
                data-testid="input-support-name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="support@example.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className={errors.email ? "border-red-500" : ""}
                data-testid="input-support-email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone", { 
                  required: "Phone number is required",
                  minLength: { value: 10, message: "Phone number must be at least 10 digits" }
                })}
                className={errors.phone ? "border-red-500" : ""}
                data-testid="input-support-phone"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={errors.password ? "border-red-500" : ""}
                data-testid="input-support-password"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                className={errors.confirmPassword ? "border-red-500" : ""}
                data-testid="input-support-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
              data-testid="button-create-support"
            >
              {isLoading ? "Creating Support Account..." : "Create Support Account"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/support-login")}
                  className="text-red-600 hover:underline font-medium"
                  data-testid="link-go-to-login"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
