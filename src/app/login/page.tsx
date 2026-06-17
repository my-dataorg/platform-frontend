import { auth } from "@/auth";
import { federatedSignOut, signInFresh } from "@/lib/auth-actions";
import { keycloakRegistrationUrl } from "@/lib/keycloak-urls";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();
  const appUrl = process.env.AUTH_URL || "http://localhost:3000";
  const registerUrl = keycloakRegistrationUrl(appUrl);

  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Already signed in</h1>
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">MyData Platform</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in or create an account to access your apps and marketplace.
        </p>
        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signInFresh("/dashboard");
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Sign in
          </button>
        </form>
        <Link
          href={registerUrl}
          className="mt-3 block w-full rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-muted"
        >
          Create account
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">
          Demo account: demo@mydata.local / demo1234
        </p>
      </div>
    </div>
  );
}
