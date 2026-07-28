# IAID static website

This folder is a standalone static conversion of the original IAID WordPress theme. The original visible content, navigation, links, logo, page order, CSS design, responsive rules, and vanilla JavaScript behaviours have been preserved. WordPress, PHP, a database, npm, and a build process are not required.

## Structure

- `index.html` — Home
- `about-iaid/index.html` — About IAID
- `our-story/index.html` — Our Story
- `advocacy-achievements/index.html` — Advocacy & Achievements
- `media-coverage/index.html` — Media Coverage & Public Advocacy
- `committees/index.html` — Committees
- `resources/index.html` — Resources
- `contact/index.html` — Contact
- `membership-register-interest/index.html` — Membership / Register Interest
- `404.html` — Static error page
- `assets/css/main.css` — original theme stylesheet plus the original smooth-scrolling rule and the progressive motion layer
- `assets/js/main.js` — original vanilla JavaScript plus progressive interaction enhancements
- `assets/images/iaid-logo.png` — original IAID logo
- `CONTENT-AUDIT.md` — page-by-page conversion audit
- `MOTION-UPGRADE-AUDIT.md` — content-preservation and motion-enhancement audit

## Motion and accessibility

The premium motion layer is progressive enhancement: all content remains readable and usable if JavaScript is unavailable. It includes staged entrances, scroll reveals, subtle depth and pointer interactions, timeline and filter feedback, and refined navigation transitions. Fine-pointer effects are limited to compatible devices, hidden tabs pause ambient animation, and `prefers-reduced-motion: reduce` disables non-essential motion.

## Local preview

Do not review only by double-clicking `index.html`. Run a local static server so directory links behave like production.

Windows:

```text
cd iaid-static-site
py -m http.server 8000
```

Fallback:

```text
cd iaid-static-site
python -m http.server 8000
```

You can also double-click `serve.bat`.

macOS or Linux:

```text
cd iaid-static-site
python3 -m http.server 8000
```

You can also run `./serve.sh`.

Open `http://localhost:8000`. Press Ctrl+C in the terminal to stop the server.

To test mobile layouts, open the site in a browser, open its responsive/developer tools, and test the requested viewport sizes. The mobile navigation appears at the original theme breakpoint.

## Deployment

This folder can be deployed directly with no build command.

- Vercel: create a new project, upload or connect the folder, select a static/other framework preset, leave the build command empty, and use `.` as the output directory.
- Netlify: drag this folder into Netlify Drop, or configure it as the publish directory with no build command.
- Cloudflare Pages: upload the folder as direct-upload assets, or connect a repository and use no build command with `.` as the output directory.
- GitHub Pages: commit the contents to the publishing branch or `/docs` folder selected in repository Pages settings. Relative internal paths support project subdirectories.

For a custom `.org` domain, add the domain in the selected host, then create the DNS records supplied by that host. HTTPS should be enabled after DNS validation. Keep the same static files; no code change is required.

## Manual content updates

Each page's visible content is stored directly in that page's `index.html`.

- Media items: edit the `<article class="media-card">` elements in `media-coverage/index.html`. Keep `data-media-category` and `data-media-text` aligned with the visible category and searchable text.
- Resource links: edit the resource cards in `resources/index.html`, preserving external-link `target` and `rel` attributes.
- Navigation: update the duplicated `#primary-menu` list in every HTML file.
- Footer: update the duplicated `<footer class="site-footer">` in every HTML file.

## Known limitations

- The Register Interest links use `mailto:trainus.forireland@gmail.com`; no server-side form is introduced.
- The copyright year is written statically as 2026.
- Google Fonts require an internet connection; browser fallbacks apply when offline.
- The required `404.html` has minimal technical error content because the source theme did not include a dedicated 404 template.

No WordPress installation, PHP runtime, MySQL database, npm dependency, or paid hosting is required.
