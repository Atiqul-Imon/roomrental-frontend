import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  serverFetchBlogPosts,
  serverFetchBlogCategories,
} from '@/lib/blog/blog-api-server';
import { format } from 'date-fns';

export const revalidate = 120;

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

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-stone-50">
        <div className="border-b border-stone-200/80 bg-white">
          <div className="container mx-auto px-4 py-14 md:py-16 max-w-5xl">
            <p className="text-emerald-700 font-medium text-sm uppercase tracking-wide mb-3">
              RoomRentalUSA
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
              Blog
            </h1>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl leading-relaxed">
              Practical guides for finding rooms, working with landlords, and making the most of
              student and young-professional housing.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-5xl">
          {categories.length > 0 && (
            <nav
              className="flex flex-wrap gap-2 mb-10"
              aria-label="Blog categories"
            >
              <Link
                href={blogListHref({})}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  !category && !tag && !featuredOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                }`}
              >
                All
              </Link>
              <Link
                href={blogListHref({ featured: true })}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  featuredOnly && !category && !tag
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                }`}
              >
                Featured
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={blogListHref({ category: c.slug, featured: featuredOnly })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === c.slug
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  {c.name}
                  {typeof c._count?.posts === 'number' && (
                    <span className="opacity-80 ml-1">({c._count.posts})</span>
                  )}
                </Link>
              ))}
            </nav>
          )}

          <ul className="grid gap-8 md:gap-10">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="group flex flex-col md:flex-row gap-6 md:gap-10 bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300">
                  {post.coverImageUrl ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="shrink-0 w-full md:w-72 aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 relative block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  ) : null}
                  <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500 mb-2">
                      {post.isFeatured ? (
                        <span className="text-amber-700 font-semibold uppercase tracking-wide text-xs">
                          Featured
                        </span>
                      ) : null}
                      {post.category && (
                        <span className="text-emerald-700 font-medium">{post.category.name}</span>
                      )}
                      {post.readingTimeMinutes ? (
                        <span>{post.readingTimeMinutes} min read</span>
                      ) : null}
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt}>
                          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                        </time>
                      )}
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-stone-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 text-stone-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                          <li key={t.slug}>
                            <Link
                              href={blogListHref({ tag: t.slug, category, featured: featuredOnly })}
                              className="text-xs font-medium px-2 py-1 rounded-md bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              {t.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-emerald-700 font-semibold text-sm hover:text-emerald-800"
                      >
                        Read article
                        <span className="ml-1 group-hover:translate-x-0.5 transition-transform" aria-hidden>
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {posts.length === 0 && (
            <p className="text-center text-stone-600 py-16">No articles here yet. Check back soon.</p>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-12">
              {page > 1 ? (
                <Link
                  href={blogListHref({
                    page: page - 1,
                    category,
                    tag,
                    featured: featuredOnly,
                  })}
                  className="px-4 py-2 rounded-lg border border-stone-200 bg-white hover:border-emerald-300 text-stone-800"
                >
                  Previous
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-stone-100 text-stone-400 cursor-not-allowed">
                  Previous
                </span>
              )}
              <span className="py-2 text-stone-600 text-sm">
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
                  className="px-4 py-2 rounded-lg border border-stone-200 bg-white hover:border-emerald-300 text-stone-800"
                >
                  Next
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg border border-stone-100 text-stone-400 cursor-not-allowed">
                  Next
                </span>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
