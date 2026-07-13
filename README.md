# Olaoluwa Age Group Website

Official website for the **Olaoluwa Age Group**, a Yoruba civic and cultural organization based in Iwaro-Oka Akoko, Ondo State, Nigeria.

🌐 Live site: [olaoluwaagegroup.com.ng](https://olaoluwaagegroup.com.ng)

## About

This site serves as the digital home for the Olaoluwa Age Group, providing information about the organization, its members, activities, and community initiatives.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend / Database:** [Supabase](https://supabase.com)
- **Hosting:** [Vercel](https://vercel.com)
- **Domain:** Custom `.com.ng` domain (migrated from `.vercel.app`)

## Features

- **Public Website** — Organization info, member profiles, and community content
- **Blog** — Slug-based URLs with server-side Open Graph (OG) meta tag injection for rich social media previews
- **CMS Admin Panel** — Vanilla HTML/JS admin interface backed by Supabase for content management
- **Awards & Voting System** — Includes IP-based anti-duplicate voting (edge function on Deno Deploy)
- **Gallery** — Image gallery with infinite scroll
- **Amòfin ("The Law")** — WhatsApp-based constitutional advisor bot for the group, built on the Meta Cloud API
- **AI Content Assistant** — Proxied through a Vercel serverless function
- **SEO Optimizations** — Favicon, OG meta tags, dynamic sitemap, and Google Search Console integration

## Project Structure

```
/
├── public/           # Static assets (HTML, CSS, JS, images)
├── admin/            # CMS admin panel
├── blog/             # Blog pages and templates
├── api/              # Vercel serverless functions (proxies, OG injection, AI assistant)
├── sitemap.xml        # Dynamically generated sitemap
└── README.md
```

*(Adjust structure above to match the actual repo layout.)*

## Getting Started

### Prerequisites

- Node.js (for local development / Vercel functions)
- A Supabase project (URL + API keys)
- Vercel CLI (optional, for local serverless function testing)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Johnsonaliyu/<repo-name>.git
   cd <repo-name>
   ```

2. Add environment variables (create a `.env` file or configure in Vercel dashboard):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run locally:
   ```bash
   vercel dev
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

## Deployment

The site is deployed on **Vercel**, connected to the custom domain `olaoluwaagegroup.com.ng`. Serverless functions handle OG tag injection, AI content assistance, and API proxying to keep credentials secure.

## Contributing

This project is maintained by the Olaoluwa Age Group webmaster team. For contributions or bug reports, please open an issue or contact:

- **Maintainer:** Aliu Johnson Temitope
- **GitHub:** [github.com/Johnsonaliyu](https://github.com/Johnsonaliyu)
- **Email:** johnsonaliyu47@gmail.com

## License

© Olaoluwa Age Group. All rights reserved.
