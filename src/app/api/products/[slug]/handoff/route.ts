import { auth } from "@/auth";
import { normalizeProduct, type ProductList } from "@/lib/api";
import { safeProductPath } from "@/lib/product-embed";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL || process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;
  const body = (await request.json().catch(() => ({}))) as { path?: string };
  const path = safeProductPath(body.path);
  const headers = { Authorization: `Bearer ${session.accessToken}` };

  const productsResponse = await fetch(`${API}/v1/products?limit=48`, {
    headers,
    cache: "no-store",
  });
  if (!productsResponse.ok) {
    return NextResponse.json({ detail: "Product is unavailable" }, { status: 404 });
  }

  const catalog = (await productsResponse.json()) as ProductList;
  const product = catalog.items
    .map((item) => normalizeProduct(item as ProductList["items"][number] & Record<string, unknown>))
    .find((item) => item.slug === slug && item.enabled && item.subscribed);
  if (!product) {
    return NextResponse.json({ detail: "Product is unavailable" }, { status: 404 });
  }

  let targetOrigin: string;
  try {
    targetOrigin = new URL(product.launchUrl).origin;
  } catch {
    return NextResponse.json({ detail: "Product launch URL is invalid" }, { status: 502 });
  }

  const handoffResponse = await fetch(`${API}/v1/products/handoff`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ productSlug: slug, targetOrigin, returnPath: path }),
    cache: "no-store",
  });
  const handoff = await handoffResponse.json().catch(() => ({ detail: "Handoff failed" }));
  return NextResponse.json(handoff, { status: handoffResponse.status });
}
