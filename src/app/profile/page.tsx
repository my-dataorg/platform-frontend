import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader } from "@/components/shell/page-header";
import { ShellNav } from "@/components/shell-nav";
import type { ProfileInput } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

const API = (
  process.env.SUBSCRIPTIONS_API_URL || "http://127.0.0.1:8002"
).replace("://localhost", "://127.0.0.1");

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?callbackUrl=/profile");

  const res = await fetch(`${API}/v1/users/me/profile`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    redirect("/login?callbackUrl=/profile");
  }
  if (!res.ok) {
    return (
      <>
        <ShellNav />
        <main className="mx-auto max-w-2xl flex-1 px-6 py-10">
          <PageHeader title="Edit profile" subtitle="Your platform account details." />
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Profile could not be loaded. Try again in a moment.
          </p>
        </main>
      </>
    );
  }

  const profile = (await res.json()) as ProfileInput;

  return (
    <>
      <ShellNav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-10">
        <PageHeader
          title="Edit profile"
          subtitle="Update the details on your MyData account. Username stays the same."
        />
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <ProfileForm profile={profile} />
        </div>
      </main>
    </>
  );
}
