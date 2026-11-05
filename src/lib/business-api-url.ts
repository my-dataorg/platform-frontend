/** Platform API base (always set in production compose). */
function platformApiBase(): string {
  const fromEnv =
    process.env.PLATFORM_API_URL?.trim() || process.env.SUBSCRIPTIONS_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "http://platform-backend:8002";
  }
  return "http://127.0.0.1:8002";
}

function directBusinessApiBase(): string {
  const fromEnv = process.env.BUSINESS_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "http://business-backend:8040";
  }
  return "http://127.0.0.1:8040";
}

/** Prefer platform-backend gateway so create works when only PLATFORM_API_URL is set. */
function useBusinessGateway(): boolean {
  if (process.env.BUSINESS_API_DIRECT === "1") return false;
  return Boolean(
    process.env.PLATFORM_API_URL?.trim() ||
      process.env.SUBSCRIPTIONS_API_URL?.trim() ||
      process.env.NODE_ENV === "production"
  );
}

export function businessBusinessesUrl(): string {
  if (useBusinessGateway()) {
    return `${platformApiBase()}/v1/business/businesses`;
  }
  return `${directBusinessApiBase()}/v1/businesses`;
}

/** Gateway first, then direct business-backend (502 fallback in BFF). */
export function businessBusinessesUpstreamUrls(): string[] {
  const primary = businessBusinessesUrl();
  const direct = `${directBusinessApiBase()}/v1/businesses`;
  if (primary === direct) return [primary];
  return [primary, direct];
}

export function businessBusinessUpstreamUrls(id: string): string[] {
  const primary = businessBusinessUrl(id);
  const direct = `${directBusinessApiBase()}/v1/businesses/${id}`;
  if (primary === direct) return [primary];
  return [primary, direct];
}

export function businessBusinessUrl(id: string): string {
  if (useBusinessGateway()) {
    return `${platformApiBase()}/v1/business/businesses/${id}`;
  }
  return `${directBusinessApiBase()}/v1/businesses/${id}`;
}

/** @deprecated use businessBusinessesUrl */
export function businessApiBaseUrl(): string {
  return useBusinessGateway() ? `${platformApiBase()}/v1/business` : directBusinessApiBase();
}

export function businessApiUnreachableDetail(): string {
  return `Cannot reach Business API (${businessBusinessesUrl()}). Start platform-backend and business-backend, then redeploy platform-frontend.`;
}
