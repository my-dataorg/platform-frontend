/** Server-side platform-backend base URL (auth, BFF). */
export function platformApiBaseUrl(): string {
  const raw =
    process.env.SUBSCRIPTIONS_API_URL?.trim() ||
    process.env.PLATFORM_API_URL?.trim() ||
    "http://127.0.0.1:8002";
  return raw.replace("://localhost", "://127.0.0.1");
}
