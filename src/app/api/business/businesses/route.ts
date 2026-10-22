import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.BUSINESS_API_URL || "http://localhost:8040";

function apiUnreachable() {
  return NextResponse.json(
    { detail: "Business API is unreachable. Set BUSINESS_API_URL on platform-frontend." },
    { status: 502 }
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await fetch(`${API}/v1/businesses`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return apiUnreachable();
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const res = await fetch(`${API}/v1/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return apiUnreachable();
  }
}
