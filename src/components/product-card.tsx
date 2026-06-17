import Link from "next/link";
import { productIcon } from "@/lib/product-icons";
import type { Product } from "@/lib/api";

type Props = {
  product: Product;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
};

export function ProductCard({ product, onAction, actionLabel, disabled }: Props) {
  const Icon = productIcon(product.slug);
  const label = actionLabel ?? (product.subscribed ? "Launch" : "Subscribe");

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {product.subscribed && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Subscribed
          </span>
        )}
        {product.featured && !product.subscribed && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Featured
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold">{product.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {product.shortDescription}
      </p>

      {product.subscribed ? (
        <Link
          href={product.launchUrl}
          className="mt-5 block w-full cursor-pointer rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="mt-5 w-full cursor-pointer rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {label}
        </button>
      )}
    </article>
  );
}
