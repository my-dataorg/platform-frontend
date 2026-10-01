import { NextResponse } from "next/server";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ countryCode: string }> },
) {
  const { countryCode } = await params;
  try {
    const response = await fetch(
      `${API}/v1/auth/registration-options/${encodeURIComponent(countryCode)}/states`,
      { cache: "no-store" },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Platform API unavailable" },
      { status: 503 },
    );
  }
}
