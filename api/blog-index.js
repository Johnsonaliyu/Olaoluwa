import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwiaWF0IjoxNzc2MTA5NjQzLCJleHAiOjIwOTE2ODU2NDN9.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL = 'https://www.olaoluwaagegroup.com.ng';

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function addNewsMetadata(html) {
    const description = 'Read the latest news, community stories and updates from Olaoluwa Age Group in Iwaro-Oka Akoko, Ondo State, Nigeria.';
    return html
        .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large">')
        .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}">`)
        .replace('</head>', `    <meta property="og:type" content="website">\n    <meta property="og:url" content="${SITE_URL}/news">\n    <meta property="og:image" content="${SITE_URL}/hero.png">\n    <meta property="og:description" content="${description}">\n    <meta name="twitter:card" content="summary_large_image">\n</head>`);
}

export default async function handler(_req, res) {
    let html;
    try {
        html = readFileSync(join(process.cwd(), 'blog.html'), 'utf8');
    } catch (error) {
        console.error('Blog index template unavailable:', error);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send('News page template unavailable');
    }

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,excerpt,date,image_url,image_alt,category,author,slug&status=eq.published&order=date.desc&limit=100`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        if (!response.ok) throw new Error(`Published posts query failed (${response.status})`);
        const posts = await response.json();
        const cards = posts.length ? posts.map((post) => {
            const slug = post.slug || post.id;
            const href = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
            const image = post.image_url
                ? `<img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.image_alt || post.title)}" style="width:100%;height:100%;object-fit:cover;">`
                : '<div class="blog-image-placeholder" aria-hidden="true">News</div>';
            return `<article class="blog-card"><div class="blog-image">${image}</div><div class="blog-content"><div>${post.category ? `<span class="blog-category">${escapeHtml(post.category)}</span>` : ''}<div class="blog-date">${escapeHtml(formatDate(post.date))}</div><h2 class="blog-title">${escapeHtml(post.title)}</h2><p class="blog-excerpt">${escapeHtml(post.excerpt)}</p></div><a href="${escapeHtml(href)}" class="read-more-btn">Read Full Story</a></div></article>`;
        }).join('\n') : '<div class="blog-notice"><p>No posts published yet. Check back soon!</p></div>';
        html = html.replace(/<div class="blog-grid" id="blog-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `<div class="blog-grid" id="blog-grid">${cards}</div></div></section>`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
        res.status(200).send(addNewsMetadata(html));
    } catch (error) {
        console.error('Blog index rendering failed:', error);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(addNewsMetadata(html));
    }
}
