"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// Prefer 127.0.0.1 — Node fetch to "localhost" can fail on macOS IPv6.
const API =
  process.env.SUBSCRIPTIONS_API_URL?.replace("://localhost", "://127.0.0.1") ||
  "http://127.0.0.1:8002";
const EDUCATION_URL = process.env.EDUCATION_APP_URL || "http://localhost:3010";

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

  let loginRes: Response;
  try {
    loginRes = await fetch(`${API}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return {
      error:
        "Cannot reach the platform API. On the server, check that platform-backend is running and SUBSCRIPTIONS_API_URL points to it.",
    };
  }

  if (!loginRes.ok) {
    const body = await loginRes.json().catch(() => ({}));
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : "Invalid username or password.";
    if (loginRes.status === 401) {
      return {
        error:
          detail +
          " On a new server, create an account with Sign up — demo admin/admin only exists if it was seeded on first install.",
      };
    }
    return { error: detail || `Login failed (${loginRes.status}).` };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
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
