import { auth } from "@/auth";
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
  const res = await fetch(`${API}/v1/products?${qs}`, { headers });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
