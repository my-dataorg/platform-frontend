import Link from "next/link";
import { auth } from "@/auth";
import { federatedSignOut } from "@/lib/auth-actions";
import { PendingInvitationsBanner } from "@/components/pending-invitations-banner";
import { LayoutGrid, Store } from "lucide-react";

export async function ShellNav() {
  const session = await auth();

  return (
    <>
      <PendingInvitationsBanner />
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            MyData
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" icon={LayoutGrid} label="Dashboard" />
            <NavLink href="/marketplace" icon={Store} label="Marketplace" />
            <Link
              href="/invitations"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Invitations
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session?.user?.name || session?.user?.email}
          </span>
          <form
            action={async () => {
              "use server";
              await federatedSignOut();
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
