import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogPostBody } from '@/components/blog/public/BlogPostBody';
import { serverFetchBlogPostBySlug } from '@/lib/blog/blog-api-server';
import { generateBreadcrumbSchema, generateBlogPostingSchema } from '@/lib/seo/structured-data';
import { format } from 'date-fns';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetchBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Article not found' };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || `${post.title} — RoomRentalUSA blog.`;
  const url = `${siteUrl}/blog/${post.slug}`;
  const canonical = post.canonicalUrl || url;
  const ogImages = [
    post.ogImageUrl || post.coverImageUrl || `${siteUrl}/logo/rrlogo-optimized.png`,
  ].filter(Boolean) as string[];

  return {
    title,
    description: description.slice(0, 160),
    keywords: post.keywords?.length ? post.keywords : undefined,
    authors: post.author?.name ? [{ name: post.author.name }] : [{ name: 'RoomRentalUSA' }],
    robots: {
      index: post.robotsIndex,
      follow: post.robotsFollow,
      googleBot: {
        index: post.robotsIndex,
        follow: post.robotsFollow,
      },
    },
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description: description.slice(0, 200),
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImages.map((u) => ({ url: u, width: 1200, height: 630, alt: post.title })),
      siteName: 'RoomRentalUSA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 200),
      images: ogImages,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await serverFetchBlogPostBySlug(slug);
  if (!post) notFound();

  const url = `${siteUrl}/blog/${post.slug}`;
  const description =
    post.metaDescription || post.excerpt || `${post.title} — RoomRentalUSA blog.`;

  const blogJsonLd = generateBlogPostingSchema({
    headline: post.title,
    description: description.slice(0, 300),
    url,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    imageUrls: [post.ogImageUrl || post.coverImageUrl].filter(Boolean) as string[],
    authorName: post.author?.name || undefined,
    keywords: post.keywords,
    publisherName: 'RoomRentalUSA',
    publisherLogoUrl: `${siteUrl}/logo/rrlogo-optimized.png`,
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: siteUrl },
      { name: 'Blog', url: `${siteUrl}/blog` },
      { name: post.title, url },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-stone-50">
        <article className="pb-16">
          <header className="bg-white border-b border-stone-200">
            <div className="container mx-auto px-4 pt-10 pb-12 max-w-3xl">
              <nav aria-label="Breadcrumb" className="text-sm text-stone-500 mb-6">
                <ol className="flex flex-wrap gap-2">
                  <li>
                    <Link href="/" className="hover:text-emerald-700">
                      Home
                    </Link>
                    <span className="mx-2 text-stone-300">/</span>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-emerald-700">
                      Blog
                    </Link>
                    <span className="mx-2 text-stone-300">/</span>
                  </li>
                  <li className="text-stone-800 font-medium truncate max-w-[12rem] sm:max-w-none">
                    {post.title}
                  </li>
                </ol>
              </nav>
              {post.category && (
                <p className="text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-2">
                  {post.category.name}
                </p>
              )}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-stone-600 text-sm">
                {post.author?.name && (
                  <span>
                    By <span className="font-medium text-stone-800">{post.author.name}</span>
                  </span>
                )}
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                  </time>
                )}
                {post.readingTimeMinutes ? (
                  <span className="text-stone-500">{post.readingTimeMinutes} min read</span>
                ) : null}
              </div>
              {post.coverImageUrl ? (
                <div className="mt-10 rounded-2xl overflow-hidden border border-stone-200 shadow-md aspect-[2/1] max-h-[480px] bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
              ) : null}
            </div>
          </header>

          <div className="container mx-auto px-4 py-12 max-w-3xl">
            <BlogPostBody html={post.contentHtml} />
            {post.tags?.length ? (
              <footer className="mt-14 pt-8 border-t border-stone-200">
                <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Tags
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(t.slug)}`}
                        className="text-sm px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-emerald-300 hover:text-emerald-800"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </footer>
            ) : null}
            <p className="mt-12 text-center">
              <Link href="/blog" className="text-emerald-700 font-semibold hover:text-emerald-800">
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
