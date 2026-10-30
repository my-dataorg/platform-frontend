import { auth } from "@/auth";
import { normalizeProduct, type ProductList } from "@/lib/api";
import { platformApiBaseUrl } from "@/lib/platform-api-url";

export async function fetchProductsAuthenticated(
  params: Record<string, string | undefined>
): Promise<ProductList & { loadError?: string; unauthorized?: boolean }> {
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
    const api = platformApiBaseUrl();
    const res = await fetch(`${api}/v1/products?${search}`, {
      headers,
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return {
        items: [],
        nextCursor: null,
        totalApprox: 0,
        loadError: "Session expired",
        unauthorized: true,
      };
    }
    if (!res.ok) {
      console.error(`products API ${res.status} from ${api}`);
      return { items: [], nextCursor: null, totalApprox: 0, loadError: `API returned ${res.status}` };
    }
    const data = (await res.json()) as ProductList;
    return {
      ...data,
      items: data.items.map((item) => normalizeProduct(item as ProductList["items"][number] & Record<string, unknown>)),
    };
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
    `${platformApiBaseUrl()}/v1/users/me/subscriptions?productSlug=${productSlug}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );
  if (!res.ok) throw new Error("Subscribe failed");
  return res.json();
}
