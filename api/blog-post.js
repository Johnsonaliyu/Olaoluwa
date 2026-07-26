// api/blog-post.js
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL     = 'https://olaoluwaagegroup.com.ng';

const HEADERS = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };

export default async function handler(req, res) {
    const slug = req.query.slug;

    // Read the HTML shell
    let html = readFileSync(join(process.cwd(), 'blog-post-app.html'), 'utf8');

    if (!slug) {
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    try {
        const [postRes, relatedRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`, { headers: HEADERS }),
            fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=id,slug,title,date,image_url,image_alt&status=eq.published&order=date.desc&limit=5`, { headers: HEADERS })
        ]);

        const posts   = await postRes.json();
        const post    = posts?.[0];
        const related = relatedRes.ok ? await relatedRes.json() : [];

        if (post) {
            let author = null;
            if (post.author_id) {
                try {
                    const aRes = await fetch(`${SUPABASE_URL}/rest/v1/authors?id=eq.${encodeURIComponent(post.author_id)}&select=*`, { headers: HEADERS });
                    const authors = aRes.ok ? await aRes.json() : [];
                    author = authors?.[0] || null;
                } catch { /* non-fatal — page still renders without author bio */ }
            }

            const postUrl   = `${SITE_URL}/blog/${slug}`;
            const title     = (post.title || 'Olaoluwa Age Group Blog') + ' — Olaoluwa Age Group';
            const desc      = post.excerpt || 'Read the latest news from the Olaoluwa Age Group community.';
            const image     = post.image_url || `${SITE_URL}/og-default.jpg`;
            const pageUrl   = encodeURIComponent(postUrl);
            const pageTitle = encodeURIComponent(post.title || 'Olaoluwa Age Group Blog');

            // ── Meta tags (title, OG, Twitter, canonical) ──
            html = html
                .replace(/(<meta property="og:title"[^>]*content=")[^"]*(")/,        `$1${esc(title)}$2`)
                .replace(/(<meta property="og:description"[^>]*content=")[^"]*(")/,  `$1${esc(desc)}$2`)
                .replace(/(<meta property="og:image"[^>]*content=")[^"]*(")/,        `$1${esc(image)}$2`)
                .replace(/(<meta property="og:url"[^>]*content=")[^"]*(")/,          `$1${esc(postUrl)}$2`)
                .replace(/(<meta name="twitter:title"[^>]*content=")[^"]*(")/,       `$1${esc(title)}$2`)
                .replace(/(<meta name="twitter:description"[^>]*content=")[^"]*(")/,`$1${esc(desc)}$2`)
                .replace(/(<meta name="twitter:image"[^>]*content=")[^"]*(")/,       `$1${esc(image)}$2`)
                .replace(/<title>[^<]*<\/title>/,                                    `<title>${esc(title)}</title>`)
                .replace(/<\/head>/, `  <meta name="description" content="${esc(desc)}">\n  <link rel="canonical" href="${esc(postUrl)}">\n</head>`);

            // ── Header (date, title, category) ──
            html = replaceById(html, 'post-header', 'div', `
                <p style="color:#d4af37;font-weight:600;margin-bottom:0.75rem;">📅 ${formatDate(post.date)}</p>
                <h1>${esc(post.title)}</h1>
                ${post.category ? `<p style="margin-top:1rem;opacity:0.85;font-size:0.95rem;">🏷 ${esc(post.category)}</p>` : ''}
            `);

            // ── Full article body ──
            const authorAvatar = author?.photo_url
                ? `<img src="${esc(author.photo_url)}" alt="${esc(author.name || 'Author')}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`
                : `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="11" cy="7.5" r="3.5" stroke="white" stroke-width="1.6"/>
                     <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                   </svg>`;

            const authorBioCard = author ? `
                <div class="author-bio-card">
                    ${author.photo_url
                        ? `<img class="author-bio-photo" src="${esc(author.photo_url)}" alt="${esc(author.name)}">`
                        : `<div class="author-bio-photo-placeholder">
                             <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                               <circle cx="18" cy="13" r="7" stroke="rgba(255,255,255,0.8)" stroke-width="1.6"/>
                               <path d="M4 32c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="rgba(255,255,255,0.8)" stroke-width="1.6" stroke-linecap="round"/>
                             </svg>
                           </div>`}
                    <div class="author-bio-text">
                        <div class="author-bio-kicker">About the Author</div>
                        <div class="author-bio-name">${esc(author.name)}</div>
                        ${author.bio ? `<p class="author-bio-body">${esc(author.bio)}</p>` : ''}
                    </div>
                </div>` : '';

            const containerHtml = `
                ${post.image_url
                    ? `<div class="blog-post-featured-image">
                           <img src="${esc(post.image_url)}" alt="${esc(post.image_alt || post.title)}" style="width:100%;height:100%;object-fit:cover;">
                       </div>`
                    : ''
                }

                <div class="author-share-block">
                  <div class="author-info">
                    <div class="author-avatar" id="author-avatar-icon" style="overflow:hidden;padding:0;">
                      ${authorAvatar}
                    </div>
                    <div class="author-details">
                      <span class="author-by-label">Written by</span>
                      <span class="author-name-text">${esc(post.author || 'Olaoluwa Age Group')}</span>
                      <div class="author-date-row">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="#888" stroke-width="1.2"/>
                          <path d="M4 1.5v2M9 1.5v2M1 5.5h11" stroke="#888" stroke-width="1.1" stroke-linecap="round"/>
                        </svg>
                        <span>${formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div class="share-group">
                    <span class="share-label">Share this post</span>
                    <div class="share-buttons">
                      <a class="share-btn facebook" href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" rel="noopener" title="Share on Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M15.12 8H13a.5.5 0 0 0-.5.5V10h2.5l-.4 2.5H12.5V19h-2.5v-6.5H8.5V10H10V8.5A3.5 3.5 0 0 1 13.5 5H15.12v3z" fill="white"/></svg>
                      </a>
                      <a class="share-btn whatsapp" href="https://wa.me/?text=${pageTitle}%20${pageUrl}" target="_blank" rel="noopener" title="Share on WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M17.1 14.4c-.3-.1-1.7-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.2 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3z" fill="white"/><path d="M12 4a8 8 0 0 0-6.9 12l-1.1 4 4.1-1.1A8 8 0 1 0 12 4zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z" fill="white"/></svg>
                      </a>
                      <a class="share-btn x-twitter" href="https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener" title="Share on X">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#000"/><path d="M13.54 10.94L17.5 6.5h-1.1l-3.44 3.8L10.24 6.5H6.5l4.15 5.74L6.5 17.5h1.1l3.63-4 2.87 4H17.5l-3.96-6.56zm-1.28 1.42-.42-.57-3.36-4.6h1.45l2.7 3.72.42.57 3.52 4.83h-1.44l-2.87-3.95z" fill="white"/></svg>
                      </a>
                      <a class="share-btn linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}" target="_blank" rel="noopener" title="Share on LinkedIn">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#0A66C2"/><path d="M8.5 10H7v7h1.5v-7zm-.75-1a.88.88 0 1 0 0-1.75.88.88 0 0 0 0 1.75zM17 13.2c0-1.8-.9-3.2-2.6-3.2-.8 0-1.5.4-1.9 1V10H11v7h1.5v-3.8c0-.9.5-1.7 1.4-1.7.9 0 1.6.6 1.6 1.8V17H17v-3.8z" fill="white"/></svg>
                      </a>
                      <a class="share-btn telegram" href="https://t.me/share/url?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener" title="Share on Telegram">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path d="M18 7.5l-2.5 11c-.2.8-.7 1-1.3.6l-3.5-2.6-1.7 1.6c-.2.2-.4.3-.8.3l.3-3.7 6.7-6c.3-.3-.1-.4-.4-.2L7 14.3 3.6 13.2c-.8-.2-.8-.8.2-1.1l13.2-5.1c.6-.2 1.2.2 1 1.5z" fill="white"/></svg>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="post-meta-bar">
                    ${post.category ? `<span class="category-tag">${esc(post.category)}</span>` : ''}
                    <span class="meta-item">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="9.5" rx="1.5" stroke="#777" stroke-width="1.2"/><path d="M4 1.5v2M9 1.5v2M1 5.5h11" stroke="#777" stroke-width="1.1" stroke-linecap="round"/></svg>
                        ${formatDate(post.date)}
                    </span>
                </div>

                <article class="blog-post-content">
                    ${post.content || '<p>No content available.</p>'}
                </article>

                <div id="author-bio-card-wrap">${authorBioCard}</div>

                <div class="blog-post-footer">
                    <a href="/blog" class="primary-btn">← Back to All Posts</a>
                </div>
            `;

            html = replaceById(html, 'post-container', 'div', containerHtml);

            // ── Related posts ──
            const others = related.filter(p => p.slug !== slug).slice(0, 4);
            if (others.length) {
                const relatedGrid = others.map(p => `
                    <a href="/blog/${p.slug || p.id}" class="related-card">
                        <div class="related-card-img">
                            ${p.image_url
                                ? `<img src="${esc(p.image_url)}" alt="${esc(p.image_alt || p.title)}">`
                                : '📰'}
                        </div>
                        <div class="related-card-body">
                            <div class="related-card-date">📅 ${formatDate(p.date)}</div>
                            <div class="related-card-title">${esc(p.title)}</div>
                        </div>
                    </a>
                `).join('');
                html = replaceById(html, 'related-grid', 'div', relatedGrid);
                html = html.replace('id="related-section" style="display:none;"', 'id="related-section" style="display:block;"');
            }
        }
    } catch (err) {
        console.error('SSR render error:', err);
        // Serve plain HTML shell — client-side JS will still load the post in the browser
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
}

// Replaces the inner content of the first <TAG ... id="ID" ...> element found,
// correctly handling nested elements of the same tag name (e.g. nested <div>s).
function replaceById(html, id, tag, newInner) {
    const openRe = new RegExp(`<${tag}\\b[^>]*id="${id}"[^>]*>`, 'i');
    const m = openRe.exec(html);
    if (!m) return html;
    const contentStart = m.index + m[0].length;
    const tagRe = new RegExp(`<${tag}\\b[^>]*>|<\\/${tag}>`, 'gi');
    tagRe.lastIndex = contentStart;
    let depth = 1;
    let match;
    while ((match = tagRe.exec(html)) !== null) {
        if (match[0][1] === '/') {
            depth--;
            if (depth === 0) {
                return html.slice(0, contentStart) + newInner + html.slice(match.index);
            }
        } else {
            depth++;
        }
    }
    return html;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
