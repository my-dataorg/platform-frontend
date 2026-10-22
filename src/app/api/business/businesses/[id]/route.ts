import { auth } from "@/auth";
import { NextResponse } from "next/server";

const API = process.env.BUSINESS_API_URL || "http://localhost:8040";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const res = await fetch(`${API}/v1/businesses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Business API is unreachable. Set BUSINESS_API_URL on platform-frontend." },
      { status: 502 }
    );
  }
}
