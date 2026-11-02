# Bright Harbor Studio — SMB landing template

A concept landing page for a small local service business. It is a portfolio sample and a starting point for freelance web work.

**Bright Harbor Studio is fictional.** The address, email, quotes, and offer are placeholders. This is not a live client site, and it does not claim production clients, review scores, or project counts.

The stack is plain HTML, CSS, and a small script. There is no install and no build step. Cloudflare Pages can publish the `public` folder as-is.

A concept support-chat widget is included. It answers from a script in the browser and does not need an API key.

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

The **Ask a question** button at the lower right opens the concept chat. See [Support chat widget](#support-chat-widget) for what to try and how to change the answers.

Python’s built-in server does not apply `public/_headers` and does not use `404.html` for unknown paths. Cloudflare Pages does both. You can still open [http://localhost:8080/404.html](http://localhost:8080/404.html) directly.

## Support chat widget

The landing page and the not-found page load `public/js/support-widget.js` with `public/css/support-widget.css`. It is a concept demo of a small support widget, not a live client install. Bright Harbor Studio is fictional. Replies are chosen in the browser from a short script. This repository does not include an API key, and the default build does not call one.

### Try it on the demo site

1. Start the preview under [Local preview](#local-preview).
2. Open the site and choose **Ask a question** (it is also marked **Demo**).
3. Ask about hours, services, or contact. The chips send those questions. Answers still appear if the network is blocked.
4. Close the panel with **Close** or Escape. The **Ask a question** button is hidden while the panel is open, and focus returns to it when the panel closes.

The panel says **Concept demo** and states that the replies are scripted. The same button is on the not-found page.

What the script will say, matching the rest of the page:

- Visits are by appointment. No opening hours are listed.
- Four starting points: a home styling session, color and materials, a shopfront refresh, and a seasonal reset. No fees.
- Contact is `hello@bright-harbor.example`, which is not a real inbox. There is no phone number and no street address.
- Anything else gets a short fallback. It does not invent a client, a rating, or a price.

### Customize the FAQ answers

Edit the `defaults` object at the top of `public/js/support-widget.js`. Each entry in `faqs` has:

- `id` — a short name, used only so you can tell entries apart
- `keywords` — words and phrases to look for in the visitor’s message (matched on word boundaries, ignoring letter case)
- `answer` — the reply shown in the panel

Also update `welcome`, `greeting`, `fallback`, `suggestions`, `title`, `disclaimer`, and `brand` in that same object when the business changes. `suggestions` is the row of chips: `label` is the chip, `text` is the message it sends.

A greeting such as “Hello” uses `greeting`. A message that matches none of the keywords uses `fallback`.

On a site that allows an inline script, you can leave the file alone and set `window.HarborSupport` before the widget script. Passing `faqs` or `suggestions` replaces those lists. This template’s Cloudflare header policy is `script-src 'self'`, so an inline config on the demo site would be blocked. Edit the file here.

```html
<script>
  window.HarborSupport = {
    brand: "Your Business",
    title: "Questions",
    welcome: "Hello. This chat is a demo and stays in your browser.",
    disclaimer: "Concept demo widget. Not a live client install.",
    suggestions: [
      { label: "Hours", text: "What are your hours?" }
    ],
    faqs: [
      {
        id: "hours",
        keywords: ["hour", "hours", "open", "appointment"],
        answer: "Visits are by appointment. Our hours are listed on the contact page."
      }
    ],
    fallback: "Try asking about hours."
  };
</script>
<script src="/js/support-widget.js" defer></script>
```

Remove the concept-demo wording only when the widget is actually in production for that business. Do not invent client names, review scores, or result numbers in the answers.

### Drop it onto another site

Copy `public/js/support-widget.js` and `public/css/support-widget.css` onto the other site. Before `</body>`:

```html
<link rel="stylesheet" href="/css/support-widget.css">
<script src="/js/support-widget.js" defer></script>
```

Keep those two paths in step with where you uploaded the files. The script brings its own styles and does not need this landing page’s stylesheet. If the link tag is missing, the script inserts one when the CSS file is at `/css/support-widget.css` next to `/js/support-widget.js`, or beside the script if both files share a folder.

The widget needs JavaScript. Without it, the button is absent and the rest of the page still works. A button or link with `data-harbor-support` opens the panel.

Replace the Bright Harbor copy before you publish the widget for a real business.

### Optional assistant endpoint

Leave `endpoint` as an empty string and the widget stays offline. To call an OpenAI-compatible chat completions API later, set `endpoint` to a URL you control:

- `https://…` in production
- `http://localhost` or `http://127.0.0.1` for a private test
- a same-origin path such as `/api/chat`

Prefer a small proxy on your server so the API key never appears in the browser or in this repository. Do not commit a key, and do not put one in `support-widget.js`. `public/js/*.local.js` is gitignored if you want a local file, but this template does not load one for you. A public page should leave `apiKey` empty.

The widget POSTs JSON:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "…" },
    { "role": "user", "content": "…" }
  ]
}
```

It reads `choices[0].message.content`. A proxy may return `{ "reply": "…" }` or `{ "message": "…" }` instead. If the request fails, the panel says so and shows the scripted answer. Change `systemPrompt` when you change the business, so the model is not still describing Bright Harbor Studio.

Allow the endpoint origin in your content security policy (`connect-src`). `public/_headers` only allows same-origin requests, which is what the offline demo needs. The widget will not call `http://` except on localhost, and it ignores an endpoint that puts a token in the query string or the userinfo.

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
- The scripted chat answers, launcher label, and concept-demo wording in `public/js/support-widget.js`. Remove that wording only when the widget is a real install. Do not invent clients or metrics in the replies.
- Photography you have rights to use. This template uses an inline drawing so it does not depend on stock photos of people.

## Layout

| Path | Purpose |
| --- | --- |
| `public/index.html` | Landing page |
| `public/404.html` | Not-found page used by Cloudflare Pages |
| `public/css/styles.css` | All styles, including the color tokens |
| `public/js/main.js` | Year in the footer and the form preview |
| `public/js/support-widget.js` | Concept chat widget and the scripted FAQ |
| `public/css/support-widget.css` | Styles for that widget only |
| `test/support-widget.test.js` | Node tests for FAQ matching and the endpoint guard |
| `public/_headers` | Pages response headers |
| `wrangler.toml` | Pages output directory for Wrangler |

## License

[MIT](LICENSE).
