import type { Session } from "next-auth";

export type PendingInvitation = {
  id: string;
  instituteId: string;
  instituteName: string;
  role: string;
};

const API = process.env.EDUCATION_API_URL || "http://localhost:8010";

export async function fetchPendingInvitations(
  session: Session | null
): Promise<PendingInvitation[]> {
  if (!session?.accessToken) return [];

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (session.user?.email) {
    headers["X-User-Email"] = session.user.email;
  }

  try {
    const res = await fetch(`${API}/v1/users/me/invitations`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      return res.json();
    }
  } catch {
    // Education API may be offline during local dev
  }
  return [];
}
