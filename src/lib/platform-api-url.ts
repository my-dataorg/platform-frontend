/** Server-side platform-backend base URL (auth, BFF). */
export function platformApiBaseUrl(): string {
  const fromEnv =
    process.env.SUBSCRIPTIONS_API_URL?.trim() || process.env.PLATFORM_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace("://localhost", "://127.0.0.1");
  }
  if (process.env.RUNNING_IN_DOCKER === "1") {
    return "http://platform-backend:8002";
  }
  return "http://127.0.0.1:8002";
}
