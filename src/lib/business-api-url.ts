/** Server-side URL for business-backend (BFF + server actions). */
export function businessApiBaseUrl(): string {
  const fromEnv = process.env.BUSINESS_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "http://business-backend:8040";
  }
  return "http://127.0.0.1:8040";
}

export function businessApiUnreachableDetail(): string {
  const url = businessApiBaseUrl();
  return `Cannot reach Business API at ${url}. Ensure business-backend is running on the Docker network (service name business-backend:8040).`;
}
