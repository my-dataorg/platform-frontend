import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
    <Card className="group flex flex-col transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
            <Icon className="h-5 w-5" />
          </div>
          {product.subscribed && <Badge>Subscribed</Badge>}
          {product.featured && !product.subscribed && <Badge variant="secondary">Featured</Badge>}
        </div>
        <h3 className="text-base font-semibold tracking-tight">{product.name}</h3>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
      </CardContent>
      <CardFooter className="pt-0">
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
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className={cn("h-10 w-full animate-pulse rounded-lg bg-muted")} />
      </CardFooter>
    </Card>
  );
}
