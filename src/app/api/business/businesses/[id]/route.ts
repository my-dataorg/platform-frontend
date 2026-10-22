import { auth } from "@/auth";
import { businessApiUnreachableDetail } from "@/lib/business-api-url";
import { fetchBusinessOne } from "@/lib/business-bff-upstream";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const res = await fetchBusinessOne(session.accessToken, id, {
      timeoutMs: 15_000,
      method: "DELETE",
    });
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const detail = e instanceof Error ? e.message : businessApiUnreachableDetail();
    return NextResponse.json({ detail }, { status: 502 });
  }
}
