import {
  businessApiUnreachableDetail,
  businessBusinessesUpstreamUrls,
  businessBusinessUpstreamUrls,
} from "@/lib/business-api-url";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

function detailFrom(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.detail === "string") return o.detail;
    if (typeof o.error === "string") return o.error;
  }
  return fallback;
}

async function tryUrls(
  urls: string[],
  init: RequestInit & { timeoutMs?: number }
): Promise<Response | null> {
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, init);
      if (res.status === 502 || res.status === 503) {
        const data = await res.json().catch(() => ({}));
        errors.push(detailFrom(data, `${res.status} from ${url}`));
        continue;
      }
      return res;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join(" · "));
  }
  return null;
}

export async function fetchBusinessCollection(
  token: string,
  init: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const res = await tryUrls(businessBusinessesUpstreamUrls(), {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (res) return res;
  throw new Error(businessApiUnreachableDetail());
}

export async function fetchBusinessOne(
  token: string,
  id: string,
  init: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const res = await tryUrls(businessBusinessUpstreamUrls(id), {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (res) return res;
  throw new Error(businessApiUnreachableDetail());
}
