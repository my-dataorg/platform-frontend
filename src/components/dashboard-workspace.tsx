"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { LayoutGrid, Store } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductEmbedPane } from "@/components/product-embed-pane";
import { ShellHeader } from "@/components/shell-header";
import { dashboardAppUrl } from "@/lib/product-embed";
import type { Product } from "@/lib/api";
import type { PendingInvitation } from "@/lib/invitations";

type Props = {
  products: Product[];
  greeting: string;
  firstName: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
  invites: PendingInvitation[];
};

function DashboardShellInner({ products, greeting, firstName, user, invites }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appSlug = searchParams.get("app");
  const embedPath = searchParams.get("path") || "/";

  const subscribed = products.filter((p) => p.subscribed);
  const activeProduct = appSlug ? subscribed.find((p) => p.slug === appSlug) : null;

  const launchProduct = useCallback(
    (product: Product) => {
      const defaultPath = product.slug === "education" ? "/institutes" : "/";
      router.push(dashboardAppUrl(product.slug, defaultPath));
    },
    [router]
  );

  return (
    <div className={activeProduct ? "h-screen overflow-hidden" : undefined}>
      <ShellHeader
        user={user}
        invites={invites}
        activeApp={
          activeProduct ? { slug: activeProduct.slug, name: activeProduct.name } : undefined
        }
      />
      {activeProduct ? (
        <ProductEmbedPane product={activeProduct} path={embedPath} />
      ) : (
        <main className="mx-auto max-w-6xl flex-1 px-6 py-10">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">My apps</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {greeting}, {firstName}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Launch the products you&apos;ve subscribed to
              </p>
            </div>
            {subscribed.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <LayoutGrid className="h-4 w-4" />
                {subscribed.length} app{subscribed.length === 1 ? "" : "s"} subscribed
              </div>
            )}
          </div>

          {subscribed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-8 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">No apps yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Browse the marketplace to discover and subscribe to MyData products.
              </p>
              <Link
                href="/marketplace"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Store className="h-4 w-4" />
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {subscribed.map((p) => (
                <ProductCard key={p.slug} product={p} onLaunch={() => launchProduct(p)} />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export function DashboardShell(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl flex-1 px-6 py-10 text-sm text-muted-foreground">
          Loading dashboard...
        </main>
      }
    >
      <DashboardShellInner {...props} />
    </Suspense>
  );
}
