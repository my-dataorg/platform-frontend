import { auth } from "@/auth";
import { fetchBusinessJoinInboxWithToken } from "@/lib/business-join-inbox";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await fetchBusinessJoinInboxWithToken(session.accessToken);
  return NextResponse.json(items);
}
