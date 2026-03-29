/**
 * Blog SEO helpers — canonical safety, absolute URLs, word-count hints for structured data.
 */

const DEFAULT_SITE = 'https://roomrentalusa.com';

export function getSiteOrigin(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE;
  try {
    return new URL(base).origin;
  } catch {
    return new URL(DEFAULT_SITE).origin;
  }
}

export function toAbsoluteUrl(href: string, siteUrl: string = getSiteOrigin()): string {
  const trimmed = (href || '').trim();
  if (!trimmed) return siteUrl;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${siteUrl.replace(/\/$/, '')}${path}`;
}

/**
 * Only allow same-origin canonicals so third-party URLs cannot hijack signals.
 */
export function sanitizeBlogCanonical(
  candidate: string | null | undefined,
  fallbackUrl: string,
  siteUrl: string = getSiteOrigin(),
): string {
  if (!candidate?.trim()) return fallbackUrl;
  try {
    const u = new URL(candidate.trim());
    const origin = new URL(siteUrl).origin;
    if (u.origin !== origin) return fallbackUrl;
    return u.toString();
  } catch {
    return fallbackUrl;
  }
}

export function buildBlogIndexCanonical(
  siteUrl: string,
  sp: { page?: string; category?: string; tag?: string; featured?: string },
): string {
  const base = siteUrl.replace(/\/$/, '');
  const u = new URL(`${base}/blog`);
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  if (page > 1) u.searchParams.set('page', String(page));
  if (sp.category?.trim()) u.searchParams.set('category', sp.category.trim());
  if (sp.tag?.trim()) u.searchParams.set('tag', sp.tag.trim());
  if (sp.featured === '1' || sp.featured === 'true' || sp.featured === 'yes') {
    u.searchParams.set('featured', '1');
  }
  return u.toString();
}

export function estimateWordCount(readingTimeMinutes: number | undefined): number | undefined {
  if (readingTimeMinutes == null || readingTimeMinutes < 1) return undefined;
  return Math.max(200, Math.round(readingTimeMinutes * 200));
}

export function stripHtmlToPlainText(html: string, maxLen = 5000): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}
