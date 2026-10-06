"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { LayoutGrid, Store } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductEmbedPane } from "@/components/product-embed-pane";
import { ShellHeader } from "@/components/shell-header";
import { MetricCard } from "@/components/shell/metric-card";
import { ModuleCard } from "@/components/shell/module-card";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardAppUrl } from "@/lib/product-embed";
import { productIcon } from "@/lib/product-icons";
import type { Product } from "@/lib/api";
import type { PendingInvitation } from "@/lib/invitations";

type Props = {
  products: Product[];
  productsLoadError?: string;
  greeting: string;
  firstName: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
  invites: PendingInvitation[];
};

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-shell" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Skeleton className="h-10 w-72" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}

function DashboardShellInner({
  products,
  productsLoadError,
  greeting,
  firstName,
  user,
  invites,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appSlug = searchParams.get("app");
  const embedPath = searchParams.get("path") || "/";
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  const subscribed = products.filter((p) => p.subscribed);
  const recentProducts = recentSlugs
    .map((slug) => subscribed.find((product) => product.slug === slug && product.enabled))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 3);
  const activeProduct =
    appSlug ? subscribed.find((p) => p.slug === appSlug && p.enabled) : null;

  useEffect(() => {
    const stored = window.localStorage.getItem("mydata:recent-apps");
    const timer = window.setTimeout(() => {
      if (!stored) return;
      try {
        setRecentSlugs(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem("mydata:recent-apps");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const launchProduct = useCallback(
    (product: Product) => {
      setRecentSlugs((current) => {
        const next = [product.slug, ...current.filter((slug) => slug !== product.slug)].slice(0, 10);
        window.localStorage.setItem("mydata:recent-apps", JSON.stringify(next));
        return next;
      });
      router.push(dashboardAppUrl(product.slug, product.defaultPath));
    },
    [router]
  );

  return (
    <div className={activeProduct ? "h-screen overflow-hidden" : "min-h-screen bg-background"}>
      <ShellHeader
        user={user}
        invites={invites}
        activeApp={
          activeProduct ? { slug: activeProduct.slug, name: activeProduct.name } : undefined
        }
      />
      {activeProduct ? (
        <ProductEmbedPane
          product={activeProduct}
          path={embedPath}
        />
      ) : appSlug ? (
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No active subscription for <strong>{appSlug}</strong>, or the catalog failed to load.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6">
          <PageHeader
            title={`${greeting}, ${firstName}`}
            subtitle="Overview of your subscribed apps and quick access to the marketplace."
            actions={
              <Button asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            }
          />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              {productsLoadError && (
                <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {productsLoadError}
                </p>
              )}

              {recentProducts.length > 0 && (
                <>
                  <h2 className="mb-4 font-serif text-xl font-semibold">Quick access</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {recentProducts.map((p) => {
                      const Icon = productIcon(p.slug);
                      return (
                        <ModuleCard
                          key={p.slug}
                          icon={<Icon className="h-6 w-6" />}
                          title={p.name}
                          description={p.shortDescription}
                          onClick={() => launchProduct(p)}
                        />
                      );
                    })}
                  </div>
                </>
              )}

              <h2 className="mb-4 mt-10 font-serif text-xl font-semibold">My apps</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {subscribed.map((p) => (
                  <ProductCard key={p.slug} product={p} onLaunch={() => launchProduct(p)} />
                ))}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <MetricCard
                icon={<LayoutGrid className="h-5 w-5" />}
                label="Subscribed apps"
                value={subscribed.length}
                hint="Active entitlements"
              />
              <MetricCard
                icon={<Store className="h-5 w-5" />}
                label="Catalog"
                value={products.length}
                hint="Products available"
              />
              <MetricCard
                icon={<LayoutGrid className="h-5 w-5" />}
                label="Invitations"
                value={invites.length}
                hint="Pending responses"
              />
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}

export function DashboardShell(props: Props) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}
