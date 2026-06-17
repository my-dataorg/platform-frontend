import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShellNav } from "@/components/shell-nav";
import { MarketplaceClient } from "@/components/marketplace-client";

export default async function MarketplacePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover and subscribe to products
          </p>
        </div>
        <MarketplaceClient />
      </main>
    </>
  );
}
