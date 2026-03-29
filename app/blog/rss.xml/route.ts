import { serverFetchBlogPosts } from '@/lib/blog/blog-api-server';
import { getSiteOrigin } from '@/lib/blog/blog-seo';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const origin = getSiteOrigin();
  const payload = await serverFetchBlogPosts({ limit: 40, page: 1 });
  const posts = payload?.posts ?? [];

  let lastBuild = new Date();
  for (const p of posts) {
    const t = new Date(p.updatedAt || p.publishedAt || p.createdAt).getTime();
    if (!Number.isNaN(t) && t > lastBuild.getTime()) lastBuild = new Date(t);
  }
  const lastBuildDate = lastBuild.toUTCString();

  const logoUrl = `${origin}/logo/rrlogo-optimized.png`;

  const items = posts
    .map((p) => {
      const link = `${origin}/blog/${encodeURIComponent(p.slug)}`;
      const pub = p.publishedAt
        ? new Date(p.publishedAt).toUTCString()
        : new Date(p.updatedAt).toUTCString();
      const desc = escapeXml((p.excerpt || p.title).slice(0, 500));
      const categoryLine = p.category?.name
        ? `\n      <category>${escapeXml(p.category.name)}</category>`
        : '';
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${desc}</description>${categoryLine}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RoomRentalUSA Blog</title>
    <link>${origin}/blog</link>
    <description>Housing guides and insights for renters and landlords.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>120</ttl>
    <image>
      <url>${escapeXml(logoUrl)}</url>
      <title>RoomRentalUSA Blog</title>
      <link>${origin}/blog</link>
    </image>
    <atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml" />
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
