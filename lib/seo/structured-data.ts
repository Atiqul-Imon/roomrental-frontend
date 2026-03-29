/**
 * Structured Data (JSON-LD) utilities for SEO
 * Implements Schema.org markup for 2025/2026 SEO best practices
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string;
  };
  sameAs?: string[];
}

export interface LocalBusinessSchema {
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  priceRange?: string;
  image?: string;
}

export interface ProductSchema {
  name: string;
  description: string;
  image: string[];
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    validFrom?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface PlaceSchema {
  name: string;
  description: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  image?: string[];
}

export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && {
      logo: {
        '@type': 'ImageObject',
        url: data.logo,
      },
    }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...data.contactPoint,
      },
    }),
    ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
  };
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema(data: LocalBusinessSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        ...data.address,
      },
    }),
    ...(data.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.image && { image: data.image }),
  };
}

/**
 * Generate Product structured data (for rental listings)
 */
export function generateProductSchema(data: ProductSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    offers: {
      '@type': 'Offer',
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
      availability: `https://schema.org/${data.offers.availability}`,
      url: data.offers.url,
      ...(data.offers.validFrom && { validFrom: data.offers.validFrom }),
    },
    ...(data.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
      },
    }),
  };
}

/**
 * Generate Place structured data
 */
export function generatePlaceSchema(data: PlaceSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: data.name,
    description: data.description,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
    ...(data.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
    ...(data.image && { image: data.image }),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(data: BreadcrumbSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQSchema(data: FAQSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema(siteUrl: string, searchUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RoomRentalUSA',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BlogPostingSchemaInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  imageUrls?: string[];
  authorName?: string;
  /** Public profile URL for the author (same origin recommended) */
  authorUrl?: string;
  keywords?: string[];
  publisherName?: string;
  publisherLogoUrl?: string;
  /** Blog category name → articleSection */
  articleSection?: string;
  /** BCP 47 */
  inLanguage?: string;
  wordCount?: number;
}

const DEFAULT_OG_DIM = { width: 1200, height: 630 } as const;

function imageObjects(urls: string[]): object[] {
  return urls.filter(Boolean).map((url) => ({
    '@type': 'ImageObject',
    url,
    width: DEFAULT_OG_DIM.width,
    height: DEFAULT_OG_DIM.height,
  }));
}

/**
 * BlogPosting JSON-LD — aligned with Google Article/Blog guidelines (dates ISO 8601, publisher logo, images).
 */
export function generateBlogPostingSchema(input: BlogPostingSchemaInput): object {
  const images = input.imageUrls?.filter(Boolean) ?? [];
  const imageField = images.length > 0 ? imageObjects(images) : undefined;

  const author =
    input.authorName != null && input.authorName !== ''
      ? {
          '@type': 'Person',
          name: input.authorName,
          ...(input.authorUrl && { url: input.authorUrl }),
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${input.url}#webpage`,
    },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.inLanguage ?? 'en-US',
    isAccessibleForFree: true,
    ...(author && { author }),
    publisher: {
      '@type': 'Organization',
      name: input.publisherName ?? 'RoomRentalUSA',
      url: (() => {
        try {
          return new URL(input.url).origin;
        } catch {
          return undefined;
        }
      })(),
      ...(input.publisherLogoUrl && {
        logo: {
          '@type': 'ImageObject',
          url: input.publisherLogoUrl,
          width: 512,
          height: 512,
        },
      }),
    },
    ...(imageField && imageField.length > 0 && { image: imageField }),
    ...(input.keywords?.length && { keywords: input.keywords.join(', ') }),
    ...(input.articleSection && { articleSection: input.articleSection }),
    ...(input.wordCount != null && input.wordCount > 0 && { wordCount: input.wordCount }),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.blog-content'],
    },
  };
}

/** Single JSON-LD script: BlogPosting + BreadcrumbList (recommended @graph pattern). */
export function generateBlogArticleJsonLdGraph(blogPosting: object, breadcrumbList: object): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [blogPosting, breadcrumbList],
  };
}

export interface BlogIndexItemListInput {
  pageUrl: string;
  siteUrl: string;
  name: string;
  description: string;
  items: Array<{ url: string; name: string }>;
}

/**
 * Collection / listing page: WebPage + ItemList for post URLs (crawlable discovery).
 */
export function generateBlogIndexJsonLd(input: BlogIndexItemListInput): object {
  const websiteId = `${input.siteUrl.replace(/\/$/, '')}/#website`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: input.siteUrl.replace(/\/$/, ''),
        name: 'RoomRentalUSA',
      },
      {
        '@type': 'CollectionPage',
        '@id': `${input.pageUrl}#collection`,
        url: input.pageUrl,
        name: input.name,
        description: input.description,
        isPartOf: { '@id': websiteId },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: input.items.length,
          itemListElement: input.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        },
      },
    ],
  };
}






















