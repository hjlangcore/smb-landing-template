# Bright Harbor Studio — SMB landing template

A concept landing page for a small local service business. It is a portfolio sample and a starting point for freelance web work.

**Bright Harbor Studio is fictional.** The address, email, quotes, and offer are placeholders. This is not a live client site, and it does not claim production clients, review scores, or project counts.

The stack is plain HTML, CSS, and a small script. There is no install and no build step. Cloudflare Pages can publish the `public` folder as-is.

## Local preview

From the repository root:

```bash
python3 -m http.server 8080 -d public
```

Open [http://localhost:8080](http://localhost:8080).

If your Python is older than 3.7, use:

```bash
cd public
python3 -m http.server 8080
```

Serve the folder over HTTP. Opening `index.html` as a file can break the font and asset requests that the not-found page loads from the site root.

Python’s built-in server does not apply `public/_headers` and does not use `404.html` for unknown paths. Cloudflare Pages does both. You can still open [http://localhost:8080/404.html](http://localhost:8080/404.html) directly.

## Deploy on Cloudflare Pages

Official guide: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

### Git

1. Push this repository to GitHub (or GitLab).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Choose the repository and the production branch (`main`).
4. Set the build as follows:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `public`
5. Save and deploy. Pages will publish `public/index.html` at the project URL.

`wrangler.toml` records the same output directory (`pages_build_output_dir = "public"`) for the CLI. The dashboard settings above are what Git deploys use.

### Wrangler CLI

```bash
npx wrangler login
npx wrangler pages deploy
```

Wrangler reads `pages_build_output_dir` and uploads `public`. The first deploy can create the project named in `wrangler.toml` (`bright-harbor-studio`). Rename that if the name is already taken on your account:

```bash
npx wrangler pages deploy public --project-name your-project-name
```

Preview URLs are served over HTTPS. `public/_headers` adds a few response headers (content type options, frame denial, referrer policy, a locked-down content security policy, and a short cache on CSS and JS).

### Custom domain

After the first successful deploy, add a domain under the Pages project → **Custom domains**. Do that only when the copy, form, and concept labels have been replaced for a real business.

## Contact form

The form is front-end only:

- With JavaScript, **Preview message** checks the fields and shows an on-page note. Nothing is uploaded or emailed.
- Without JavaScript, the form falls back to a `mailto:` draft addressed to `hello@bright-harbor.example`. That domain is reserved for examples and is not a real inbox.

Field names, if you connect a backend later: `name`, `email`, `phone`, `space`, `message`.

To make it live, point the form at [Formspree](https://formspree.io) (or a similar form host) or a [Cloudflare Worker](https://developers.cloudflare.com/workers/) that forwards mail. Remove the `mailto` action once a real endpoint exists, and replace the example address.

## What to replace for a real business

- Brand name, mark (`public/favicon.svg` and the header icon), and the copy in `public/index.html`.
- Colors under `:root` in `public/css/styles.css`.
- The concept pill in the header, the hero disclaimer, the sample-note cards, and the footer badge. Remove them only when the site is a real business.
- Placeholder quotes. Publish a quote only with permission. Do not invent client names, towns, star ratings, or result numbers.
- The example email, the fictional place line, and the form endpoint.
- Photography you have rights to use. This template uses an inline drawing so it does not depend on stock photos of people.

## Layout

| Path | Purpose |
| --- | --- |
| `public/index.html` | Landing page |
| `public/404.html` | Not-found page used by Cloudflare Pages |
| `public/css/styles.css` | All styles, including the color tokens |
| `public/js/main.js` | Year in the footer and the form preview |
| `public/_headers` | Pages response headers |
| `wrangler.toml` | Pages output directory for Wrangler |

## License

[MIT](LICENSE).
