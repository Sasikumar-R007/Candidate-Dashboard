import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type PipelineColumnScrollProps = {
  children: ReactNode;
  className?: string;
};

/** Column body: hidden scrollbar, fade + down arrow when more content below. */
export function PipelineColumnScroll({ children, className = "" }: PipelineColumnScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 2;
    const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setShowScrollHint(hasOverflow && notAtBottom);
  }, []);

  useEffect(() => {
    updateScrollHint();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, updateScrollHint]);

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 140, behavior: "smooth" });
  };

  return (
    <div className={`relative min-h-0 flex-1 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={updateScrollHint}
        className="pipeline-column-scroll-hide min-h-0 h-full overflow-y-auto overflow-x-hidden px-2 py-2"
      >
        {children}
      </div>
      {showScrollHint ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-white via-white/80 to-transparent"
            aria-hidden
          />
          <button
            type="button"
            onClick={scrollDown}
            className="absolute bottom-2.5 left-1/2 z-[2] flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-white"
            aria-label="Show more candidates"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </>
      ) : null}
    </div>
  );
}
