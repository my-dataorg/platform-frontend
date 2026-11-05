import { auth } from "@/auth";
import { businessDirectUserApiUrl, businessApiUnreachableDetail } from "@/lib/business-api-url";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = businessDirectUserApiUrl("/v1/users/me/join-request-inbox");
  try {
    const res = await fetchWithTimeout(url, {
      timeoutMs: 15_000,
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ detail: businessApiUnreachableDetail() }, { status: 502 });
  }
}
