const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  return normalizeBaseUrl(configured || DEFAULT_SITE_URL);
}

export function buildTrackingUrl(trackingToken: string) {
  return `${getSiteUrl()}/track/${trackingToken}`;
}
