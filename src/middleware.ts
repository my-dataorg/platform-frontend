import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/signup", "/logout"]);

function loginRedirect(requestUrl: string, pathname: string, search: string) {
  const login = new URL("/login", requestUrl);
  if (pathname !== "/") {
    login.searchParams.set("callbackUrl", `${pathname}${search}`);
  }
  return NextResponse.redirect(login);
}

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }
  if (!request.auth) {
    return loginRedirect(request.url, pathname, search);
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
