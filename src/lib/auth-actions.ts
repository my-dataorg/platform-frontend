"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { platformApiBaseUrl } from "@/lib/platform-api-url";

const API = platformApiBaseUrl();
const EDUCATION_URL = process.env.EDUCATION_APP_URL || "http://localhost:3010";

export type LoginState = { error?: string };

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!username || !password) {
    return { error: "Enter username and password." };
  }

  let loginRes: Response;
  try {
    loginRes = await fetch(`${API}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return {
      error:
        "Cannot reach the platform API. Check that platform-backend is running and SUBSCRIPTIONS_API_URL is set correctly.",
    };
  }

  if (!loginRes.ok) {
    if (loginRes.status === 401) {
      return {
        error:
          "Invalid username or password. Use the account you created on Sign up, or demo@mydata.local / demo1234 (admin / admin also works on fresh installs).",
      };
    }
    const body = await loginRes.json().catch(() => ({}));
    return { error: formatApiDetail(body.detail) || "Login failed. Try again." };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error:
          "Platform accepted your password but the session could not be created. Check AUTH_SECRET and AUTH_URL on platform-frontend.",
      };
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
    res = await fetch(`${API}/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      error:
        "Cannot reach the platform API (port 8002). Start platform-backend and try again.",
    };
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
