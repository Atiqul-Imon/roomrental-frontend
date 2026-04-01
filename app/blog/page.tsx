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
    'text-xs font-semibold uppercase tracking-[0.12em] transition-all border rounded-xl',
    active
      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
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

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);
  const hasAnyFilters = Boolean(category || tag || featuredOnly);

  const FilterNav = ({ className }: { className?: string }) => (
    <nav className={className} aria-label="Blog categories">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
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
      <main id="main-content" className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10 md:py-16 lg:px-14 lg:py-20">
            <div className="max-w-4xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                RoomRentalUSA · Editorial
              </p>
              <h1 className="font-heading text-[clamp(2.4rem,6vw,4.4rem)] font-bold leading-[0.95] tracking-[-0.04em] text-slate-950">
                Housing stories that help people rent smarter
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Practical guides for finding rooms, working with landlords, and making the most of student and
                young-professional housing.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                  {filterLabel}
                </span>
                {tag ? (
                  <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    #{tag}
                  </span>
                ) : null}
                <span className="text-xs text-slate-500">
                  {pagination?.total ?? posts.length} article{(pagination?.total ?? posts.length) === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-8">
              <div className="lg:hidden">
                <nav className="flex flex-wrap gap-2" aria-label="Blog categories">
                  <Link href={blogListHref({})} className={filterChipClass(!category && !tag && !featuredOnly)}>
                    All stories
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
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-lg font-medium text-slate-700">No articles for this filter yet.</p>
                  <p className="mt-2 text-sm text-slate-500">Try a different category or check back soon.</p>
                </div>
              ) : (
                <>
                  {featuredPost ? (
                    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="grid gap-0 md:grid-cols-2">
                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="relative block h-full min-h-[250px] overflow-hidden bg-slate-100"
                        >
                          {featuredPost.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={featuredPost.coverImageUrl}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                          )}
                        </Link>
                        <div className="flex flex-col justify-center p-6 sm:p-8">
                          <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {featuredPost.isFeatured ? (
                              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                Featured
                              </span>
                            ) : null}
                            {featuredPost.category ? (
                              <Link
                                href={blogListHref({ category: featuredPost.category.slug })}
                                className="hover:text-slate-900"
                              >
                                {featuredPost.category.name}
                              </Link>
                            ) : null}
                            {featuredPost.readingTimeMinutes ? <span>{featuredPost.readingTimeMinutes} min</span> : null}
                            {featuredPost.publishedAt ? (
                              <time dateTime={featuredPost.publishedAt}>
                                {format(new Date(featuredPost.publishedAt), 'MMM d, yyyy')}
                              </time>
                            ) : null}
                          </div>
                          <h2 className="font-heading text-2xl font-bold leading-tight tracking-[-0.02em] text-slate-950 sm:text-3xl line-clamp-3">
                            <Link href={`/blog/${featuredPost.slug}`} className="hover:text-emerald-700">
                              {featuredPost.title}
                            </Link>
                          </h2>
                          {featuredPost.excerpt ? (
                            <p className="mt-3 line-clamp-2 text-[15px] leading-6 text-slate-600 sm:text-base">
                              {featuredPost.excerpt}
                            </p>
                          ) : null}
                          <div className="mt-5">
                            <Link
                              href={`/blog/${featuredPost.slug}`}
                              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700"
                            >
                              Read article <span aria-hidden>→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  {secondaryPosts.length > 0 ? (
                    <ul className="grid gap-6 md:grid-cols-2">
                      {secondaryPosts.map((post) => (
                        <li key={post.id}>
                          <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                            <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-slate-100">
                              {post.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.coverImageUrl}
                                  alt=""
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                              )}
                            </Link>
                            <div className="p-5 sm:p-6">
                              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                {post.category ? (
                                  <Link href={blogListHref({ category: post.category.slug })} className="hover:text-slate-900">
                                    {post.category.name}
                                  </Link>
                                ) : null}
                                {post.readingTimeMinutes ? <span>{post.readingTimeMinutes} min</span> : null}
                                {post.publishedAt ? (
                                  <time dateTime={post.publishedAt}>
                                    {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                                  </time>
                                ) : null}
                              </div>
                              <h3 className="font-heading text-xl font-bold leading-snug tracking-[-0.018em] text-slate-950 line-clamp-2">
                                <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                                  {post.title}
                                </Link>
                              </h3>
                              {post.excerpt ? (
                                <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                              ) : null}
                              {post.tags?.length ? (
                                <ul className="mt-3.5 flex flex-wrap gap-1.5">
                                  {post.tags.slice(0, 3).map((t) => (
                                    <li key={t.slug}>
                                      <Link
                                        href={blogListHref({
                                          tag: t.slug,
                                          category,
                                          featured: featuredOnly,
                                        })}
                                        className="inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                      >
                                        {t.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {pagination && pagination.totalPages > 1 ? (
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
                      {page > 1 ? (
                        <Link
                          href={blogListHref({
                            page: page - 1,
                            category,
                            tag,
                            featured: featuredOnly,
                          })}
                          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-50"
                        >
                          Previous
                        </Link>
                      ) : (
                        <span className="inline-flex cursor-not-allowed items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                          Previous
                        </span>
                      )}
                      <span className="text-xs font-medium tracking-wide text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      {page < pagination.totalPages ? (
                        <Link
                          href={blogListHref({
                            page: page + 1,
                            category,
                            tag,
                            featured: featuredOnly,
                          })}
                          className="inline-flex items-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-slate-800"
                        >
                          Next
                        </Link>
                      ) : (
                        <span className="inline-flex cursor-not-allowed items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                          Next
                        </span>
                      )}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <FilterNav />
                {!hasAnyFilters ? null : (
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link
                      href={blogListHref({})}
                      className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 hover:text-emerald-800"
                    >
                      Clear filters
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
