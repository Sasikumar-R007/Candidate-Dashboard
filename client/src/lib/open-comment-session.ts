import { useEffect } from "react";

export const OPEN_COMMENT_SESSION_EVENT = "staffos-open-comment-session";

export type OpenCommentSessionDetail = {
  applicationId: string;
  focusComposer?: boolean;
};

export type OpenCommentSessionOptions = {
  focusComposer?: boolean;
};

export function getFocusCommentComposerStorageKey(applicationId: string) {
  return `staffos-focus-comment-composer:${applicationId}`;
}

export function dispatchOpenCommentSession(
  applicationId: string,
  options?: OpenCommentSessionOptions,
) {
  if (!applicationId) {
    return;
  }
  if (options?.focusComposer) {
    try {
      sessionStorage.setItem(getFocusCommentComposerStorageKey(applicationId), "1");
    } catch {
      // non-blocking
    }
  }
  window.dispatchEvent(
    new CustomEvent<OpenCommentSessionDetail>(OPEN_COMMENT_SESSION_EVENT, {
      detail: { applicationId, focusComposer: options?.focusComposer },
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
