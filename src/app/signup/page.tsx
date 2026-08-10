import { auth } from "@/auth";
import { SignupForm } from "@/components/signup-form";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-shell p-10 text-shell-foreground lg:flex">
        <p className="font-serif text-2xl font-semibold">MyData</p>
        <div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Create your
            <br />
            MyData account
          </h1>
          <p className="mt-4 max-w-md text-sm text-shell-muted">
            Tell us a bit about yourself. You can subscribe to apps after you sign up.
          </p>
        </div>
        <p className="text-xs text-shell-muted">Profile is stored in platform auth — not in products</p>
      </div>
      <div className="flex w-full items-center justify-center bg-background px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-md sm:p-10">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Basic details help us personalize your experience.
          </p>
          <SignupForm />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
