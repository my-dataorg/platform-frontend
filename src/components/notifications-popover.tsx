"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const count = invites.length;

  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-xl"
          aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Institute invitations and updates</p>
        </div>

        {toast && (
          <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
            {toast}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {invites.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No new notifications</p>
          ) : (
            <ul className="divide-y divide-border">
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
