"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/api";
import { buildEmbedUrl, safeProductPath } from "@/lib/product-embed";

const SHELL_HEADER_PX = 64;

export function ProductEmbedPane({
  product,
  path = "/",
}: {
  product: Product;
  path?: string;
}) {
  const safePath = safeProductPath(path);
  const handoffKey = `${product.slug}:${safePath}`;
  const [handoff, setHandoff] = useState<{ key: string; code?: string; failed?: boolean }>({
    key: "",
  });
  const handoffCode = handoff.key === handoffKey ? handoff.code : undefined;
  const handoffFailed = handoff.key === handoffKey && handoff.failed === true;
  const src = useMemo(
    () => buildEmbedUrl(product.launchUrl, safePath, handoffCode, product.embedEnabled),
    [product.launchUrl, safePath, handoffCode, product.embedEnabled]
  );
  const [height, setHeight] = useState(600);

  useLayoutEffect(() => {
    function resize() {
      setHeight(Math.max(400, window.innerHeight - SHELL_HEADER_PX));
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!product.embedEnabled) return;
    let cancelled = false;
    fetch(`/api/products/${encodeURIComponent(product.slug)}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: safePath }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("handoff failed");
        return response.json() as Promise<{ code?: string }>;
      })
      .then((handoff) => {
        if (cancelled) return;
        if (!handoff.code) throw new Error("handoff missing code");
        setHandoff({ key: handoffKey, code: handoff.code });
      })
      .catch(() => {
        if (!cancelled) setHandoff({ key: handoffKey, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [handoffKey, product.embedEnabled, product.slug, safePath]);

  const openUrl = new URL(
    `${product.launchUrl.replace(/\/$/, "")}${safePath}`
  ).toString();

  if (!product.embedEnabled) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {product.name} opens in a separate window.
        </p>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open {product.name}
        </a>
      </div>
    );
  }

  return (
    <div className="relative bg-background" style={{ height: `${height}px` }}>
      <div className="absolute right-3 top-2 z-10">
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-border bg-card/90 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open in new tab
        </a>
      </div>
      {handoffFailed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {handoffFailed
              ? `Could not securely open ${product.name}.`
              : `${product.name} is not reachable.`}
          </p>
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Open in new tab
          </a>
        </div>
      )}
      {handoffCode && !handoffFailed ? (
        <iframe
          title={product.name}
          src={src}
          style={{ display: "block", width: "100%", height: "100%", border: 0 }}
          className="bg-background"
          allow="clipboard-write"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Opening securely…
        </div>
      )}
    </div>
  );
}
