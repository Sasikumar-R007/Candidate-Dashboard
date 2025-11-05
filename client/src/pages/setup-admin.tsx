import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AdminSetupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface AdminInfo {
  email: string;
  name: string;
  note: string;
}

export default function SetupAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if admin already exists on mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await apiRequest("GET", "/api/bootstrap/check", undefined);
        const result = await response.json();
        setAdminExists(result.adminExists);
        setAdminInfo(result.adminInfo);
      } catch (error) {
        console.error('Failed to check admin status:', error);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminExists();
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdminSetupForm>();

  const password = watch("password");

  const onSubmit = async (data: AdminSetupForm) => {
    setIsLoading(true);
    
    try {
      const adminData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: "admin",
        department: "Administration",
        joiningDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      const response = await apiRequest("POST", "/api/bootstrap/admin", adminData);
      const result = await response.json();

      if (!response.ok) {
        if (result.adminExists) {
          setAdminExists(true);
        }
        throw new Error(result.message || "Failed to create admin account");
      }

      toast({
        title: "Admin Account Created!",
        description: "Your admin account has been successfully created. You can now login.",
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/employer-login");
      }, 2000);

    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to create admin account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking admin
  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <BrainCircuit className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              <p className="text-gray-600">Checking system status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin already exists message
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Already Exists</h2>
              <p className="text-gray-600">
                An admin account has already been created for this system.
                <br />
                Please use the login page to access your account.
              </p>
              
              {adminInfo && (
                <Alert className="mt-4 bg-blue-50 border-blue-200" data-testid="alert-admin-info">
                  <AlertDescription className="text-left space-y-2">
                    <div className="font-semibold text-blue-900">Testing Information:</div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> 
                        <span className="ml-2" data-testid="text-admin-name">{adminInfo.name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> 
                        <span className="ml-2" data-testid="text-admin-email">{adminInfo.email}</span>
                      </div>
                      <div className="pt-2 text-xs text-amber-700 italic">
                        {adminInfo.note}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={() => navigate("/employer-login")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-go-to-login"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Setup Complete!</h2>
              <p className="text-gray-600">
                Your admin account has been created successfully.
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">StaffOS Admin Setup</CardTitle>
            <CardDescription>
              Create your first admin account to get started
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-admin-setup">
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
                data-testid="input-admin-name"
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
                placeholder="admin@example.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className={errors.email ? "border-red-500" : ""}
                data-testid="input-admin-email"
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
                data-testid="input-admin-phone"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={errors.password ? "border-red-500" : ""}
                data-testid="input-admin-password"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match"
                })}
                className={errors.confirmPassword ? "border-red-500" : ""}
                data-testid="input-admin-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
              data-testid="button-create-admin"
            >
              {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/employer-login")}
                  className="text-blue-600 hover:underline font-medium"
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
