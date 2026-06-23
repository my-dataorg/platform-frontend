"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { LayoutGrid, Sparkles, Store } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductEmbedPane } from "@/components/product-embed-pane";
import { ShellHeader } from "@/components/shell-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Skeleton className="h-5 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-8 w-64" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}

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
    <div className={activeProduct ? "h-screen overflow-hidden" : "min-h-screen bg-muted/30"}>
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
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-primary">My apps</p>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {greeting}, {firstName}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Launch the products you&apos;ve subscribed to
              </p>
            </div>
            {subscribed.length > 0 && (
              <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                <LayoutGrid className="h-4 w-4" />
                {subscribed.length} app{subscribed.length === 1 ? "" : "s"} subscribed
              </Badge>
            )}
          </div>

          {subscribed.length === 0 ? (
            <Card className="border-dashed bg-card/80">
              <CardContent className="flex flex-col items-center px-8 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Store className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-lg font-semibold">No apps yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Browse the marketplace to discover and subscribe to MyData products.
                </p>
                <Button className="mt-6 gap-2" asChild>
                  <Link href="/marketplace">
                    <Store className="h-4 w-4" />
                    Browse Marketplace
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
    <Suspense fallback={<DashboardLoading />}>
      <DashboardShellInner {...props} />
    </Suspense>
  );
}
