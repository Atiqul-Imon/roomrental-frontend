'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * Implements Schema.org markup for better SEO
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];
    const dataArray = Array.isArray(data) ? data : [data];

    dataArray.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [data]);

  return null;
}


