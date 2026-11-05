import { auth } from "@/auth";
import { platformApiBaseUrl } from "@/lib/platform-api-url";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productSlug } = await req.json();
  const res = await fetch(
    `${platformApiBaseUrl()}/v1/users/me/subscriptions?productSlug=${productSlug}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
