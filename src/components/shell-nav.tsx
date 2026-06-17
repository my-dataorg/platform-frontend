import { auth } from "@/auth";
import { ShellHeader } from "@/components/shell-header";
import { fetchPendingInvitations } from "@/lib/invitations";

export async function ShellNav() {
  const session = await auth();
  const invites = await fetchPendingInvitations(session);

  return (
    <ShellHeader
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
      invites={invites}
    />
  );
}
