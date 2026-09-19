"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/api";
import { dashboardAppUrl } from "@/lib/product-embed";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/product-form";
import { type AdminProduct, toAdminProduct } from "@/lib/admin-products";

const CATEGORIES = [
  { slug: "", name: "All" },
  { slug: "learning", name: "Learning" },
  { slug: "community", name: "Community" },
  { slug: "lifestyle", name: "Lifestyle" },
  { slug: "business", name: "Business" },
  { slug: "productivity", name: "Productivity" },
];

async function fetchProductsClient(params: URLSearchParams) {
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export function MarketplaceClient({
  initialQuery = "",
  initialAdminProducts,
}: {
  initialQuery?: string;
  initialAdminProducts?: AdminProduct[];
}) {
  const router = useRouter();
  const adminMode = initialAdminProducts !== undefined;
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>(initialAdminProducts ?? []);
  const [total, setTotal] = useState(initialAdminProducts?.length ?? 0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (!reset && cursor) params.set("cursor", cursor);

      try {
        const data = await fetchProductsClient(params);
        setProducts((prev) => (reset ? data.items : [...prev, ...data.items]));
        setCursor(data.nextCursor);
        setTotal(data.totalApprox);
      } catch {
        setError("Could not load products. Is the subscriptions API running?");
      } finally {
        setLoading(false);
      }
    },
    [q, category, cursor]
  );

  useEffect(() => {
    if (adminMode) return;
    // Loading a new query intentionally updates the result state from this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, adminMode]);

  async function refreshAdminProducts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load admin products");
      const data = (await response.json()) as { items?: Record<string, unknown>[] };
      setProducts((data.items ?? []).map(toAdminProduct));
    } catch {
      setError("Could not refresh products.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(slug: string) {
    setSubscribing(slug);
    setError(null);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug: slug }),
    });
    setSubscribing(null);

    if (!res.ok) {
      const msg =
        res.status === 401
          ? "Session expired. Please sign out and log in again."
          : "Subscribe failed. Please try again.";
      setError(msg);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, subscribed: true } : p))
    );
    router.refresh();
  }

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-6 border-b border-border bg-background/95 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Input
            type="search"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {adminMode && (
            <Button onClick={() => setCreatingProduct(true)} className="shrink-0">
              New product
            </Button>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn("shrink-0 transition", category !== c.slug && "opacity-80 hover:opacity-100")}
            >
              <Badge
                variant={category === c.slug ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  category === c.slug && "bg-primary text-primary-foreground"
                )}
              >
                {c.name}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {total} products {loading && products.length > 0 && "· loading..."}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && products.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                admin={adminMode}
                onAction={adminMode ? undefined : () => handleSubscribe(p.slug)}
                onEdit={
                  adminMode
                    ? () => setEditingProduct(p as AdminProduct)
                    : undefined
                }
                onLaunch={
                  p.subscribed
                    ? () => router.push(dashboardAppUrl(p.slug, p.defaultPath))
                    : undefined
                }
                actionLabel={subscribing === p.slug ? "Subscribing..." : undefined}
                disabled={subscribing === p.slug}
              />
            ))}
      </div>

      {cursor && (
        <Button variant="outline" className="mt-6" onClick={() => load(false)} disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </Button>
      )}

      <Dialog
        open={creatingProduct || editingProduct !== null}
        title={creatingProduct ? "New product" : "Edit product"}
        description="Configure catalog visibility, launch paths, and embed behavior."
        onClose={() => {
          setCreatingProduct(false);
          setEditingProduct(null);
        }}
      >
        <ProductForm
          product={
            editingProduct ?? {
              slug: "new",
              name: "",
              shortDescription: "",
              iconUrl: "",
              category: "",
              tags: [],
              featured: false,
              subscribed: false,
              launchUrl: "",
              defaultPath: "/",
              enabled: true,
              embedEnabled: true,
              status: "enabled",
            }
          }
          onCancel={() => {
            setCreatingProduct(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            setCreatingProduct(false);
            setEditingProduct(null);
            void refreshAdminProducts();
          }}
        />
      </Dialog>
    </div>
  );
}
