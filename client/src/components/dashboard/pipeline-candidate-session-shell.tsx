import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

type PipelineCandidateSessionShellProps = {
  mode: "board" | "candidate-session";
  board: ReactNode;
  session: ReactNode | null;
  className?: string;
  /** Session covers the entire pipeline area (header + board + sidebar), e.g. TA full-page view */
  fullscreen?: boolean;
};

const TRANSITION_MS = 320;

/** Slide + fade between kanban board and candidate comments session. */
export function PipelineCandidateSessionShell({
  mode,
  board,
  session,
  className = "",
  fullscreen = false,
}: PipelineCandidateSessionShellProps) {
  const [showSession, setShowSession] = useState(mode === "candidate-session");
  const [sessionVisible, setSessionVisible] = useState(false);
  const [boardVisible, setBoardVisible] = useState(mode === "board");

  useEffect(() => {
    if (mode === "candidate-session") {
      setShowSession(true);
      setSessionVisible(false);
      setBoardVisible(true);
      const openTimer = window.setTimeout(() => setSessionVisible(true), 16);
      return () => window.clearTimeout(openTimer);
    }

    setSessionVisible(false);
    setBoardVisible(true);
    const hideSessionTimer = window.setTimeout(() => setShowSession(false), TRANSITION_MS);
    return () => window.clearTimeout(hideSessionTimer);
  }, [mode]);

  const sessionOpen = mode === "candidate-session" && showSession && session;

  return (
    <div className={cn("pipeline-candidate-session-shell relative h-full min-h-0 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full min-h-0 transition-all ease-out",
          fullscreen && sessionOpen ? "absolute inset-0" : "relative",
          boardVisible && mode === "board"
            ? "translate-x-0 opacity-100 duration-300"
            : sessionOpen
              ? "-translate-x-4 opacity-0 duration-300 pointer-events-none"
              : "translate-x-0 opacity-100 duration-300",
        )}
      >
        {board}
      </div>
      {sessionOpen ? (
        <div
          className={cn(
            "bg-white transition-all ease-out",
            fullscreen
              ? "absolute inset-0 z-30 flex h-full min-h-0 flex-col overflow-hidden"
              : "absolute inset-0 z-10",
            sessionVisible
              ? "translate-x-0 opacity-100 duration-300"
              : "translate-x-8 opacity-0 duration-300",
          )}
        >
          <div className={fullscreen ? "h-full min-h-0 flex-1 overflow-hidden" : "h-full"}>
            {session}
          </div>
        </div>
      ) : null}
    </div>
  );
}
