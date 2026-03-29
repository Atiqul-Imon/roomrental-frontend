const PLACEHOLDER_STRINGS = new Set(['null', 'undefined', 'none', 'n/a']);

/**
 * Returns a usable absolute URL for a profile image, or null when there is no real image.
 * Handles whitespace-only values, literal "null" strings, and relative `/...` paths (API base).
 */
export function normalizeProfileImageUrl(
  raw: string | null | undefined,
  apiBaseUrl?: string | null,
): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_STRINGS.has(lower)) return null;

  if (trimmed.startsWith('data:image')) return trimmed;

  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  if (trimmed.startsWith('/')) {
    const base = (apiBaseUrl || '').replace(/\/$/, '');
    if (!base) return null;
    return `${base}${trimmed}`;
  }

  return trimmed;
}

/** First meaningful letter for display (skips spaces; supports Unicode letters). */
export function getAvatarInitial(name: string | undefined | null): string {
  if (!name?.trim()) return '?';
  const trimmed = name.trim();
  for (const ch of trimmed) {
    if (/\p{L}/u.test(ch)) return ch.toUpperCase();
  }
  const first = trimmed.charAt(0);
  return first ? first.toUpperCase() : '?';
}

const WARM_FALLBACK_GRADIENTS = [
  'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500',
  'bg-gradient-to-br from-rose-400 via-orange-400 to-amber-500',
  'bg-gradient-to-br from-orange-400 to-rose-500',
  'bg-gradient-to-br from-amber-500 to-coral-600',
  'bg-gradient-to-br from-coral-400 via-amber-500 to-orange-500',
  'bg-gradient-to-br from-orange-500 to-rose-600',
  'bg-gradient-to-br from-amber-400 to-orange-600',
  'bg-gradient-to-br from-rose-500 to-orange-400',
] as const;

export function warmAvatarGradientClass(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return WARM_FALLBACK_GRADIENTS[h % WARM_FALLBACK_GRADIENTS.length];
}
