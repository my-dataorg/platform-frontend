import { platformApiBaseUrl } from "@/lib/platform-api-url";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(`${platformApiBaseUrl()}/v1/auth/registration-options`, {
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
