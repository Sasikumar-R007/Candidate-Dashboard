import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AccountHoldOverlay() {
  const { holdPending, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!holdPending) return;
    setSecondsLeft(holdPending.logoutInSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void logout().then(() => {
            window.location.href = "/employer-login";
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [holdPending, logout]);

  if (!holdPending) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-amber-300 bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-700">
          <AlertTriangle className="h-8 w-8 shrink-0" />
          <h2 className="text-lg font-semibold text-gray-900">Account On Hold</h2>
        </div>

        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{holdPending.holdMessage}</p>

        {holdPending.holdUntilLabel && (
          <p className="mt-3 text-sm text-gray-500">
            Access resumes: <span className="font-medium text-gray-800">{holdPending.holdUntilLabel}</span>
          </p>
        )}

        <div className="mt-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-900">
            Logging out in <span className="text-xl font-bold tabular-nums">{secondsLeft}</span> sec
          </p>
        </div>
      </div>
    </div>
  );
}
