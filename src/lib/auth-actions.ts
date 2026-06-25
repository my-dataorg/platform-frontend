"use server";

import { signIn, signOut } from "@/auth";
import { keycloakLogoutUrl } from "@/lib/keycloak-urls";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const APP_URL = process.env.AUTH_URL || "http://localhost:3000";
const EDUCATION_URL = process.env.EDUCATION_APP_URL || "http://localhost:3010";

async function getServerJwt() {
  const headersList = await headers();
  return getToken({
    req: new Request(APP_URL, { headers: headersList }),
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
}

/** Always show the Keycloak login form (do not silently reuse SSO session). */
export async function signInFresh(redirectTo: string) {
  await signIn("keycloak", {
    redirectTo,
    authorizationParams: { prompt: "login" },
  });
}

/** Clear platform session and return URLs for federated logout relay. */
export async function prepareLogout() {
  const token = await getServerJwt();
  const idToken = token?.idToken as string | undefined;
  await signOut({ redirect: false });

  return {
    keycloakLogoutUrl: keycloakLogoutUrl(APP_URL, idToken),
    educationSignOutUrl: `${EDUCATION_URL}/api/auth/signout?callbackUrl=${encodeURIComponent(`${EDUCATION_URL}/login`)}`,
  };
}

/** Clear NextAuth session, product sessions, and Keycloak SSO. */
export async function federatedSignOut() {
  redirect("/logout");
}
