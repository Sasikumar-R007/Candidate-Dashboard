import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import illustrationUrl from "@assets/recruiter ,Team lead ,Admin_1758168597473.png";

interface LoginForm {
  email: string;
  password: string;
}

export default function EmployerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login logic with API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Exact Design from Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={illustrationUrl} 
          alt="Track. Improve. Win every hire with data-driven insights" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hello Again!</h2>
              <p className="text-gray-600 mt-2">Login to Your Account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-employer-login">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  className="w-full h-11 border border-gray-300 rounded bg-gray-50 px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
                  data-testid="input-email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm mb-1 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  className="w-full h-11 border border-gray-300 rounded bg-gray-50 px-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-gray-700"
                  data-testid="input-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-left">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
                data-testid="button-forgot-password"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 text-base font-medium rounded transition-colors"
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Divider */}
            <div className="text-center">
              <span className="text-gray-500 text-sm">Or</span>
            </div>

            {/* Continue with Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 text-base font-medium rounded flex items-center justify-center space-x-2"
              data-testid="button-google-login"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with</span>
            </Button>

            {/* Don't have an account */}
            <div className="text-center">
              <span className="text-gray-600">Don't have an Account? </span>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 font-medium"
                data-testid="button-register"
              >
                Register Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}