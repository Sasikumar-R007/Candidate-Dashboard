import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function SigningOutOverlay() {
  const { isSigningOut } = useAuth();

  useEffect(() => {
    if (!isSigningOut) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSigningOut]);

  if (!isSigningOut) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Signing out"
    >
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/95 dark:bg-gray-900/95 px-8 py-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900/40" />
          <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogOut className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Signing out
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we securely end your session…
        </p>

        <div className="mt-6 flex justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-red-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-red-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
