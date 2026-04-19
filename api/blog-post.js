const fs   = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://dupnvmizssjdqqxunvwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cG52bWl6c3NqZHFxeHVudnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDk2NDMsImV4cCI6MjA5MTY4NTY0M30.WKUVX_WnAZnZ6ca6Tl8-oQC2i-N7exaaaRkA6FCMYeo';
const SITE_URL     = 'https://olaoluwaagegroup.vercel.app';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = async function handler(req, res) {
  const { id } = req.query;

  // ── Defaults ──
  let ogTitle       = 'Olaoluwa Age Group Blog';
  let ogDescription = 'News and updates from the Olaoluwa Age Group community — Iwaro-Oka Akoko, Ondo State.';
  let ogImage       = `${SITE_URL}/logo.jpg`;
  let ogUrl         = id
    ? `${SITE_URL}/blog-post.html?id=${encodeURIComponent(id)}`
    : `${SITE_URL}/blog.html`;

  // ── Fetch real post data from Supabase ──
  if (id) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}&status=eq.published&select=title,excerpt,image_url`,
        {
          headers: {
            'apikey':        SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
          },
        }
      );

      if (response.ok) {
        const posts = await response.json();
        if (posts && posts.length > 0) {
          const post = posts[0];
          if (post.title)     ogTitle       = post.title + ' — Olaoluwa Age Group';
          if (post.excerpt)   ogDescription = post.excerpt;
          if (post.image_url) ogImage       = post.image_url;
        }
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
      // Fall through — defaults are still fine
    }
  }

  // ── Read the static HTML file ──
  let html;
  try {
    html = fs.readFileSync(
      path.join(process.cwd(), 'blog-post.html'),
      'utf8'
    );
  } catch (err) {
    res.status(500).send('Could not read blog-post.html');
    return;
  }

  // ── Inject real values into the OG meta tag content attributes ──
  html = html
    // <title>
    .replace(
      '<title>Blog Post - Olaoluwa Age Group</title>',
      `<title>${esc(ogTitle)}</title>`
    )
    // og:title
    .replace(
      'id="og-title"       content="Olaoluwa Age Group Blog"',
      `id="og-title"       content="${esc(ogTitle)}"`
    )
    // og:description
    .replace(
      'id="og-description" content="News and updates from the Olaoluwa Age Group community."',
      `id="og-description" content="${esc(ogDescription)}"`
    )
    // og:image
    .replace(
      'id="og-image"       content=""',
      `id="og-image"       content="${esc(ogImage)}"`
    )
    // og:url
    .replace(
      'id="og-url"         content=""',
      `id="og-url"         content="${esc(ogUrl)}"`
    )
    // twitter:title
    .replace(
      'id="tw-title"       content="Olaoluwa Age Group Blog"',
      `id="tw-title"       content="${esc(ogTitle)}"`
    )
    // twitter:description
    .replace(
      'id="tw-description" content="News and updates from the Olaoluwa Age Group community."',
      `id="tw-description" content="${esc(ogDescription)}"`
    )
    // twitter:image
    .replace(
      'id="tw-image"       content=""',
      `id="tw-image"       content="${esc(ogImage)}"`
    );

  // ── Return the fully-formed HTML ──
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
};
  
