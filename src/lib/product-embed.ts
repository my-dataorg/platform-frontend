export function safeProductPath(path: string | null | undefined): string {
  const value = path || "/";
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.split("/").includes("..") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return "/";
  }
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      decoded.split(/[/?#]/)[0] === ".." ||
      decoded.split("/").includes("..")
    ) {
      return "/";
    }
    const url = new URL(value, "https://platform.invalid");
    if (url.origin !== "https://platform.invalid") return "/";
  } catch {
    return "/";
  }
  return value;
}

/** Build a product URL containing only a short-lived handoff code. */
export function buildEmbedUrl(
  launchUrl: string,
  path = "/",
  handoffCode?: string | null,
  embedEnabled = true
): string {
  const base = launchUrl.replace(/\/$/, "");
  const normalized = safeProductPath(path);
  const url = new URL(`${base}${normalized}`);
  if (!embedEnabled) return url.toString();

  if (handoffCode) {
    const bridge = new URL(`${base}/auth/bridge`);
    bridge.searchParams.set("code", handoffCode);
    bridge.searchParams.set("next", normalized);
    bridge.searchParams.set("embed", "1");
    return bridge.toString();
  }

  url.searchParams.set("embed", "1");
  return url.toString();
}

export function dashboardAppUrl(slug: string, path = "/"): string {
  const params = new URLSearchParams({ app: slug });
  const safePath = safeProductPath(path);
  if (safePath !== "/") params.set("path", safePath);
  return `/dashboard?${params.toString()}`;
}
