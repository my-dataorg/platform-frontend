import { auth } from "@/auth";
import {
  PendingInvitationsBannerClient,
  type PendingInvitation,
} from "@/components/pending-invitations-banner-client";

const API = process.env.EDUCATION_API_URL || "http://localhost:8010";

export async function PendingInvitationsBanner() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (session.user?.email) {
    headers["X-User-Email"] = session.user.email;
  }

  let invites: PendingInvitation[] = [];
  try {
    const res = await fetch(`${API}/v1/users/me/invitations`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      invites = await res.json();
    }
  } catch {
    return null;
  }

  if (invites.length === 0) return null;
  return <PendingInvitationsBannerClient invites={invites} />;
}
