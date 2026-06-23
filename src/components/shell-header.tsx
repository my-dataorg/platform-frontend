"use client";

import Link from "next/link";
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
};

export function ShellHeader({ user, invites, activeApp }: Props) {
  const ActiveIcon = activeApp ? productIcon(activeApp.slug) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-base font-semibold tracking-tight transition hover:opacity-80"
          >
            MyData
          </Link>
          {activeApp && ActiveIcon && (
            <div className="flex min-w-0 items-center gap-2 border-l border-border pl-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ActiveIcon className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-sm font-medium text-foreground">{activeApp.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPopover invites={invites} />
          <UserMenu name={user.name} email={user.email} />
        </div>
      </div>
    </header>
  );
}
