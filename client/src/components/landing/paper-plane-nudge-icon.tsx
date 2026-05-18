import { cn } from "@/lib/utils";
import { FaPaperPlane } from "react-icons/fa";

/** Solid paper-plane (Font Awesome–style) for Nudges UI */
export function PaperPlaneNudgeIcon({ className }: { className?: string }) {
  return <FaPaperPlane className={cn("shrink-0", className)} aria-hidden />;
}
