'use client';

import DOMPurify from 'isomorphic-dompurify';

const PURIFY = {
  ADD_ATTR: ['target', 'rel', 'loading', 'decoding'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function BlogPostBody({ html }: { html: string }) {
  const safe = DOMPurify.sanitize(html, PURIFY);
  return (
    <div
      className="blog-content mx-auto"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
