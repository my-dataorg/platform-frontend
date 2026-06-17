import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.SUBSCRIPTIONS_API_URL || "http://localhost:8002";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productSlug } = await req.json();
  const res = await fetch(
    `${API}/v1/users/me/subscriptions?productSlug=${productSlug}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
