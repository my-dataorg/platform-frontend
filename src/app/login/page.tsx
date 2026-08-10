import { auth } from "@/auth";
import { federatedSignOut } from "@/lib/auth-actions";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-md">
          <p className="font-serif text-sm font-semibold text-primary">MyData</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold">Already signed in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.user.name || session.user.email}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 block w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Continue to dashboard
          </Link>
          <form
            className="mt-3"
            action={async () => {
              "use server";
              await federatedSignOut();
            }}
          >
            <button
              type="submit"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              Sign in as a different user
            </button>
          </form>
        </div>
      </div>
    );
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
          <LoginForm />
          <p className="mt-6 text-xs text-muted-foreground">Demo: admin / admin</p>
        </div>
      </div>
    </div>
  );
}
