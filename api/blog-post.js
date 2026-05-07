// api/blog-post.js
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';

export default async function handler(req, res) {
    const { id } = req.query;

    // Read the HTML shell
    let html = readFileSync(join(process.cwd(), 'blog-post-app.html'), 'utf8');

    if (!id) {
        // No post ID — serve the page as-is (JS will handle the error state)
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    try {
        // Fetch post from Supabase
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}&select=title,excerpt,image_url,date&limit=1`,
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY,
                }
            }
        );

        const posts = await response.json();
        const post = posts?.[0];

        if (post) {
            const siteUrl = 'https://olaoluwaagegroup.vercel.app';
            const postUrl = `${siteUrl}/blog-post?id=${id}`;
            const title   = (post.title || 'Olaoluwa Age Group Blog') + ' - Olaoluwa Age Group';
            const desc    = post.excerpt || 'Read the latest news from Olaoluwa Age Group.';
            const image   = post.image_url || `${siteUrl}/og-default.jpg`;

            // Inject real values into OG meta tags
            html = html
                .replace(/(<meta property="og:title"[^>]*content=")[^"]*(")/,   `$1${esc(title)}$2`)
                .replace(/(<meta property="og:description"[^>]*content=")[^"]*(")/,`$1${esc(desc)}$2`)
                .replace(/(<meta property="og:image"[^>]*content=")[^"]*(")/,   `$1${esc(image)}$2`)
                .replace(/(<meta property="og:url"[^>]*content=")[^"]*(")/,     `$1${esc(postUrl)}$2`)
                .replace(/(<meta name="twitter:title"[^>]*content=")[^"]*(")/,  `$1${esc(title)}$2`)
                .replace(/(<meta name="twitter:description"[^>]*content=")[^"]*(")/,`$1${esc(desc)}$2`)
                .replace(/(<meta name="twitter:image"[^>]*content=")[^"]*(")/,  `$1${esc(image)}$2`)
                .replace(/<title>[^<]*<\/title>/,                               `<title>${esc(title)}</title>`);
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
