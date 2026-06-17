import { fetchProductsAuthenticated } from "@/lib/api-server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-workspace";
import { fetchPendingInvitations } from "@/lib/invitations";
import { greetingForHour } from "@/lib/user-display";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [{ items }, invites] = await Promise.all([
    fetchProductsAuthenticated({ limit: "48" }),
    fetchPendingInvitations(session),
  ]);
  const firstName = session.user?.name?.split(" ")[0] || "there";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <DashboardShell
      products={items}
      greeting={greeting}
      firstName={firstName}
      user={{
        name: session.user?.name,
        email: session.user?.email,
      }}
      invites={invites}
    />
  );
}
