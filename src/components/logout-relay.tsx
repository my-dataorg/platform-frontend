"use client";

import { useEffect } from "react";

type Props = {
  keycloakLogoutUrl: string;
  educationSignOutUrl: string;
};

export function LogoutRelay({ keycloakLogoutUrl, educationSignOutUrl }: Props) {
  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = educationSignOutUrl;
    document.body.appendChild(iframe);

    const timer = window.setTimeout(() => {
      window.location.href = keycloakLogoutUrl;
    }, 400);

    return () => {
      window.clearTimeout(timer);
      iframe.remove();
    };
  }, [keycloakLogoutUrl, educationSignOutUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Signing out...</p>
    </div>
  );
}
