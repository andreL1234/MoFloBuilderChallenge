// Users can type "example.com" without a scheme, so normalize before using as a URL base.
export function withProtocol(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(withProtocol(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Scraped hrefs are untrusted: only allow http(s) so a "javascript:" link can never be rendered.
export function safeExternalUrl(href: string | undefined): string | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

// Turns relative asset paths ("/img/logo.png") into absolute URLs on the scraped site.
// Inline SVG data URIs are kept (often logos); other data URIs are usually lazy-load placeholders.
export function resolveAssetUrl(src: string | null | undefined, baseUrl: string): string | null {
  if (!src) return null;
  const value = src.trim();
  if (value.startsWith("data:")) return value.startsWith("data:image/svg") ? value : null;
  try {
    return safeExternalUrl(new URL(value, withProtocol(baseUrl)).href);
  } catch {
    return null;
  }
}
