import { auth } from "@/auth";
import { ShellNav } from "@/components/shell-nav";
import { InvitationsList } from "@/components/invitations-list";
import { redirect } from "next/navigation";

const API = process.env.EDUCATION_API_URL || "http://localhost:8010";

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (session.user?.email) {
    headers["X-User-Email"] = session.user.email;
  }

  let invites = [];
  const res = await fetch(`${API}/v1/users/me/invitations`, {
    headers,
    cache: "no-store",
  });
  if (res.ok) {
    invites = await res.json();
  }

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Institute invitations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {session.user?.email}. Accept an invitation to join an institute.
        </p>
        {invites.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No pending invitations. Ask your institute admin to invite this email address.
          </p>
        ) : (
          <div className="mt-8">
            <InvitationsList invites={invites} />
          </div>
        )}
      </main>
    </>
  );
}
