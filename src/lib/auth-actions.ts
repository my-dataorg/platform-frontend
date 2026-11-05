"use server";

import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { platformApiBaseUrl } from "@/lib/platform-api-url";
import { safeNextPath } from "@/lib/safe-next-path";

const EDUCATION_URL = process.env.EDUCATION_APP_URL || "http://localhost:3010";

function platformReachabilityError(): string {
  const api = platformApiBaseUrl();
  const inDocker = process.env.RUNNING_IN_DOCKER === "1";
  if (inDocker) {
    return (
      `Cannot reach the platform API at ${api}. ` +
      "Ensure platform-backend is running on the same Docker network " +
      "(on the server: docker compose ps && docker compose logs platform-backend --tail 40)."
    );
  }
  return `Cannot reach the platform API at ${api}. Start platform-backend locally (port 8002) or set SUBSCRIPTIONS_API_URL.`;
}

export type LoginState = { error?: string };

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) {
    return { error: "Enter username and password." };
  }

  const api = platformApiBaseUrl();
  let loginRes: Response;
  try {
    loginRes = await fetch(`${api}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { error: platformReachabilityError() };
  }

  if (!loginRes.ok) {
    const body = await loginRes.json().catch(() => ({}));
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : "Invalid username or password.";
    if (loginRes.status === 401) {
      const isLocal =
        process.env.NODE_ENV === "development" ||
        api.includes("127.0.0.1") ||
        api.includes("localhost") ||
        api.includes("0.0.0.0");
      return {
        error: isLocal
          ? "Invalid username or password. Local demo: username admin, password admin (lowercase, no spaces)."
          : `${detail} On a new server, use Sign up — demo admin/admin only exists if it was seeded on first install.`,
      };
    }
    return { error: detail || `Login failed (${loginRes.status}).` };
  }

  const nextPath = safeNextPath(formData.get("callbackUrl"));
  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: nextPath,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Sign-in session could not be started. Check AUTH_SECRET and AUTH_URL on the server." };
    }
    throw err;
  }
  return {};
}

export type SignupState = { error?: string };

function formatApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return (
      detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(" ") ||
      "Could not create account."
    );
  }
  return "Could not create account.";
}

export async function signupWithProfile(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const payload = {
    username: String(formData.get("username") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    gender: String(formData.get("gender") || ""),
    dateOfBirth: String(formData.get("dateOfBirth") || ""),
    contactNumber: String(formData.get("contactNumber") || "").trim(),
    whatsappAvailable: formData.get("whatsappAvailable") === "on",
    addressLine1: String(formData.get("addressLine1") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    country: String(formData.get("country") || "").trim() || null,
    state: String(formData.get("state") || "").trim() || null,
    preferredLanguage: String(formData.get("preferredLanguage") || "en").trim() || "en",
  };

  let res: Response;
  try {
    res = await fetch(`${platformApiBaseUrl()}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { error: platformReachabilityError() };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: formatApiDetail(body.detail) };
  }

  try {
    await signIn("credentials", {
      username: payload.username,
      password: payload.password,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw err;
  }
  return {};
}

export type ProfileState = { error?: string; saved?: boolean };

export type ProfileInput = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  whatsappAvailable: boolean;
  addressLine1: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  preferredLanguage: string;
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?callbackUrl=/profile");

  const newPassword = String(formData.get("newPassword") || "");
  const payload: Record<string, unknown> = {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    gender: String(formData.get("gender") || ""),
    dateOfBirth: String(formData.get("dateOfBirth") || ""),
    contactNumber: String(formData.get("contactNumber") || "").trim(),
    whatsappAvailable: formData.get("whatsappAvailable") === "on",
    addressLine1: String(formData.get("addressLine1") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    country: String(formData.get("country") || "").trim() || null,
    state: String(formData.get("state") || "").trim() || null,
    preferredLanguage: String(formData.get("preferredLanguage") || "en").trim() || "en",
  };
  if (newPassword) {
    payload.newPassword = newPassword;
    payload.currentPassword = String(formData.get("currentPassword") || "");
  }

  let res: Response;
  try {
    res = await fetch(`${platformApiBaseUrl()}/v1/users/me/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { error: platformReachabilityError() };
  }

  if (res.status === 401 || res.status === 403) {
    redirect("/login?callbackUrl=/profile");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: formatApiDetail(body.detail) };
  }
  return { saved: true };
}

export async function prepareLogout() {
  await signOut({ redirect: false });
  return {
    keycloakLogoutUrl: "/login",
    educationSignOutUrl: `${EDUCATION_URL}/api/auth/signout?callbackUrl=${encodeURIComponent(`${EDUCATION_URL}/login`)}`,
  };
}

export async function federatedSignOut() {
  redirect("/logout");
}

/** @deprecated Use loginWithPassword form instead. */
export async function signInFresh(_redirectTo: string) {
  redirect("/login");
}
