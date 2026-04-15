const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY environment variables must be set in Vercel.');
  process.exit(1);
}

const HTML_FILES = ['index.html', 'admin.html', 'blog.html', 'blog-post.html'];

fs.mkdirSync('dist', { recursive: true });

// Process HTML files — inject env vars
HTML_FILES.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} (not found)`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('__SUPABASE_URL__', SUPABASE_URL);
  content = content.replaceAll('__SUPABASE_KEY__', SUPABASE_KEY);
  fs.writeFileSync(`dist/${file}`, content);
  console.log(`Built: ${file}`);
});

// Copy all other files (CSS, JS, images, etc.) as-is
fs.readdirSync('.').forEach(file => {
  if (file === 'dist' || file === 'node_modules' || file === '.git') return;
  if (HTML_FILES.includes(file)) return;
  if (['build.js', 'package.json', 'vercel.json', '.gitignore'].includes(file)) return;
  try {
    fs.copyFileSync(file, `dist/${file}`);
    console.log(`Copied: ${file}`);
  } catch (e) {
    console.log(`Skipped: ${file}`);
  }
});

console.log('Build complete. Output in dist/');
