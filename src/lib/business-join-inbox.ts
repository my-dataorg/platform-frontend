import type { Session } from "next-auth";
import { businessJoinRequestInboxUpstreamUrls } from "@/lib/business-api-url";

export type BusinessJoinInboxItem = {
  id: string;
  businessId?: string;
  businessName?: string | null;
  displayName?: string | null;
  userEmail?: string | null;
  requestedRole: string;
  associationPath?: string | null;
};

function businessJoinInboxUrls(): string[] {
  const urls = [...businessJoinRequestInboxUpstreamUrls()];
  if (process.env.RUNNING_IN_DOCKER === "1") {
    urls.push("http://business-backend:8040/v1/users/me/join-request-inbox");
  }
  urls.push("http://127.0.0.1:8040/v1/users/me/join-request-inbox");
  return [...new Set(urls)];
}

export async function fetchBusinessJoinInboxWithToken(
  accessToken: string
): Promise<BusinessJoinInboxItem[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  for (const url of businessJoinInboxUrls()) {
    try {
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as BusinessJoinInboxItem[];
      return Array.isArray(data) ? data : [];
    } catch {
      continue;
    }
  }
  return [];
}

/** Server-side pending join requests for business owners (same pattern as education invites). */
export async function fetchBusinessJoinInbox(
  session: Session | null
): Promise<BusinessJoinInboxItem[]> {
  if (!session?.accessToken) return [];
  return fetchBusinessJoinInboxWithToken(session.accessToken);
}
