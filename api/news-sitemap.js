const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL = 'https://olaoluwaagegroup.com.ng';
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

function escapeXml(value) {
    return String(value ?? '').replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;'
    })[character]);
}

export default async function handler(_req, res) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,slug,date&status=eq.published&order=date.desc&limit=1000`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        if (!response.ok) throw new Error(`Published posts query failed (${response.status})`);
        const posts = await response.json();
        const cutoff = Date.now() - NEWS_WINDOW_MS;
        const recentPosts = posts.filter((post) => {
            const publishedAt = Date.parse(post.date);
            return Number.isFinite(publishedAt) && publishedAt <= Date.now() && publishedAt >= cutoff;
        });
        const entries = recentPosts.map((post) => {
            const slug = post.slug || post.id;
            return `  <url><loc>${escapeXml(`${SITE_URL}/blog/${encodeURIComponent(slug)}`)}</loc><news:news><news:publication><news:name>Olaoluwa Age Group</news:name><news:language>en</news:language></news:publication><news:publication_date>${new Date(post.date).toISOString()}</news:publication_date><news:title>${escapeXml(post.title || 'Olaoluwa Age Group News')}</news:title></news:news></url>`;
        }).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${entries}\n</urlset>`;
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.status(200).send(xml);
    } catch (error) {
        console.error('News sitemap generation failed:', error);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(503).send('News sitemap temporarily unavailable');
    }
}
