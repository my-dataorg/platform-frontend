export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  iconUrl: string;
  category: string;
  tags: string[];
  featured: boolean;
  subscribed: boolean;
  launchUrl: string;
};

export type ProductList = {
  items: Product[];
  nextCursor: string | null;
  totalApprox: number;
};

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function fetchProducts(params: {
  q?: string;
  category?: string;
  cursor?: string;
  userId?: string;
  limit?: number;
}): Promise<ProductList> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.userId) search.set("user_id", params.userId);
  if (params.limit) search.set("limit", String(params.limit));

  const res = await fetch(`${API}/v1/products?${search}`);
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export async function fetchSubscriptions(userId = "demo-user") {
  const res = await fetch(`${API}/v1/users/me/subscriptions?user_id=${userId}`);
  if (!res.ok) return { items: [] };
  return res.json();
}

export async function subscribe(productSlug: string, userId = "demo-user") {
  await fetch(
    `${API}/v1/users/me/subscriptions?user_id=${userId}&productSlug=${productSlug}`,
    { method: "POST" }
  );
}
