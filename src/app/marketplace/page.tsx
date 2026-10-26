import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShellNav } from "@/components/shell-nav";
import { MarketplaceClient } from "@/components/marketplace-client";
import { PageHeader } from "@/components/shell/page-header";
import { fetchAdminProducts, type AdminProduct } from "@/lib/admin-products";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { q } = await searchParams;
  let adminProducts: AdminProduct[] | undefined;
  try {
    const adminResult = await fetchAdminProducts();
    if (adminResult.authorized) adminProducts = adminResult.products;
  } catch {
    // Keep the public catalog available if the admin endpoint is unavailable.
  }

  return (
    <>
      <ShellNav />
      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
        <div className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 py-6 sm:px-6 sm:py-10">
          <PageHeader
            title="Marketplace"
            subtitle="Discover and subscribe to products for your organization."
          />
          <MarketplaceClient initialQuery={q || ""} initialAdminProducts={adminProducts} />
        </div>
      </main>
    </>
  );
}
