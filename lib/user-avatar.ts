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
