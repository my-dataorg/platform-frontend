import { auth } from "@/auth";
import type { ProductList } from "@/lib/api";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function fetchProductsAuthenticated(
  params: Record<string, string | undefined>
): Promise<ProductList & { loadError?: string }> {
  const session = await auth();
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) search.set(k, v);
  }

  const headers: HeadersInit = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  try {
    const res = await fetch(`${API}/v1/products?${search}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`products API ${res.status} from ${API}`);
      return { items: [], nextCursor: null, totalApprox: 0, loadError: `API returned ${res.status}` };
    }
    return res.json();
  } catch (err) {
    console.error("products API unreachable:", err);
    return {
      items: [],
      nextCursor: null,
      totalApprox: 0,
      loadError: "Subscriptions API unreachable — is platform-backend running on port 8002?",
    };
  }
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
