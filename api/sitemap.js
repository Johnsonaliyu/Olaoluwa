// api/sitemap.js
const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL    = 'https://olaoluwaagegroup.com.ng';

export default async function handler(req, res) {
    // Fetch all published blog post slugs from Supabase
    let blogUrls = '';
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=slug,updated_at&order=created_at.desc`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                }
            }
        );
        const posts = await response.json();

        blogUrls = posts.map(post => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <lastmod>${post.updated_at ? post.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>`).join('');

    } catch (err) {
        console.error('Sitemap: failed to fetch posts', err);
        // If Supabase fails, we still return the static pages below
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Static pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/awards-vote.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Blog posts (dynamic from Supabase) -->
  ${blogUrls}

</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600'); // cache for 1 hour on Vercel
    res.send(xml);
           }
