import type { Session } from "next-auth";
import { businessDirectUserApiUrl } from "@/lib/business-api-url";

export type BusinessJoinInboxItem = {
  id: string;
  businessId?: string;
  businessName?: string | null;
  displayName?: string | null;
  userEmail?: string | null;
  requestedRole: string;
  associationPath?: string | null;
};

/** Server-side pending join requests for business owners (same pattern as education invites). */
export async function fetchBusinessJoinInbox(
  session: Session | null
): Promise<BusinessJoinInboxItem[]> {
  if (!session?.accessToken) return [];

  const url = businessDirectUserApiUrl("/v1/users/me/join-request-inbox");
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as BusinessJoinInboxItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
