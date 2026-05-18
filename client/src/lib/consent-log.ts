import { queryClient } from "@/lib/queryClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;

type ConsentRole = "candidate" | "client" | "employee";
type ConsentType = "platform_consent" | "job_consent" | "client_agreement" | "employee_agreement";

type ConsentLogPayload = {
  user_id: string;
  role: ConsentRole;
  consent_type: ConsentType;
  policy_version: string;
};

export async function logConsent(payload: ConsentLogPayload): Promise<boolean> {
  try {
    const res = await fetch(createApiUrl("/api/consent/log"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const ok = res.ok;
    if (ok) {
      void queryClient.invalidateQueries({ queryKey: ["/api/consent/acceptance-status"] });
    }
    return ok;
  } catch (error) {
    console.warn("Consent logging failed:", error);
    return false;
  }
}
