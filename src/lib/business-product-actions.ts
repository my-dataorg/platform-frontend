"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { BusinessIndustryProfileInput } from "@/lib/business-industry-profile";
import type { BusinessType } from "@/lib/business-types";

const API = process.env.BUSINESS_API_URL || "http://localhost:8040";

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

export async function createBusinessProductAction(
  name: string,
  businessType: BusinessType,
  contact: {
    contactName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  },
  industry?: BusinessIndustryProfileInput
) {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error! };

  const res = await fetch(`${API}/v1/businesses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authz.token}`,
    },
    body: JSON.stringify({
      name: name.trim(),
      businessType,
      contactName: contact.contactName.trim(),
      phone: contact.phone.trim(),
      address: contact.address.trim(),
      city: contact.city.trim(),
      state: contact.state.trim(),
      postalCode: contact.postalCode.trim(),
      ...(businessType === "small_scale_industry" && industry
        ? {
            district: industry.district.trim(),
            manufacturingLine: industry.manufacturingLine.trim(),
            udyamRegistration: industry.udyamRegistration.trim(),
            gstin: industry.gstin.trim(),
            pan: industry.pan.trim(),
          }
        : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false as const, error: detailFrom(data, `Could not create business (${res.status}).`) };
  }
  revalidatePath("/dashboard");
  return {
    ok: true as const,
    business: data as { id: string; name: string; businessType: BusinessType },
  };
}

export async function deleteBusinessProductAction(id: string) {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error! };

  const res = await fetch(`${API}/v1/businesses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${authz.token}` },
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    return { ok: false as const, error: detailFrom(data, `Could not delete business (${res.status}).`) };
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function listOwnedBusinessesProductAction() {
  const authz = await bearer();
  if (!authz.token) return { ok: false as const, error: authz.error!, businesses: [] };

  const res = await fetch(`${API}/v1/businesses`, {
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
}
