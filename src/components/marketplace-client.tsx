"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { slug: "", name: "All" },
  { slug: "learning", name: "Learning" },
  { slug: "community", name: "Community" },
  { slug: "business", name: "Business" },
  { slug: "productivity", name: "Productivity" },
];

async function fetchProductsClient(params: URLSearchParams) {
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export function MarketplaceClient() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setCursor(null);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

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
        <Input
          type="search"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
                onAction={() => handleSubscribe(p.slug)}
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
    </div>
  );
}
