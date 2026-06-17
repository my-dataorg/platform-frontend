/** Build product iframe URL with embed mode and optional in-app path. */
export function buildEmbedUrl(launchUrl: string, path = "/"): string {
  const base = launchUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  url.searchParams.set("embed", "1");
  return url.toString();
}

export function dashboardAppUrl(slug: string, path?: string): string {
  const params = new URLSearchParams({ app: slug });
  if (path && path !== "/") params.set("path", path);
  return `/dashboard?${params.toString()}`;
}
