const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Base routes you always want
  const routes = [
    { url: 'https://create.helixscribe.ai/', file: 'home.html' },
    { url: 'https://create.helixscribe.ai/about', file: 'about.html' },
    { url: 'https://create.helixscribe.ai/features', file: 'features.html' },
    { url: 'https://create.helixscribe.ai/pricing', file: 'pricing.html' },
    { url: 'https://create.helixscribe.ai/blog', file: 'blog.html' }
  ];

  // Step 1: Visit the blog listing page to extract links
  await page.goto('https://create.helixscribe.ai/blog', { waitUntil: 'networkidle' });
  const blogLinks = await page.$$eval('a[href^="/blog/"]', els =>
    els.map(e => e.getAttribute('href'))
  );

  // Step 2: Add blog posts to routes list
  blogLinks.forEach(link => {
    // avoid duplicates
    if (!routes.some(r => r.url.endsWith(link))) {
      const slug = link.replace('/blog/', '');
      routes.push({
        url: `https://create.helixscribe.ai${link}`,
        file: `blog-${slug}.html`
      });
    }
  });

  // Step 3: Visit each route and save snapshot
  for (const r of routes) {
    console.log(`Saving snapshot: ${r.url}`);
    await page.goto(r.url, { waitUntil: 'networkidle' });
    const html = await page.content();
    fs.mkdirSync('snapshots', { recursive: true });
    fs.writeFileSync(`snapshots/${r.file}`, html);
  }

  await browser.close();
})();
