import { auth } from "@/auth";
import { ShellHeader } from "@/components/shell-header";
import { fetchBusinessJoinInbox } from "@/lib/business-join-inbox";
import { fetchPendingInvitations } from "@/lib/invitations";

export async function ShellNav() {
  const session = await auth();
  const [invites, businessJoinInbox] = await Promise.all([
    fetchPendingInvitations(session),
    fetchBusinessJoinInbox(session),
  ]);

  return (
    <ShellHeader
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
      invites={invites}
      businessJoinInbox={businessJoinInbox}
    />
  );
}
