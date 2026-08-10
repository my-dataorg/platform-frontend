/** Build product iframe URL with embed mode and optional in-app path. */
export function buildEmbedUrl(
  launchUrl: string,
  path = "/",
  accessToken?: string | null
): string {
  const base = launchUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;

  // Hand platform JWT through /auth/bridge so product FE can mint its own session
  // (localhost cookies are host-scoped and often missing inside the dashboard iframe).
  if (accessToken) {
    const bridge = new URL(`${base}/auth/bridge`);
    bridge.searchParams.set("pt", accessToken);
    bridge.searchParams.set("next", normalized);
    bridge.searchParams.set("embed", "1");
    return bridge.toString();
  }

  const url = new URL(`${base}${normalized}`);
  url.searchParams.set("embed", "1");
  return url.toString();
}

export function dashboardAppUrl(slug: string, path?: string): string {
  const params = new URLSearchParams({ app: slug });
  if (path && path !== "/") params.set("path", path);
  return `/dashboard?${params.toString()}`;
}
