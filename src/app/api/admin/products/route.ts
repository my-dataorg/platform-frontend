import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL || process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

async function proxy(request: NextRequest, method: "GET" | "POST" | "PATCH") {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const target = new URL(`${API}/v1/admin/products`);
  target.search = url.search;
  const headers: HeadersInit = { Authorization: `Bearer ${session.accessToken}` };
  if (method !== "GET") headers["Content-Type"] = "application/json";

  const response = await fetch(target, {
    method,
    headers,
    body: method !== "GET" ? await request.text() : undefined,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({ detail: "Unexpected API response" }));
  return NextResponse.json(data, { status: response.status });
}

export function GET(request: NextRequest) {
  return proxy(request, "GET");
}

export function POST(request: NextRequest) {
  return proxy(request, "POST");
}

export function PATCH(request: NextRequest) {
  return proxy(request, "PATCH");
}
