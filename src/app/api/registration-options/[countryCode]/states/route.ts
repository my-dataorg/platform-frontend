import { platformApiBaseUrl } from "@/lib/platform-api-url";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ countryCode: string }> },
) {
  const { countryCode } = await params;
  try {
    const response = await fetch(
      `${platformApiBaseUrl()}/v1/auth/registration-options/${encodeURIComponent(countryCode)}/states`,
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
