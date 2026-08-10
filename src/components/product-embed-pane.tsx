"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/api";
import { buildEmbedUrl } from "@/lib/product-embed";

const SHELL_HEADER_PX = 64;

export function ProductEmbedPane({
  product,
  path = "/",
  accessToken,
}: {
  product: Product;
  path?: string;
  accessToken?: string | null;
}) {
  const src = useMemo(
    () => buildEmbedUrl(product.launchUrl, path, accessToken),
    [product.launchUrl, path, accessToken]
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    function resize() {
      setHeight(Math.max(400, window.innerHeight - SHELL_HEADER_PX));
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(product.launchUrl, { mode: "no-cors", cache: "no-store" }).catch(() => {
        if (!cancelled) setFailed(true);
      });
    }, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [product.launchUrl, src]);

  const openUrl =
    product.launchUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);

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
      {failed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {product.name} is not reachable at {product.launchUrl}. Start the Business app, then
            retry.
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
      <iframe
        ref={iframeRef}
        title={product.name}
        src={src}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
        }}
        className="bg-background"
        allow="clipboard-write"
      />
    </div>
  );
}
