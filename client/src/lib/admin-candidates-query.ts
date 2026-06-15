import { apiRequest } from "./queryClient";

export const ADMIN_CANDIDATES_DEFAULT_LIMIT = 20;
export const ADMIN_CANDIDATES_MAX_LIMIT = 100;

export type AdminCandidatesPage = {
  data: any[];
  total: number;
  page: number;
  limit: number;
};

export function parseAdminCandidatesResponse(body: unknown): AdminCandidatesPage {
  if (Array.isArray(body)) {
    return {
      data: body,
      total: body.length,
      page: 1,
      limit: body.length || ADMIN_CANDIDATES_DEFAULT_LIMIT,
    };
  }

  const parsed = body as Partial<AdminCandidatesPage>;
  return {
    data: Array.isArray(parsed?.data) ? parsed.data : [],
    total: Number(parsed?.total) || 0,
    page: Number(parsed?.page) || 1,
    limit: Number(parsed?.limit) || ADMIN_CANDIDATES_DEFAULT_LIMIT,
  };
}

export async function fetchAdminCandidatesPage(
  page = 1,
  limit = ADMIN_CANDIDATES_DEFAULT_LIMIT,
): Promise<AdminCandidatesPage> {
  const safeLimit = Math.min(ADMIN_CANDIDATES_MAX_LIMIT, Math.max(1, limit));
  const params = new URLSearchParams({
    page: String(Math.max(1, page)),
    limit: String(safeLimit),
  });
  const response = await apiRequest("GET", `/api/admin/candidates?${params.toString()}`);
  return parseAdminCandidatesResponse(await response.json());
}

export function adminCandidatesQueryOptions(page = 1, limit = ADMIN_CANDIDATES_DEFAULT_LIMIT) {
  return {
    queryKey: ["/api/admin/candidates", page, limit] as const,
    queryFn: () => fetchAdminCandidatesPage(page, limit),
  };
}
