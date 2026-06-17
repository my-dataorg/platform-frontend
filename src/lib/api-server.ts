import { auth } from "@/auth";
import type { ProductList } from "@/lib/api";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function fetchProductsAuthenticated(
  params: Record<string, string | undefined>
): Promise<ProductList> {
  const session = await auth();
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) search.set(k, v);
  }

  const headers: HeadersInit = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API}/v1/products?${search}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function subscribeAuthenticated(productSlug: string) {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Not authenticated");

  const res = await fetch(
    `${API}/v1/users/me/subscriptions?productSlug=${productSlug}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );
  if (!res.ok) throw new Error("Subscribe failed");
  return res.json();
}
