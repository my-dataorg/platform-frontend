"use client";

import { useEffect, useState } from "react";
import { prepareLogout } from "@/lib/auth-actions";
import { LogoutRelay } from "@/components/logout-relay";

export default function LogoutPage() {
  const [urls, setUrls] = useState<{
    keycloakLogoutUrl: string;
    educationSignOutUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prepareLogout()
      .then(setUrls)
      .catch(() => setError("Could not sign out. Please try again."));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!urls) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    );
  }

  return (
    <LogoutRelay
      keycloakLogoutUrl={urls.keycloakLogoutUrl}
      educationSignOutUrl={urls.educationSignOutUrl}
    />
  );
}
