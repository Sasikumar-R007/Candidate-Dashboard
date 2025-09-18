import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { BrainCircuit } from "lucide-react";
import backgroundUrl from "@assets/Rectangle 1260_1758176515546.png";
import businessPersonUrl from "@assets/ChatGPT Image Jul 7, 2025, 07_40_50 PM_1758176567626.png";

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
      {/* Left Side - New Design with Blue Background and Business Person */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden">
        {/* Blue textured background */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-8 text-white w-full">
          {/* StaffOS logo at top left */}
          <div className="flex items-center space-x-3">
            <BrainCircuit className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">StaffOS</span>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center items-start space-y-6">
            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Track. Improve.
                <br />
                Win every hire with
                <br />
                data-driven insights
              </h1>
              <p className="text-lg text-gray-200">
                Your hiring success, simplified into powerful metrics
              </p>
            </div>
            
            {/* Business person illustration */}
            <div className="flex justify-center w-full mt-8">
              <img 
                src={businessPersonUrl} 
                alt="Business analytics illustration" 
                className="max-w-md w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with curved design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Curved white background shape that extends into left panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[130%] bg-white -translate-x-1/4 rounded-l-full z-0 hidden lg:block"></div>
        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <BrainCircuit className="w-12 h-12 text-gray-700" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Hello Again!</h2>
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
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-base font-medium rounded transition-colors"
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}