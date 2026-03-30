import type { JSONContent } from '@tiptap/core';
import { emptyDoc } from '@/lib/blog/default-doc';

/**
 * Normalizes API / Prisma JSON for TipTap (object, or JSON string, or bad payload).
 */
export function parseAdminContentJson(raw: unknown): JSONContent {
  let v: unknown = raw;
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return emptyDoc();
    try {
      v = JSON.parse(t) as unknown;
    } catch {
      return emptyDoc();
    }
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return emptyDoc();
  const doc = v as JSONContent;
  if (doc.type !== 'doc') return emptyDoc();
  return doc;
}
