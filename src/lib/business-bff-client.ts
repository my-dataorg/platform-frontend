import type { BusinessType } from "@/lib/business-types";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const BASE = "/api/business/businesses";

function detailFrom(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.detail === "string") return o.detail;
    if (typeof o.error === "string") return o.error;
  }
  return fallback;
}

export async function createBusinessViaBff(name: string, businessType: BusinessType) {
  try {
    const res = await fetchWithTimeout(BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), businessType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false as const, error: detailFrom(data, `Could not create business (${res.status}).`) };
    }
    const business = data as { id?: string };
    if (!business?.id) {
      return { ok: false as const, error: "Business API returned an invalid response." };
    }
    return { ok: true as const, business: data as { id: string; name: string; businessType: BusinessType } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create business.";
    return { ok: false as const, error: msg };
  }
}

export async function listOwnedBusinessesViaBff() {
  try {
    const res = await fetch(BASE, { credentials: "include", cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false as const,
        error: detailFrom(data, "Could not load businesses."),
        businesses: [] as { id: string; name: string }[],
      };
    }
    const list = (Array.isArray(data) ? data : []) as { id: string; name: string; role: string }[];
    return {
      ok: true as const,
      error: null,
      businesses: list.filter((b) => b.role === "business_owner"),
    };
  } catch {
    return { ok: false as const, error: "Could not load businesses.", businesses: [] };
  }
}

export async function deleteBusinessViaBff(id: string) {
  try {
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok || res.status === 204) {
      return { ok: true as const };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, error: detailFrom(data, `Could not delete business (${res.status}).`) };
  } catch {
    return { ok: false as const, error: "Could not delete business." };
  }
}
