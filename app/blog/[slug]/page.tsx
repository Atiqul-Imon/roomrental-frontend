import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogPostBody } from '@/components/blog/public/BlogPostBody';
import { serverFetchBlogPostBySlug } from '@/lib/blog/blog-api-server';
import {
  estimateWordCount,
  getSiteOrigin,
  sanitizeBlogCanonical,
  stripHtmlToPlainText,
  toAbsoluteUrl,
} from '@/lib/blog/blog-seo';
import {
  generateBreadcrumbSchema,
  generateBlogPostingSchema,
  generateBlogArticleJsonLdGraph,
} from '@/lib/seo/structured-data';
import { format } from 'date-fns';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetchBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    };
  }

  const origin = getSiteOrigin();
  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || `${post.title} — RoomRentalUSA blog.`;
  const defaultCanonical = `${origin}/blog/${encodeURIComponent(post.slug)}`;
  const canonical = sanitizeBlogCanonical(post.canonicalUrl, defaultCanonical, origin);
  const ogImage =
    post.ogImageUrl || post.coverImageUrl || `${origin}/logo/rrlogo-optimized.png`;
  const ogImagesAbs = [toAbsoluteUrl(ogImage, origin)].filter(Boolean);

  return {
    title,
    description: description.slice(0, 160),
    keywords: post.keywords?.length ? post.keywords : undefined,
    authors: post.author?.name
      ? [
          {
            name: post.author.name,
            url: post.author.id ? `${origin}/profile/${post.author.id}` : undefined,
          },
        ]
      : [{ name: 'RoomRentalUSA', url: origin }],
    creator: post.author?.name ?? 'RoomRentalUSA',
    publisher: 'RoomRentalUSA',
    category: post.category?.name,
    robots: {
      index: post.robotsIndex,
      follow: post.robotsFollow,
      googleBot: {
        index: post.robotsIndex,
        follow: post.robotsFollow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      locale: 'en_US',
      siteName: 'RoomRentalUSA',
      title,
      description: description.slice(0, 200),
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : ['RoomRentalUSA'],
      section: post.category?.name,
      tags: post.tags?.map((t) => t.name),
      images: ogImagesAbs.map((u) => ({
        url: u,
        width: 1200,
        height: 630,
        alt: post.title,
        type: u.endsWith('.png') ? 'image/png' : undefined,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@roomrentalusa',
      creator: '@roomrentalusa',
      title,
      description: description.slice(0, 200),
      images: ogImagesAbs,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await serverFetchBlogPostBySlug(slug);
  if (!post) notFound();

  const origin = getSiteOrigin();
  const url = `${origin}/blog/${encodeURIComponent(post.slug)}`;
  const description =
    post.metaDescription || post.excerpt || `${post.title} — RoomRentalUSA blog.`;
  const schemaDescription =
    stripHtmlToPlainText(description).slice(0, 320) || description.slice(0, 320);
  const imageUrls = [post.ogImageUrl, post.coverImageUrl].filter(Boolean) as string[];
  const imageUrlsAbs = imageUrls.map((u) => toAbsoluteUrl(u, origin));

  const blogPosting = generateBlogPostingSchema({
    headline: post.title,
    description: schemaDescription,
    url,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    imageUrls: imageUrlsAbs.length ? imageUrlsAbs : [`${origin}/logo/rrlogo-optimized.png`],
    authorName: post.author?.name || undefined,
    authorUrl: post.author?.id ? `${origin}/profile/${post.author.id}` : undefined,
    keywords: post.keywords,
    publisherName: 'RoomRentalUSA',
    publisherLogoUrl: `${origin}/logo/rrlogo-optimized.png`,
    articleSection: post.category?.name,
    inLanguage: 'en-US',
    wordCount: estimateWordCount(post.readingTimeMinutes),
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: origin },
      { name: 'Blog', url: `${origin}/blog` },
      { name: post.title, url },
    ],
  });

  const articleGraph = generateBlogArticleJsonLdGraph(blogPosting, breadcrumbJsonLd);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleGraph) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-white text-black antialiased">
        <article>
          <header className="border-b border-black">
            <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-12 pb-14 md:pt-16 md:pb-20">
              <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-10">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <li>
                    <Link href="/" className="text-black underline decoration-1 underline-offset-4 hover:no-underline">
                      Home
                    </Link>
                  </li>
                  <li className="text-neutral-300" aria-hidden>
                    /
                  </li>
                  <li>
                    <Link href="/blog" className="text-black underline decoration-1 underline-offset-4 hover:no-underline">
                      Blog
                    </Link>
                  </li>
                  <li className="text-neutral-300" aria-hidden>
                    /
                  </li>
                  <li className="text-neutral-600 max-w-[min(100%,14rem)] sm:max-w-none truncate font-normal normal-case tracking-normal">
                    {post.title}
                  </li>
                </ol>
              </nav>

              {post.category ? (
                <p className="mb-5">
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category.slug)}`}
                    className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-black border-b border-black pb-1 hover:border-transparent transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </p>
              ) : null}

              <h1 className="font-heading text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-black">
                {post.title}
              </h1>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
                {post.author?.name ? (
                  <span>
                    <span className="text-neutral-400 uppercase text-[10px] tracking-widest mr-2">
                      By
                    </span>
                    <span className="font-medium text-black">{post.author.name}</span>
                  </span>
                ) : null}
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt} className="tabular-nums">
                    {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                  </time>
                ) : null}
                {post.readingTimeMinutes ? (
                  <span className="text-neutral-400">{post.readingTimeMinutes} min read</span>
                ) : null}
              </div>
              <div className="mt-8 h-px w-full max-w-xs bg-black" aria-hidden />

              {post.coverImageUrl ? (
                <figure className="mt-12 -mx-5 sm:mx-0 sm:max-w-none">
                  <div className="overflow-hidden border border-black bg-neutral-100 aspect-[2/1] max-h-[min(70vh,520px)] rounded-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover rounded-none"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  </div>
                </figure>
              ) : null}
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 md:py-20">
            <BlogPostBody html={post.contentHtml} />

            {post.tags?.length ? (
              <footer className="mt-20 pt-12 border-t border-black">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
                  Tags
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(t.slug)}`}
                        className="inline-block text-xs font-medium uppercase tracking-wider px-3 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </footer>
            ) : null}

            <p className="mt-16 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.14em] text-black border-b border-black pb-1 hover:border-transparent transition-colors"
              >
                ← All articles
              </Link>
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
