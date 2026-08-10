"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { NotificationsPopover } from "@/components/notifications-popover";
import { UserMenu } from "@/components/user-menu";
import { productIcon } from "@/lib/product-icons";
import type { PendingInvitation } from "@/lib/invitations";

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  invites: PendingInvitation[];
  activeApp?: {
    slug: string;
    name: string;
  };
  showSearch?: boolean;
};

export function ShellHeader({ user, invites, activeApp, showSearch = true }: Props) {
  const ActiveIcon = activeApp ? productIcon(activeApp.slug) : null;

  return (
    <header className="sticky top-0 z-40 bg-shell text-shell-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <Link href="/dashboard" className="font-serif text-lg font-semibold tracking-tight text-shell-foreground">
            MyData
          </Link>
          {activeApp && ActiveIcon && (
            <div className="flex min-w-0 items-center gap-2 border-l border-white/15 pl-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ActiveIcon className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-sm font-medium text-shell-foreground/90">{activeApp.name}</span>
            </div>
          )}
        </div>

        {showSearch && !activeApp && (
          <form action="/marketplace" className="mx-auto hidden max-w-md flex-1 md:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-shell-muted" />
              <input
                name="q"
                type="search"
                placeholder="Search"
                className="h-10 w-full rounded-full border-0 bg-white/95 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          <NotificationsPopover invites={invites} />
          <UserMenu name={user.name} email={user.email} shell />
        </div>
      </div>
    </header>
  );
}
