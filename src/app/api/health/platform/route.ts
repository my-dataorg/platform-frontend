import { platformApiBaseUrl } from "@/lib/platform-api-url";
import { NextResponse } from "next/server";

/** Check platform-frontend → platform-backend connectivity (for ops). */
export async function GET() {
  const api = platformApiBaseUrl();
  try {
    const res = await fetch(`${api}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json(
      { api, ok: res.ok, status: res.status, body },
      { status: res.ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json({ api, ok: false, error: "unreachable" }, { status: 503 });
  }
}
