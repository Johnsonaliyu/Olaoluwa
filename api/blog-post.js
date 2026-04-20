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
  /* Support both ?id=... and /blog/:slug via ?slug=... */
  const id   = req.query.id   || '';
  const slug = req.query.slug || '';

  /* ── Defaults ── */
  let ogTitle       = 'Olaoluwa Age Group Blog';
  let ogDescription = 'News and updates from the Olaoluwa Age Group community — Iwaro-Oka Akoko, Ondo State.';
  let ogImage       = `${SITE_URL}/logo.jpg`;
  let ogUrl         = `${SITE_URL}/blog.html`;
  let appUrl        = `${SITE_URL}/blog-post-app.html`;

  /* ── Fetch post from Supabase — by id or by slug ── */
  let query = '';
  if (id)   query = `id=eq.${encodeURIComponent(id)}`;
  if (slug) query = `slug=eq.${encodeURIComponent(slug)}`;

  if (query) {
    try {
      const apiRes = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?${query}&status=eq.published&select=id,title,excerpt,image_url,slug&limit=1`,
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
          if (post.title)     ogTitle       = post.title;
          if (post.excerpt)   ogDescription = post.excerpt;
          if (post.image_url) ogImage       = post.image_url;

          /* Clean slug URL — shown in WhatsApp preview */
          const postSlug = post.slug || (post.id ? `post-${post.id}` : '');
          ogUrl  = postSlug
            ? `${SITE_URL}/blog/${postSlug}`
            : `${SITE_URL}/blog-post.html?id=${encodeURIComponent(post.id)}`;

          /* The actual full page the browser loads */
          appUrl = `${SITE_URL}/blog-post-app.html?id=${encodeURIComponent(post.id)}`;
        }
      }
    } catch (err) {
      console.error('Supabase error:', err.message);
    }
  }

  /* ── Minimal HTML — bots read OG tags, browsers get JS-redirected ── */
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta property="og:type"         content="article">
  <meta property="og:site_name"    content="Olaoluwa Age Group">
  <meta property="og:title"        content="${esc(ogTitle)}">
  <meta property="og:description"  content="${esc(ogDescription)}">
  <meta property="og:image"        content="${esc(ogImage)}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url"          content="${esc(ogUrl)}">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDescription)}">
  <meta name="twitter:image"       content="${esc(ogImage)}">
  <title>${esc(ogTitle)}</title>
  <script>window.location.replace("${appUrl}");</script>
</head>
<body>
  <p>Loading... <a href="${appUrl}">Click here if not redirected.</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
};
  
