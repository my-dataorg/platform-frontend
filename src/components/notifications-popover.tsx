"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BusinessJoinInboxItem } from "@/lib/business-join-inbox";
import type { PendingInvitation } from "@/lib/invitations";
import { dashboardAppUrl } from "@/lib/product-embed";
import { ROLE_LABELS } from "@/lib/roles";

type PlatformNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
};

function mergeJoinInbox(
  a: BusinessJoinInboxItem[],
  b: BusinessJoinInboxItem[]
): BusinessJoinInboxItem[] {
  const map = new Map<string, BusinessJoinInboxItem>();
  for (const item of [...a, ...b]) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

type Props = {
  invites: PendingInvitation[];
  initialBusinessJoinInbox?: BusinessJoinInboxItem[];
  shell?: boolean;
  activeAppSlug?: string;
};

function joinRequesterLabel(item: BusinessJoinInboxItem): string {
  const name = item.displayName?.trim();
  if (name) return name;
  const email = item.userEmail?.trim();
  if (email) return email;
  return "Member";
}

export function NotificationsPopover({
  invites: initialInvites,
  initialBusinessJoinInbox = [],
  shell,
  activeAppSlug,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState(initialInvites);
  const [platformItems, setPlatformItems] = useState<PlatformNotification[]>([]);
  const [platformUnread, setPlatformUnread] = useState(0);
  const [joinInbox, setJoinInbox] = useState<BusinessJoinInboxItem[]>(initialBusinessJoinInbox);
  const [iframeJoinInbox, setIframeJoinInbox] = useState<BusinessJoinInboxItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const loadPlatform = useCallback(async () => {
    const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      items?: PlatformNotification[];
      unreadCount?: number;
    };
    setPlatformItems(data.items ?? []);
    setPlatformUnread(data.unreadCount ?? 0);
  }, []);

  const loadJoinInbox = useCallback(async () => {
    const res = await fetch("/api/business/join-request-inbox", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      setJoinInbox([]);
      return;
    }
    const data = (await res.json()) as BusinessJoinInboxItem[];
    setJoinInbox(Array.isArray(data) ? data : []);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPlatform(), loadJoinInbox()]);
  }, [loadPlatform, loadJoinInbox]);

  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  useEffect(() => {
    if (initialBusinessJoinInbox.length > 0) {
      setJoinInbox((prev) => mergeJoinInbox(initialBusinessJoinInbox, prev));
    }
  }, [initialBusinessJoinInbox]);

  useEffect(() => {
    void refreshAll();
    const ms = activeAppSlug === "business" ? 10_000 : 30_000;
    const timer = window.setInterval(() => void refreshAll(), ms);
    return () => window.clearInterval(timer);
  }, [refreshAll, activeAppSlug]);

  useEffect(() => {
    if (open) void refreshAll();
  }, [open, refreshAll]);

  useEffect(() => {
    if (activeAppSlug !== "business") {
      setIframeJoinInbox([]);
      return;
    }
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "business-join-inbox") return;
      if (event.data.ok === false) return;
      const items = event.data.items;
      setIframeJoinInbox(Array.isArray(items) ? items : []);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeAppSlug]);

  const effectiveJoinInbox = mergeJoinInbox(joinInbox, iframeJoinInbox);

  const joinInboxForList = useMemo(() => {
    const platformJoinTitles = new Set(
      platformItems
        .filter((n) => n.type.startsWith("business.join_request"))
        .map((n) => n.title.trim().toLowerCase())
    );
    return effectiveJoinInbox.filter((item) => {
      const title = `join request — ${(item.businessName || "business").trim()}`.toLowerCase();
      return !platformJoinTitles.has(title);
    });
  }, [effectiveJoinInbox, platformItems]);

  const count = invites.length + platformUnread + joinInboxForList.length;

  async function accept(id: string, instituteName: string, instituteId: string) {
    const res = await fetch(`/api/invitations/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      setInvites((prev) => prev.filter((invite) => invite.id !== id));
      setToast(`You joined ${instituteName}.`);
      router.refresh();
      router.push(dashboardAppUrl("education", `/institutes/${instituteId}`));
    }
  }

  async function reject(id: string) {
    await fetch(`/api/invitations/${id}/reject`, {
      method: "POST",
      credentials: "include",
    });
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
    router.refresh();
  }

  function followLink(link: string) {
    let path = link;
    if (link.startsWith("http")) {
      try {
        const url = new URL(link);
        path = `${url.pathname}${url.search}`;
      } catch {
        window.location.href = link;
        return;
      }
    }
    if (path.includes("/businesses/")) {
      window.location.href = dashboardAppUrl("business", path);
      return;
    }
    if (path.includes("/institutes/")) {
      window.location.href = dashboardAppUrl("education", path);
      return;
    }
    window.location.href = path;
  }

  async function openPlatformNotification(item: PlatformNotification) {
    await fetch(`/api/notifications/${item.id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    setPlatformItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    setPlatformUnread((c) => Math.max(0, c - 1));
    setOpen(false);
    if (item.link) followLink(item.link);
  }

  function openJoinRequest(item: BusinessJoinInboxItem) {
    setOpen(false);
    const path =
      item.associationPath ||
      `/businesses/${item.businessId}/association?memberTab=requests`;
    window.location.href = dashboardAppUrl("business", path);
  }

  const hasAny =
    platformItems.length > 0 || joinInboxForList.length > 0 || invites.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            shell
              ? "relative h-8 w-8 rounded-md border border-white/15 bg-white/10 text-shell-foreground hover:bg-white/15 hover:text-shell-foreground sm:h-10 sm:w-10 sm:rounded-xl [&_svg]:!size-3.5 sm:[&_svg]:!size-4"
              : "relative rounded-xl border border-white/15 bg-white/10 text-shell-foreground hover:bg-white/15 hover:text-shell-foreground"
          }
          aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white ring-2 ring-amber-200">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Invitations, join requests, and updates</p>
        </div>

        {toast && (
          <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
            {toast}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {!hasAny ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No new notifications</p>
          ) : (
            <ul className="divide-y divide-border">
              {platformItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openPlatformNotification(item)}
                    className={`w-full px-4 py-3 text-left hover:bg-muted/50 ${!item.read ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.body && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
                        )}
                      </div>
                      {!item.read && <Badge variant="secondary">New</Badge>}
                    </div>
                  </button>
                </li>
              ))}
              {joinInboxForList.map((item) => (
                <li key={`join-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => openJoinRequest(item)}
                    className="w-full bg-primary/5 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          Join request — {item.businessName || "Business"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {joinRequesterLabel(item)} wants to join as{" "}
                          {ROLE_LABELS[item.requestedRole] || item.requestedRole}
                        </p>
                      </div>
                      <Badge variant="secondary">New</Badge>
                    </div>
                  </button>
                </li>
              ))}
              {invites.map((invite) => (
                <li key={invite.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{invite.instituteName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Invited as {ROLE_LABELS[invite.role] || invite.role}
                      </p>
                    </div>
                    <Badge variant="secondary">New</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => accept(invite.id, invite.instituteName, invite.instituteId)}
                    >
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(invite.id)}>
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-4 py-2.5">
          <Link
            href="/invitations"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all invitations
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
