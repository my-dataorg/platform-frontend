import { auth } from "@/auth";
import { normalizeProduct } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function GET(req: NextRequest) {
  const session = await auth();
  const headers: HeadersInit = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  try {
    const res = await fetch(`${API}/v1/products?${qs}`, { headers, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (Array.isArray(data.items)) {
      data.items = data.items.map(normalizeProduct);
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { items: [], nextCursor: null, totalApprox: 0, error: "subscriptions API unreachable" },
      { status: 503 }
    );
  }
}
