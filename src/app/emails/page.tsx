import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShellNav } from "@/components/shell-nav";
import { InboxClient } from "@/components/inbox-client";
import { Inbox } from "lucide-react";

export default async function EmailsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              Invitations and updates from your MyData products
            </p>
          </div>
        </div>
        <InboxClient />
      </main>
    </>
  );
}
