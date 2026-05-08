// api/blog-post.js
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL     = 'https://olaoluwaagegroup.vercel.app';

export default async function handler(req, res) {
    const slug = req.query.slug;

    // Read the HTML shell
    let html = readFileSync(join(process.cwd(), 'blog-post-app.html'), 'utf8');

    if (!slug) {
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title,excerpt,image_url&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                }
            }
        );

        const posts = await response.json();
        const post  = posts?.[0];

        if (post) {
            const postUrl = `${SITE_URL}/blog/${slug}`;
            const title   = (post.title || 'Olaoluwa Age Group Blog') + ' — Olaoluwa Age Group';
            const desc    = post.excerpt || 'Read the latest news from the Olaoluwa Age Group community.';
            const image   = post.image_url || `${SITE_URL}/og-default.jpg`;

            // Inject real values into OG + Twitter meta tags and <title>
            html = html
                .replace(/(<meta property="og:title"[^>]*content=")[^"]*(")/,        `$1${esc(title)}$2`)
                .replace(/(<meta property="og:description"[^>]*content=")[^"]*(")/,  `$1${esc(desc)}$2`)
                .replace(/(<meta property="og:image"[^>]*content=")[^"]*(")/,        `$1${esc(image)}$2`)
                .replace(/(<meta property="og:url"[^>]*content=")[^"]*(")/,          `$1${esc(postUrl)}$2`)
                .replace(/(<meta name="twitter:title"[^>]*content=")[^"]*(")/,       `$1${esc(title)}$2`)
                .replace(/(<meta name="twitter:description"[^>]*content=")[^"]*(")/,`$1${esc(desc)}$2`)
                .replace(/(<meta name="twitter:image"[^>]*content=")[^"]*(")/,       `$1${esc(image)}$2`)
                .replace(/<title>[^<]*<\/title>/,                                    `<title>${esc(title)}</title>`)
                // Canonical URL tag
                .replace(/<\/head>/, `  <link rel="canonical" href="${esc(postUrl)}">\n</head>`);
        }
    } catch (err) {
        console.error('OG injection error:', err);
        // Serve plain HTML — JS will still load the post in the browser
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
                    }
