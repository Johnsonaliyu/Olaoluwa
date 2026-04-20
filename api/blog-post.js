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
  const id = req.query.id || '';

  /* ── Defaults ── */
  let ogTitle       = 'Olaoluwa Age Group Blog';
  let ogDescription = 'News and updates from the Olaoluwa Age Group community — Iwaro-Oka Akoko, Ondo State.';
  let ogImage       = `${SITE_URL}/logo.jpg`;
  let ogUrl         = id
    ? `${SITE_URL}/blog-post-app.html?id=${encodeURIComponent(id)}`
    : `${SITE_URL}/blog.html`;

  /* ── Fetch real post data from Supabase ── */
  if (id) {
    try {
      const apiRes = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}&status=eq.published&select=title,excerpt,image_url&limit=1`,
        {
          headers: {
            'apikey':        SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept':        'application/json',
          },
        }
      );

      if (apiRes.ok) {
        const rows = await apiRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const post = rows[0];
          if (post.title)     ogTitle       = post.title + ' — Olaoluwa Age Group';
          if (post.excerpt)   ogDescription = post.excerpt;
          if (post.image_url) ogImage       = post.image_url;
        }
      }
    } catch (err) {
      console.error('Supabase fetch error:', err.message);
    }
  }

  /* ── Read the static HTML file from disk ── */
  let html;
  try {
    html = fs.readFileSync(
      path.join(process.cwd(), 'blog-post-app.html'),
      'utf8'
    );
  } catch (err) {
    res.status(500).send('Could not read blog-post-app.html: ' + err.message);
    return;
  }

  /* ── Build the OG meta block ──
     Inject right after <head> so these are the FIRST tags the
     crawler sees. Social crawlers always use the first occurrence. ── */
  const ogBlock = `
    <title>${esc(ogTitle)}</title>
    <meta property="og:type"         content="article">
    <meta property="og:site_name"    content="Olaoluwa Age Group">
    <meta property="og:title"        content="${esc(ogTitle)}">
    <meta property="og:description"  content="${esc(ogDescription)}">
    <meta property="og:image"        content="${esc(ogImage)}">
    <meta property="og:url"          content="${esc(ogUrl)}">
    <meta name="twitter:card"        content="summary_large_image">
    <meta name="twitter:title"       content="${esc(ogTitle)}">
    <meta name="twitter:description" content="${esc(ogDescription)}">
    <meta name="twitter:image"       content="${esc(ogImage)}">`;

  /* Replace <head> with <head> + OG block — first match only */
  html = html.replace('<head>', `<head>${ogBlock}`);

  /* ── Send response ── */
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
};
          
