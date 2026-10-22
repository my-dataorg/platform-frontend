import { auth } from "@/auth";
import { businessApiUnreachableDetail } from "@/lib/business-api-url";
import { fetchBusinessCollection } from "@/lib/business-bff-upstream";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await fetchBusinessCollection(session.accessToken, {
      timeoutMs: 15_000,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const detail = e instanceof Error ? e.message : businessApiUnreachableDetail();
    return NextResponse.json({ detail }, { status: 502 });
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
    const res = await fetchBusinessCollection(session.accessToken, {
      timeoutMs: 15_000,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const detail = e instanceof Error ? e.message : businessApiUnreachableDetail();
    return NextResponse.json({ detail }, { status: 502 });
  }
}
