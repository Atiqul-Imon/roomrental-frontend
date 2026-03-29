import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  serverFetchBlogPosts,
  serverFetchBlogCategories,
} from '@/lib/blog/blog-api-server';
import { buildBlogIndexCanonical, getSiteOrigin } from '@/lib/blog/blog-seo';
import { generateBlogIndexJsonLd } from '@/lib/seo/structured-data';
import { format } from 'date-fns';

export const revalidate = 120;

const BLOG_INDEX_DESCRIPTION =
  'Expert room rental guides for renters and landlords in the United States — housing tips, leases, budgets, and how to use RoomRentalUSA.';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; featured?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const siteUrl = getSiteOrigin();
  const canonical = buildBlogIndexCanonical(siteUrl, sp);
  const categoriesPayload = await serverFetchBlogCategories();
  const categories = categoriesPayload?.categories ?? [];
  const categoryName =
    sp.category && categories.length
      ? categories.find((c) => c.slug === sp.category)?.name
      : undefined;
  const featured =
    sp.featured === '1' || sp.featured === 'true' || sp.featured === 'yes';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  let titleSegment = 'Blog';
  if (featured && !sp.category && !sp.tag) titleSegment = 'Featured articles';
  else if (categoryName) titleSegment = categoryName;
  else if (sp.tag?.trim()) titleSegment = `Tag: ${sp.tag.trim()}`;
  const title =
    page > 1 ? `${titleSegment} — Page ${page}` : titleSegment;
  const ogTitle = `${title} | RoomRentalUSA`;

  return {
    title,
    description: BLOG_INDEX_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'RoomRentalUSA',
      locale: 'en_US',
      title: ogTitle,
      description: BLOG_INDEX_DESCRIPTION,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: BLOG_INDEX_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

function blogListHref(opts: {
  page?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
}): string {
  const p = new URLSearchParams();
  if (opts.page != null && opts.page > 1) p.set('page', String(opts.page));
  if (opts.category) p.set('category', opts.category);
  if (opts.tag) p.set('tag', opts.tag);
  if (opts.featured) p.set('featured', '1');
  const q = p.toString();
  return q ? `/blog?${q}` : '/blog';
}

function filterChipClass(active: boolean, compact?: boolean) {
  return [
    compact ? 'block w-full text-left px-4 py-3' : 'inline-flex items-center px-4 py-2.5',
    'text-xs font-semibold uppercase tracking-[0.14em] transition-colors border rounded-none',
    active
      ? 'border-black bg-black text-white'
      : 'border-neutral-300 bg-white text-black hover:border-black hover:bg-neutral-50',
  ].join(' ');
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; featured?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const category = sp.category;
  const tag = sp.tag;
  const featuredOnly =
    sp.featured === '1' || sp.featured === 'true' || sp.featured === 'yes';

  const [postsPayload, categoriesPayload] = await Promise.all([
    serverFetchBlogPosts({
      page,
      limit: 12,
      category,
      tag,
      featured: featuredOnly || undefined,
    }),
    serverFetchBlogCategories(),
  ]);

  const posts = postsPayload?.posts ?? [];
  const pagination = postsPayload?.pagination;
  const categories = categoriesPayload?.categories ?? [];

  const filterLabel =
    featuredOnly && !category && !tag
      ? 'Featured'
      : category
        ? categories.find((c) => c.slug === category)?.name ?? 'Category'
        : tag
          ? 'Tag'
          : 'All stories';

  const siteOrigin = getSiteOrigin();
  const indexCanonical = buildBlogIndexCanonical(siteOrigin, {
    page: String(page),
    category,
    tag,
    featured: featuredOnly ? '1' : undefined,
  });
  const indexJsonLd = generateBlogIndexJsonLd({
    pageUrl: indexCanonical,
    siteUrl: siteOrigin,
    name: `RoomRentalUSA Blog${page > 1 ? ` — Page ${page}` : ''}`,
    description: BLOG_INDEX_DESCRIPTION,
    items: posts.map((p) => ({
      url: `${siteOrigin}/blog/${encodeURIComponent(p.slug)}`,
      name: p.title,
    })),
  });

  const FilterNav = ({ className }: { className?: string }) => (
    <nav className={className} aria-label="Blog categories">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-4">
        Browse
      </p>
      <div className="flex flex-col gap-2">
        <Link href={blogListHref({})} className={filterChipClass(!category && !tag && !featuredOnly, true)}>
          All stories
        </Link>
        <Link
          href={blogListHref({ featured: true })}
          className={filterChipClass(featuredOnly && !category && !tag, true)}
        >
          Featured
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={blogListHref({ category: c.slug, featured: featuredOnly })}
            className={filterChipClass(category === c.slug, true)}
          >
            <span className="flex items-center justify-between gap-2">
              <span>{c.name}</span>
              {typeof c._count?.posts === 'number' ? (
                <span className="tabular-nums opacity-60 font-normal">{c._count.posts}</span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(indexJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-white text-black antialiased">
        <header className="border-b border-black">
          <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 pt-16 pb-12 md:pt-20 md:pb-16">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500 mb-5">
                RoomRentalUSA · Journal
              </p>
              <h1 className="font-heading text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em] text-black">
                Blog
              </h1>
              <p className="mt-8 text-lg md:text-xl leading-[1.65] text-neutral-600 font-light max-w-xl">
                Practical guides for finding rooms, working with landlords, and making the most of
                student and young-professional housing.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="h-px w-20 bg-black shrink-0" aria-hidden />
                <p className="text-sm text-neutral-500">
                  <span className="text-neutral-400 uppercase tracking-wider text-[10px] mr-2">Viewing</span>
                  <span className="font-medium text-black">{filterLabel}</span>
                  {tag ? ` · ${tag}` : null}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-12 md:py-16 lg:py-20">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,260px)] lg:gap-x-16 xl:gap-x-24 lg:items-start">
            <div className="min-w-0">
              <div className="mb-10 pb-10 border-b border-black lg:hidden">
                <nav className="flex flex-wrap gap-2" aria-label="Blog categories">
                  <Link href={blogListHref({})} className={filterChipClass(!category && !tag && !featuredOnly)}>
                    All
                  </Link>
                  <Link href={blogListHref({ featured: true })} className={filterChipClass(featuredOnly && !category && !tag)}>
                    Featured
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={blogListHref({ category: c.slug, featured: featuredOnly })}
                      className={filterChipClass(category === c.slug)}
                    >
                      <span>{c.name}</span>
                      {typeof c._count?.posts === 'number' ? (
                        <span className="ml-2 tabular-nums opacity-70">({c._count.posts})</span>
                      ) : null}
                    </Link>
                  ))}
                </nav>
              </div>

              <ul className="border-t border-black">
                {posts.map((post, index) => {
                  const globalIndex = (page - 1) * (pagination?.limit ?? 12) + index + 1;
                  const isLead = index === 0 && page === 1 && !category && !tag && !featuredOnly;

                  return (
                    <li key={post.id} className="border-b border-neutral-200">
                      <article
                        className={`group py-12 md:py-16 ${
                          isLead ? 'md:py-20' : ''
                        } grid gap-8 md:grid-cols-[3.25rem_minmax(0,1fr)] md:gap-x-8 lg:gap-x-12`}
                      >
                        <div className="hidden md:flex md:flex-col md:items-end md:pt-1">
                          <span className="text-[2.25rem] md:text-[2.75rem] font-light text-neutral-200 tabular-nums leading-none tracking-tight">
                            {String(globalIndex).padStart(2, '0')}
                          </span>
                        </div>

                        <div
                          className={`grid gap-8 min-w-0 ${
                            isLead
                              ? 'lg:grid-cols-12 lg:gap-10 lg:items-center'
                              : 'lg:grid-cols-12 lg:gap-10 lg:items-start'
                          }`}
                        >
                          {post.coverImageUrl ? (
                            <Link
                              href={`/blog/${post.slug}`}
                              className={`block overflow-hidden bg-neutral-100 border border-black shrink-0 rounded-none ${
                                isLead ? 'lg:col-span-6 aspect-[5/4] lg:aspect-[4/5]' : 'lg:col-span-5 aspect-[16/10] lg:aspect-[5/4]'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.coverImageUrl}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] rounded-none"
                                loading="lazy"
                                decoding="async"
                              />
                            </Link>
                          ) : (
                            <div
                              className={`hidden lg:block border border-dashed border-neutral-300 bg-neutral-50 rounded-none shrink-0 ${
                                isLead ? 'lg:col-span-6 aspect-[5/4]' : 'lg:col-span-5 aspect-[5/4]'
                              }`}
                              aria-hidden
                            />
                          )}

                          <div
                            className={`flex flex-col justify-center min-w-0 ${
                              isLead
                                ? post.coverImageUrl
                                  ? 'lg:col-span-6'
                                  : 'lg:col-span-12'
                                : post.coverImageUrl
                                  ? 'lg:col-span-7'
                                  : 'lg:col-span-12'
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-4">
                              {post.isFeatured ? (
                                <span className="border border-black px-2 py-0.5 text-black rounded-none">
                                  Featured
                                </span>
                              ) : null}
                              {post.category ? (
                                <Link
                                  href={blogListHref({ category: post.category.slug })}
                                  className="text-black underline decoration-1 underline-offset-[3px] hover:no-underline"
                                >
                                  {post.category.name}
                                </Link>
                              ) : null}
                              {post.readingTimeMinutes ? (
                                <span className="text-neutral-400">{post.readingTimeMinutes} min</span>
                              ) : null}
                              {post.publishedAt ? (
                                <time dateTime={post.publishedAt} className="text-neutral-400">
                                  {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                                </time>
                              ) : null}
                            </div>

                            <h2
                              className={`font-heading font-bold tracking-[-0.035em] text-black ${
                                isLead ? 'text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12]' : 'text-2xl sm:text-3xl lg:text-[1.85rem] leading-snug'
                              }`}
                            >
                              <Link
                                href={`/blog/${post.slug}`}
                                className="hover:underline decoration-1 underline-offset-[6px]"
                              >
                                {post.title}
                              </Link>
                            </h2>

                            {post.excerpt ? (
                              <p
                                className={`mt-5 text-neutral-600 leading-relaxed font-light ${
                                  isLead ? 'text-lg line-clamp-4 max-w-2xl' : 'text-[17px] line-clamp-3'
                                }`}
                              >
                                {post.excerpt}
                              </p>
                            ) : null}

                            {post.tags?.length ? (
                              <ul className="mt-6 flex flex-wrap gap-2">
                                {post.tags.map((t) => (
                                  <li key={t.slug}>
                                    <Link
                                      href={blogListHref({
                                        tag: t.slug,
                                        category,
                                        featured: featuredOnly,
                                      })}
                                      className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 border border-neutral-400 text-neutral-700 hover:border-black hover:text-black transition-colors rounded-none"
                                    >
                                      {t.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : null}

                            <div className="mt-8">
                              <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.16em] text-black border-b-2 border-black pb-1 hover:border-transparent transition-colors"
                              >
                                Read article
                                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                                  →
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>

              {posts.length === 0 ? (
                <div className="py-28 text-center border-t border-black">
                  <p className="text-neutral-500 text-lg font-light tracking-wide">No articles here yet.</p>
                  <p className="mt-3 text-sm text-neutral-400">Check back soon.</p>
                </div>
              ) : null}

              {pagination && pagination.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-16 pt-14 border-t border-black">
                  {page > 1 ? (
                    <Link
                      href={blogListHref({
                        page: page - 1,
                        category,
                        tag,
                        featured: featuredOnly,
                      })}
                      className="px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors rounded-none"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="px-8 py-3.5 text-xs text-neutral-300 border border-neutral-200 cursor-not-allowed uppercase tracking-[0.14em] rounded-none">
                      Previous
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 tabular-nums px-4 tracking-widest">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  {page < pagination.totalPages ? (
                    <Link
                      href={blogListHref({
                        page: page + 1,
                        category,
                        tag,
                        featured: featuredOnly,
                      })}
                      className="px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors rounded-none"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="px-8 py-3.5 text-xs text-neutral-300 border border-neutral-200 cursor-not-allowed uppercase tracking-[0.14em] rounded-none">
                      Next
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 border border-black p-6 bg-neutral-50/30 rounded-none">
                <FilterNav />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
