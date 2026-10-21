"use client";

import Link from "next/link";
import { LayoutGrid, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BusinessManageBusinessesDropdown } from "@/components/business-manage-businesses-dropdown";
import { EducationManageInstitutesDropdown } from "@/components/education-manage-institutes-dropdown";
import { dashboardAppUrl } from "@/lib/product-embed";
import { productHomePath } from "@/lib/product-home-path";
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
  const [context, setContext] = useState<{
    name: string;
    subtitle?: string;
    role?: string;
    showManageInstitutes?: boolean;
    showManageBusinesses?: boolean;
  }>({
    name: "",
  });

  useEffect(() => {
    function receiveContext(event: MessageEvent) {
      if (event.data?.type === "app-context") {
        setContext({
          name: typeof event.data.name === "string" ? event.data.name : "",
          subtitle: typeof event.data.subtitle === "string" ? event.data.subtitle : "",
          role: typeof event.data.role === "string" ? event.data.role : "",
          showManageInstitutes: Boolean(event.data.showManageInstitutes),
          showManageBusinesses: Boolean(event.data.showManageBusinesses),
        });
      }
    }
    window.addEventListener("message", receiveContext);
    return () => window.removeEventListener("message", receiveContext);
  }, []);

  const AppIcon = activeApp ? productIcon(activeApp.slug) : null;

  return (
    <header className="sticky top-0 z-40 bg-shell text-shell-foreground shadow-md">
      <div className="flex h-12 min-h-12 w-full items-center gap-1 px-2 sm:h-16 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-shell-foreground hover:bg-white/15 sm:h-9 sm:w-9 sm:rounded-lg"
            aria-label="MyData home"
            title="MyData"
          >
            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          {activeApp && AppIcon && (
            <Link
              href={dashboardAppUrl(activeApp.slug, productHomePath(activeApp.slug))}
              className="inline-flex min-w-0 items-center gap-1 border-l border-white/15 pl-1.5 text-shell-foreground/90 sm:gap-2 sm:pl-3"
              title={activeApp.name}
            >
              <AppIcon className="h-3.5 w-3.5 shrink-0 sm:hidden" aria-hidden />
              <span className="hidden truncate text-sm font-medium sm:inline">{activeApp.name}</span>
              <span className="sr-only sm:hidden">{activeApp.name}</span>
            </Link>
          )}
        </div>

        {activeApp && context.name && (
          <div className="min-w-0 flex-1 px-0.5 text-center sm:px-2 md:absolute md:left-1/2 md:max-w-[42%] md:-translate-x-1/2 md:px-0">
            <p className="truncate text-sm font-semibold text-shell-foreground sm:font-serif sm:text-xl md:text-2xl md:tracking-tight">
              {context.name}
            </p>
            {(context.subtitle || context.role) && (
              <p className="truncate text-[10px] text-shell-muted sm:text-xs">
                {context.subtitle}
                {context.subtitle && context.role ? " · " : ""}
                {context.role}
              </p>
            )}
          </div>
        )}

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

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          {activeApp?.slug === "education" && context.showManageInstitutes && (
            <EducationManageInstitutesDropdown compact />
          )}
          {activeApp?.slug === "business" && context.showManageBusinesses && (
            <BusinessManageBusinessesDropdown compact />
          )}
          <NotificationsPopover invites={invites} shell />
          <UserMenu name={user.name} email={user.email} shell />
        </div>
      </div>
    </header>
  );
}
