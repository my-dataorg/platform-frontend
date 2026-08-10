import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productIcon } from "@/lib/product-icons";
import type { Product } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  onAction?: () => void;
  onLaunch?: () => void;
  actionLabel?: string;
  disabled?: boolean;
};

export function ProductCard({ product, onAction, onLaunch, actionLabel, disabled }: Props) {
  const Icon = productIcon(product.slug);
  const label = actionLabel ?? (product.subscribed ? "Launch" : "Subscribe");

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shell text-shell-foreground transition">
          <Icon className="h-5 w-5" />
        </div>
        {product.subscribed && <Badge>Subscribed</Badge>}
        {product.featured && !product.subscribed && <Badge variant="secondary">Featured</Badge>}
      </div>
      <h3 className="font-serif text-lg font-semibold tracking-tight">{product.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.shortDescription}</p>
      <div className="mt-5">
        {product.subscribed ? (
          onLaunch ? (
            <Button className="w-full" onClick={onLaunch}>
              {label}
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href={product.launchUrl}>{label}</Link>
            </Button>
          )
        ) : (
          <Button className="w-full" onClick={onAction} disabled={disabled}>
            {label}
          </Button>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
      </div>
      <div className={cn("mt-5 h-10 w-full animate-pulse rounded-lg bg-muted")} />
    </div>
  );
}
