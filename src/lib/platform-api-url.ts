/** Read env at runtime (bracket access avoids Next build inlining). */
function readEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null || raw === "") return undefined;
  return raw.trim();
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/** Server-side platform-backend base URL (auth, BFF). */
export function platformApiBaseUrl(): string {
  const fromEnv = readEnv("SUBSCRIPTIONS_API_URL") || readEnv("PLATFORM_API_URL");
  const inDocker = readEnv("RUNNING_IN_DOCKER") === "1";

  if (fromEnv) {
    const normalized = fromEnv.replace("://localhost", "://127.0.0.1");
    if (inDocker) {
      try {
        if (isLoopbackHost(new URL(normalized).hostname)) {
          return "http://platform-backend:8002";
        }
      } catch {
        return "http://platform-backend:8002";
      }
    }
    return normalized;
  }

  if (inDocker) {
    return "http://platform-backend:8002";
  }
  return "http://127.0.0.1:8002";
}
