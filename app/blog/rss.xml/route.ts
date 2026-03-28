import { serverFetchBlogPosts } from '@/lib/blog/blog-api-server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roomrentalusa.com';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const payload = await serverFetchBlogPosts({ limit: 40, page: 1 });
  const posts = payload?.posts ?? [];

  const items = posts
    .map((p) => {
      const link = `${siteUrl}/blog/${p.slug}`;
      const pub = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date(p.updatedAt).toUTCString();
      const desc = escapeXml((p.excerpt || p.title).slice(0, 500));
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RoomRentalUSA Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Housing guides and insights for renters and landlords.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
