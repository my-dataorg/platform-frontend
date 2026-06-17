"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_LABELS } from "@/lib/roles";

type Invitation = {
  id: string;
  instituteId: string;
  instituteName: string;
  role: string;
};

export function InvitationsList({ invites: initial }: { invites: Invitation[] }) {
  const router = useRouter();
  const [invites, setInvites] = useState(initial);
  const [message, setMessage] = useState("");

  async function accept(id: string, name: string) {
    const res = await fetch(`/api/invitations/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== id));
      setMessage(`You joined ${name}. Subscribe to Education in the marketplace to launch it.`);
      router.refresh();
    }
  }

  async function reject(id: string) {
    await fetch(`/api/invitations/${id}/reject`, {
      method: "POST",
      credentials: "include",
    });
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          {message}{" "}
          <Link href="/marketplace" className="text-primary hover:underline">
            Go to marketplace
          </Link>
        </p>
      )}
      {invites.map((inv) => (
        <div
          key={inv.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div>
            <p className="font-medium">{inv.instituteName}</p>
            <p className="text-sm text-muted-foreground">
              Role: {ROLE_LABELS[inv.role] || inv.role}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => accept(inv.id, inv.instituteName)}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => reject(inv.id)}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
