"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Product } from "@/lib/api";
import { buildEmbedUrl } from "@/lib/product-embed";

const SHELL_HEADER_PX = 64;

export function ProductEmbedPane({
  product,
  path = "/",
}: {
  product: Product;
  path?: string;
}) {
  const src = buildEmbedUrl(product.launchUrl, path);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useLayoutEffect(() => {
    function resize() {
      setHeight(Math.max(400, window.innerHeight - SHELL_HEADER_PX));
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title={product.name}
      src={src}
      style={{
        display: "block",
        width: "100%",
        height: `${height}px`,
        border: 0,
      }}
      className="bg-background"
      allow="clipboard-write"
    />
  );
}
