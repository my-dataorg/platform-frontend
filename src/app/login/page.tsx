import { auth, signOut, validatePlatformSession } from "@/auth";
import { safeNextPath } from "@/lib/safe-next-path";
import { LoginForm } from "@/components/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const nextPath = safeNextPath(callbackUrl);
  const session = await auth();

  if (session?.accessToken) {
    const valid = await validatePlatformSession(session.accessToken);
    if (valid) {
      redirect(nextPath);
    }
    await signOut({ redirect: false });
  } else if (session?.user) {
    await signOut({ redirect: false });
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-shell p-10 text-shell-foreground lg:flex">
        <p className="font-serif text-2xl font-semibold">MyData</p>
        <div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            One platform.
            <br />
            Many products.
          </h1>
          <p className="mt-4 max-w-md text-sm text-shell-muted">
            Sign in to launch subscribed apps, manage entitlements, and browse the marketplace.
          </p>
        </div>
        <p className="text-xs text-shell-muted">Simple username &amp; password login</p>
      </div>
      <div className="flex w-full items-center justify-center bg-background px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-md">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your username and password to continue.
          </p>
          <LoginForm callbackUrl={nextPath} />
          {process.env.NODE_ENV !== "production" && (
            <p className="mt-6 text-xs text-muted-foreground">Local demo: admin / admin</p>
          )}
        </div>
      </div>
    </div>
  );
}
