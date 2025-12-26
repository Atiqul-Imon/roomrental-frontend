/**
 * Utility functions for highlighting search terms in text
 */

import React from 'react';

export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery || !text) return text;

  const terms = searchQuery
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape special regex characters

  if (terms.length === 0) return text;

  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  return text.replace(pattern, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
}

export function highlightSearchTermsReact(
  text: string,
  searchQuery: string
): Array<string | React.ReactElement> {
  if (!searchQuery || !text) return [text];

  const terms = searchQuery
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (terms.length === 0) return [text];

  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts: Array<string | React.ReactElement> = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add highlighted match
    parts.push(
      React.createElement(
        'mark',
        {
          key: `highlight-${keyCounter++}`,
          className: 'bg-yellow-200 text-yellow-900 px-0.5 rounded',
        },
        match[0]
      )
    );
    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

