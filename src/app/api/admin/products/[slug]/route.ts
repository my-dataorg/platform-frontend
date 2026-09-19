import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.PLATFORM_API_URL || process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;
  const response = await fetch(`${API}/v1/admin/products/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({ detail: "Unexpected API response" }));
  return NextResponse.json(data, { status: response.status });
}
