"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PendingInvitation } from "@/lib/invitations";
import { dashboardAppUrl } from "@/lib/product-embed";
import { ROLE_LABELS } from "@/lib/roles";

type Props = {
  invites: PendingInvitation[];
};

export function NotificationsPopover({ invites: initialInvites }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState(initialInvites);
  const [toast, setToast] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = invites.length;

  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-md">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Institute invitations and updates
            </p>
          </div>

          {toast && (
            <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
              {toast}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {invites.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No new notifications
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {invites.map((invite) => (
                  <li key={invite.id} className="px-4 py-3">
                    <p className="text-sm font-medium">{invite.instituteName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Invited as {ROLE_LABELS[invite.role] || invite.role}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => accept(invite.id, invite.instituteName, invite.instituteId)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(invite.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-muted"
                      >
                        Decline
                      </button>
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
        </div>
      )}
    </div>
  );
}
