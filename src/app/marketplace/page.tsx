import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShellNav } from "@/components/shell-nav";
import { MarketplaceClient } from "@/components/marketplace-client";
import { PageHeader } from "@/components/shell/page-header";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { q } = await searchParams;

  return (
    <>
      <ShellNav />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6">
          <PageHeader
            title="Marketplace"
            subtitle="Discover and subscribe to products for your organization."
          />
          <MarketplaceClient initialQuery={q || ""} />
        </div>
      </main>
    </>
  );
}
