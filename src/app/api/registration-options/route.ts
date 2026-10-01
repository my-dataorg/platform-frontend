import { NextResponse } from "next/server";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function GET() {
  try {
    const response = await fetch(`${API}/v1/auth/registration-options`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Platform API unavailable" },
      { status: 503 },
    );
  }
}
