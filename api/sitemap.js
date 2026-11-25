const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwiaWF0IjoxNzc2MTA5NjQzLCJleHAiOjIwOTE2ODU2NDN9.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL = 'https://olaoluwaagegroup.com.ng';

function escapeXml(value) {
    return String(value).replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;'
    })[character]);
}

export default async function handler(_req, res) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,id,date&status=eq.published&order=date.desc&limit=5000`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        if (!response.ok) throw new Error(`Published posts query failed (${response.status})`);
        const posts = await response.json();
        const urls = [
            { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
            { loc: `${SITE_URL}/news`, changefreq: 'daily', priority: '0.9' },
            ...posts.filter((post) => post.slug || post.id).map((post) => ({
                loc: `${SITE_URL}/blog/${encodeURIComponent(post.slug || post.id)}`,
                lastmod: Number.isFinite(Date.parse(post.date)) ? new Date(post.date).toISOString() : undefined,
                changefreq: 'monthly',
                priority: '0.8'
            }))
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}<changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>`;
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(503).send('Sitemap temporarily unavailable');
    }
}
