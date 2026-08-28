# Deployment

The site deploys to GitHub Pages from `main` via GitHub Actions, on the custom
domain `www.cibaracomforts.com`.

---

## One-time setup

### 1. Turn on Actions-based Pages

In the repository: **Settings → Pages → Build and deployment → Source →
GitHub Actions**.

This replaces the old "deploy from a branch" mode. The workflow in
`.github/workflows/deploy.yml` handles the rest.

### 2. Custom domain

**Settings → Pages → Custom domain** → `www.cibaracomforts.com`, then tick
**Enforce HTTPS** once the certificate has been issued (usually within an hour,
occasionally up to 24).

`public/CNAME` already contains the domain and is copied into every build, so
the setting will not be wiped by a deploy.

### 3. DNS

At your registrar:

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `<your-github-username>.github.io.` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

The apex A records make `cibaracomforts.com` redirect to the `www` host, which
is the canonical form used throughout the site.

Verify the GitHub Pages IPs against
<https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>
before entering them. They change rarely but they do change.

### 4. Analytics environment variables

Create `.env.local` for development and add repository secrets for CI. All are
optional; an unset variable means that tag is never loaded.

```
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
```

Because this is a static export, these are inlined at build time. Changing one
requires a rebuild, not just a redeploy.

Recommendation: start with GA4 only. Add Clarity for a week when you want to
watch session recordings, then remove it. Add the Meta Pixel only while you are
actually running ads.

---

## The deploy

Push to `main`. The workflow runs:

1. `npm ci`
2. `npm run images` — no-op unless a source photograph changed
3. `npm run typecheck`
4. `npm run lint`
5. `npm run build` — regenerates `llms.txt`, exports to `out/`
6. A file-existence check on `index.html`, `CNAME`, `.nojekyll`, `sitemap.xml`,
   `robots.txt` and `llms.txt`
7. Upload and deploy

Roughly 90 seconds. You can also trigger it manually from the Actions tab
without pushing a commit.

### If the deploy fails

- **Type or lint error** — reproduce locally with `npm run typecheck` and
  `npm run lint`. CI does not use `ignoreBuildErrors`, deliberately.
- **`out/CNAME` missing** — something removed `public/CNAME`. Restore it or the
  custom domain will unset itself on the next deploy.
- **Font error** — the webfont subsets are committed to `src/fonts/`. If they
  are missing, run `npm run fonts`. The build never fetches fonts over the
  network, so this cannot be a transient CI failure.

---

## Security headers

This is the one real limitation of GitHub Pages: it cannot send custom HTTP
response headers. There is no `Content-Security-Policy`, no `Strict-Transport-
Security` beyond what HTTPS enforcement gives you, and no `Permissions-Policy`.

Two things partly close the gap.

### What is already in place

- HTTPS is enforced by GitHub Pages.
- The site has no backend, no database, no authentication and no form endpoint,
  which removes most of the attack surface a CSP is usually protecting.
- The enquiry form stores nothing and posts nowhere. It composes a WhatsApp
  message that the guest sends themselves.
- Every external link uses `rel="noopener noreferrer"`.
- Bot protection on the form is a honeypot field plus a minimum time-to-submit,
  which is proportionate here and does not put a CAPTCHA in front of a guest.

### Recommended: put Cloudflare in front

Free, takes about twenty minutes, and gives you real headers plus caching, Brotli
and rate limiting.

1. Add the domain to Cloudflare and change the nameservers at your registrar.
2. Keep the same DNS records above, proxied (orange cloud).
3. SSL/TLS mode: **Full (strict)**.
4. Add a Transform Rule → Modify Response Header, for all requests:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://connect.facebook.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://www.google-analytics.com https://www.facebook.com https://maps.gstatic.com https://*.googleapis.com;
  font-src 'self';
  frame-src https://maps.google.com https://www.google.com;
  connect-src 'self' https://www.google-analytics.com https://*.clarity.ms https://connect.facebook.net https://googleads.g.doubleclick.net https://www.google.com https://ntfy.sh https://ipapi.co;
  form-action 'none';
  base-uri 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

`'unsafe-inline'` in `script-src` is required by the two inline bootstrap
scripts (theme and scroll reveal) and by the analytics loaders. Removing it
would need nonces, which a static export cannot generate per request. Given the
site has no user input and no backend, the residual risk is low. If you later
move to Vercel or Cloudflare Workers, middleware can issue per-request nonces
and this becomes strict.

5. Rate limiting rule: 100 requests per minute per IP. The site is static, so
   this is purely about scraping and cost, not security.

### Cache headers

GitHub Pages sends a short `max-age` on everything. Behind Cloudflare, add a
Cache Rule:

- `/_next/static/*` and `/media/*` → Edge TTL 1 year, `immutable`. These paths
  are content-hashed or version-stable, so this is safe.
- Everything else → Edge TTL 10 minutes.

---

## Moving off GitHub Pages later

If you ever want Server Actions, a real booking API, ISR or proper headers:

**Vercel.** Delete `output: 'export'` and `images.unoptimized` from
`next.config.ts`, connect the repository, repoint DNS. You can then also delete
`components/media/picture.tsx` and the image pipeline and use `next/image`,
though the current pipeline produces better output than the optimizer's
defaults, so there is no rush.

**Cloudflare Workers.** Same config change, plus `@opennextjs/cloudflare`.
Keeps you on one vendor if you have already added Cloudflare for headers.

Neither is urgent. The current setup costs nothing and serves this content
correctly.
