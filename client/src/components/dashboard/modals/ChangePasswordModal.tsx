
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Your password has been updated successfully.",
          className: "bg-green-600 text-white border-none",
        });
        onClose();
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[min(88vh,640px)] w-[calc(100%-1.5rem)] max-w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[450px]">
        <DialogHeader className="relative bg-slate-900 px-4 py-5 text-white md:px-8 md:py-8">
          <div className="absolute top-0 right-0 hidden p-8 opacity-10 sm:block">
            <ShieldCheck size={120} />
          </div>
          <div className="mb-1.5 flex items-center gap-2.5 md:mb-2 md:gap-3">
            <div className="rounded-lg bg-blue-500/20 p-1.5 backdrop-blur-sm md:rounded-xl md:p-2">
              <Lock className="h-4 w-4 text-blue-400 md:h-6 md:w-6" />
            </div>
            <DialogTitle className="text-base font-bold tracking-tight md:text-2xl">Change Password</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium text-slate-400 md:text-sm">
            Keep your account secure by updating your password regularly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5 md:space-y-6 md:px-8 md:py-8">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-red-600 md:gap-3 md:rounded-2xl md:px-4 md:py-3">
              <AlertCircle size={16} />
              <p className="text-[11px] font-bold uppercase tracking-tight md:text-xs">{error}</p>
            </div>
          )}

          <div className="space-y-4 md:space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="flex justify-between text-xs font-semibold text-slate-500 md:text-sm">
                Current Password
              </Label>
              <div className="group relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-300 focus-visible:ring-blue-500 group-hover:border-slate-300 md:h-12 md:rounded-2xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="flex justify-between text-xs font-semibold text-slate-500 md:text-sm">
                New Password
              </Label>
              <div className="group relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-300 focus-visible:ring-blue-500 group-hover:border-slate-300 md:h-12 md:rounded-2xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label className="flex justify-between text-xs font-semibold text-slate-500 md:text-sm">
                Confirm New Password
              </Label>
              <div className="group relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repeat new password"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-11 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-300 focus-visible:ring-blue-500 group-hover:border-slate-300 md:h-12 md:rounded-2xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-between md:gap-3 md:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 w-full rounded-xl border-slate-200 px-5 text-xs font-semibold tracking-tight text-slate-600 transition-all hover:bg-slate-50 sm:h-11 sm:flex-1 sm:px-8 md:h-12 md:rounded-2xl md:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl bg-blue-600 px-5 text-xs font-semibold tracking-tight text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 sm:h-11 sm:flex-1 sm:px-10 md:h-12 md:rounded-2xl md:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
