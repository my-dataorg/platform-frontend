import { fetchProductsAuthenticated } from "@/lib/api-server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShellNav } from "@/components/shell-nav";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { items } = await fetchProductsAuthenticated({ limit: "48" });
  const subscribed = items.filter((p) => p.subscribed);

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-6xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Good morning, {session.user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your subscribed applications
          </p>
        </div>

        {subscribed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-16 text-center">
            <p className="text-muted-foreground">No apps yet.</p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscribed.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
