import { auth } from "@/auth";
import { businessApiUnreachableDetail, businessBusinessUrl } from "@/lib/business-api-url";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const res = await fetchWithTimeout(businessBusinessUrl(id), {
      timeoutMs: 15_000,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: businessApiUnreachableDetail() }, { status: 502 });
  }
}
