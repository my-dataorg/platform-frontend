import type { Product } from "@/lib/api";
import { auth } from "@/auth";

export type AdminProduct = Product & {
  status: "enabled" | "disabled";
};

export type AdminProductsResult =
  | { authorized: true; products: AdminProduct[] }
  | { authorized: false; products: [] };

export type ProductUpdate = {
  name: string;
  shortDescription: string;
  iconUrl: string;
  category: string;
  tags: string[];
  featured: boolean;
  launchUrl: string;
  defaultPath: string;
  status: AdminProduct["status"];
  embedEnabled: boolean;
};

export function toAdminProduct(value: Record<string, unknown>): AdminProduct {
  const status = value.status === "disabled" || value.enabled === false ? "disabled" : "enabled";
  return {
    slug: String(value.slug ?? ""),
    name: String(value.name ?? ""),
    shortDescription: String(value.short_description ?? value.shortDescription ?? ""),
    iconUrl: String(value.icon_url ?? value.iconUrl ?? ""),
    category: String(value.category ?? ""),
    tags: Array.isArray(value.tags) ? value.tags.map(String) : [],
    featured: Boolean(value.featured),
    subscribed: Boolean(value.subscribed),
    launchUrl: String(value.launch_url ?? value.launchUrl ?? ""),
    defaultPath: String(value.default_path ?? value.defaultPath ?? "/"),
    enabled: status === "enabled",
    embedEnabled: value.embed_enabled !== false && value.embedEnabled !== false,
    status,
  };
}

export function toProductUpdate(form: FormData): ProductUpdate {
  return {
    name: String(form.get("name") ?? "").trim(),
    shortDescription: String(form.get("shortDescription") ?? "").trim(),
    iconUrl: String(form.get("iconUrl") ?? "").trim(),
    category: String(form.get("category") ?? "").trim(),
    tags: String(form.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    featured: form.get("featured") === "on",
    launchUrl: String(form.get("launchUrl") ?? "").trim(),
    defaultPath: String(form.get("defaultPath") ?? "/").trim() || "/",
    status: form.get("status") === "disabled" ? "disabled" : "enabled",
    embedEnabled: form.get("embedEnabled") === "on",
  };
}

export async function fetchAdminProducts(): Promise<AdminProductsResult> {
  const session = await auth();
  if (!session?.accessToken) return { authorized: false, products: [] };

  const api = process.env.PLATFORM_API_URL || process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";
  const response = await fetch(`${api}/v1/admin/products`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return { authorized: false, products: [] };
    }
    throw new Error("Could not load products");
  }

  const data = (await response.json()) as { items?: Record<string, unknown>[] };
  return { authorized: true, products: (data.items ?? []).map(toAdminProduct) };
}
