"use server";

import { auth } from "@/auth";
import { businessApiBaseUrl } from "@/lib/business-api-url";
import { revalidatePath } from "next/cache";
import type { BusinessType } from "@/lib/business-types";

async function bearer() {
  const session = await auth();
  if (!session?.accessToken) {
    return { error: "Please sign in again to continue.", token: null };
  }
  return { error: null, token: session.accessToken };
}

function detailFrom(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && typeof (data as { detail?: unknown }).detail === "string") {
    return (data as { detail: string }).detail;
  }
  return fallback;
}

function networkApiError(e: unknown, fallback: string): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(msg)) {
    return "Could not reach the Business API. Set BUSINESS_API_URL on platform-frontend (e.g. http://business-backend:8040).";
  }
  return msg || fallback;
}

export async function createBusinessProductAction(name: string, businessType: BusinessType) {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error! };

  try {
    const res = await fetch(`${businessApiBaseUrl()}/v1/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authz.token}`,
      },
      body: JSON.stringify({ name: name.trim(), businessType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false as const, error: detailFrom(data, `Could not create business (${res.status}).`) };
    }

    const business = data as { id?: string; name?: string; businessType?: BusinessType };
    if (!business?.id) {
      return { ok: false as const, error: "Business API returned an invalid response." };
    }

    try {
      revalidatePath("/dashboard");
    } catch {
      /* create succeeded; cache refresh is best-effort */
    }
    return {
      ok: true as const,
      business: business as { id: string; name: string; businessType: BusinessType },
    };
  } catch (e) {
    return { ok: false as const, error: networkApiError(e, "Could not create business.") };
  }
}

export async function deleteBusinessProductAction(id: string) {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error! };

  try {
    const res = await fetch(`${businessApiBaseUrl()}/v1/businesses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authz.token}` },
    });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      return { ok: false as const, error: detailFrom(data, `Could not delete business (${res.status}).`) };
    }
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: networkApiError(e, "Could not delete business.") };
  }
}

export async function listOwnedBusinessesProductAction() {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error!, businesses: [] };

  try {
    const res = await fetch(`${businessApiBaseUrl()}/v1/businesses`, {
      headers: { Authorization: `Bearer ${authz.token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false as const, error: "Could not load businesses.", businesses: [] };
    }
    const list = (await res.json()) as { id: string; name: string; role: string }[];
    return {
      ok: true as const,
      error: null,
      businesses: list.filter((b) => b.role === "business_owner"),
    };
  } catch (e) {
    return {
      ok: false as const,
      error: networkApiError(e, "Could not load businesses."),
      businesses: [],
    };
  }
}
