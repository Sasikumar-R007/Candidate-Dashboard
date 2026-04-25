
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
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="bg-slate-900 px-8 py-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/20 p-2 rounded-xl backdrop-blur-sm">
              <Lock className="text-blue-400 h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Change Password</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 font-medium text-sm">
            Keep your account secure by updating your password regularly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-500 flex justify-between">
                Current Password
              </Label>
              <div className="relative group">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  placeholder="••••••••"
                  className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500 font-medium text-slate-900 pr-12 transition-all group-hover:border-slate-300 placeholder:text-slate-300"
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-500 flex justify-between">
                New Password
              </Label>
              <div className="relative group">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500 font-medium text-slate-900 pr-12 transition-all group-hover:border-slate-300 placeholder:text-slate-300"
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-500 flex justify-between">
                Confirm New Password
              </Label>
              <div className="relative group">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repeat new password"
                  className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500 font-medium text-slate-900 pr-12 transition-all group-hover:border-slate-300 placeholder:text-slate-300"
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

          <DialogFooter className="pt-4 flex sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 px-8 rounded-2xl border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all flex-1 tracking-tight"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-10 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex-1 tracking-tight"
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
