import { fetchProductsAuthenticated } from "@/lib/api-server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-workspace";
import { fetchPendingInvitations } from "@/lib/invitations";
import { greetingForHour } from "@/lib/user-display";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string; path?: string }>;
}) {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const query = await searchParams;
  const [{ items, loadError, unauthorized }, invites] = await Promise.all([
    fetchProductsAuthenticated({ limit: "48" }),
    fetchPendingInvitations(session),
  ]);

  if (unauthorized) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  if (query.app) {
    const product = items.find((p) => p.slug === query.app);
    const canEmbed = product?.subscribed && product.enabled;
    if (!canEmbed && (loadError || items.length === 0)) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard?app=${query.app}`)}`);
    }
  }
  const firstName = session.user?.name?.split(" ")[0] || "there";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <DashboardShell
      products={items}
      productsLoadError={loadError}
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
