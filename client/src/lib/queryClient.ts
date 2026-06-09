import {
  QueryClient,
  QueryFunction,
  MutationCache,
  keepPreviousData,
} from "@tanstack/react-query";
import { getMessageFromApiPayload } from "./api-error-message";
import { scheduleOperationalInvalidation } from "./query-config";

// API base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const message =
      getMessageFromApiPayload(text) ||
      res.statusText ||
      "Request failed. Please try again.";
    throw new Error(message);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = createApiUrl(url);
  const methodUpper = method.toUpperCase();
  const canHaveBody = methodUpper !== "GET" && methodUpper !== "HEAD";
  const hasBody =
    canHaveBody &&
    data !== undefined &&
    data !== null &&
    !(typeof data === "object" && Object.keys(data as object).length === 0);

  const res = await fetch(fullUrl, {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : {},
    body: hasBody ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Helper function for file uploads (FormData)
export async function apiFileUpload(
  url: string,
  formData: FormData,
): Promise<Response> {
  const fullUrl = createApiUrl(url);
  const res = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
    credentials: "include",
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = createApiUrl(url);
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

let queryClient!: QueryClient;

queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      placeholderData: keepPreviousData,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
    mutations: {
      retry: false,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (
        (mutation.meta as { skipOperationalInvalidation?: boolean } | undefined)
          ?.skipOperationalInvalidation
      ) {
        return;
      }
      queueMicrotask(() => {
        scheduleOperationalInvalidation(queryClient, { refetchType: "active" });
      });
    },
  }),
});

export { queryClient };
