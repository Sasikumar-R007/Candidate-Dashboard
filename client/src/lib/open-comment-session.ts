import { useEffect } from "react";

export const OPEN_COMMENT_SESSION_EVENT = "staffos-open-comment-session";

export type OpenCommentSessionDetail = {
  applicationId: string;
};

export function dispatchOpenCommentSession(applicationId: string) {
  if (!applicationId) {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<OpenCommentSessionDetail>(OPEN_COMMENT_SESSION_EVENT, {
      detail: { applicationId },
    }),
  );
}

/** Listen for bell/push navigation to open a candidate comment session. */
export function useOpenCommentSessionListener(onOpen: (applicationId: string) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const applicationId = (event as CustomEvent<OpenCommentSessionDetail>).detail?.applicationId;
      if (applicationId) {
        onOpen(applicationId);
      }
    };
    window.addEventListener(OPEN_COMMENT_SESSION_EVENT, handler);
    return () => window.removeEventListener(OPEN_COMMENT_SESSION_EVENT, handler);
  }, [onOpen]);
}
