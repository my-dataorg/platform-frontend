"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export function InboxClient() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/notifications", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load inbox");
        setItems(data.items ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading inbox...</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center text-sm text-muted-foreground">
        No notifications yet. Institute invitations and updates will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <p className="text-xs font-medium text-primary">{unreadCount} unread</p>
      )}
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {items.map((item) => (
          <li key={item.id} className={`px-4 py-4 ${!item.read ? "bg-primary/5" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              {!item.read && (
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
            {item.link && (
              <Link
                href={item.link.startsWith("http") ? "/invitations" : item.link}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                View invitation →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
