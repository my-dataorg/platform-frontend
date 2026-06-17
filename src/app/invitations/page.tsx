import { auth } from "@/auth";
import { ShellNav } from "@/components/shell-nav";
import { InvitationsList } from "@/components/invitations-list";
import { fetchPendingInvitations } from "@/lib/invitations";
import { redirect } from "next/navigation";

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const invites = await fetchPendingInvitations(session);

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Institute invitations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {session.user?.email}. You can also manage invitations from
          the notifications bell in the header.
        </p>
        {invites.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            No pending invitations. Ask your institute admin to invite this email
            address.
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
