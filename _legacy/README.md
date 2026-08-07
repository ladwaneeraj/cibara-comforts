# Legacy site

Everything here is the previous single-file site, kept on this branch only so
nothing is lost while the rebuild is reviewed. None of it is used by the new
build and none of it is deployed.

- `index.html` — the old 166 KB single-page site
- `icons/`, `images/`, `rooms/` — the old asset folders. The photographs that
  are still in use were copied into `assets/source/` and are processed by
  `scripts/optimize-images.mjs`
- `llms.txt`, `robots.txt`, `sitemap.xml`, `site.webmanifest` — all now
  generated at build time from `src/content/`
- `CNAME` — now at `public/CNAME`, so it survives every deploy
- `ENHANCEMENTS.md`, `NOTIFICATIONS_SETUP.md` — notes from the old build

NOT copied over, deliberately: `rooms/dorm4.jpg` was a watermarked Shutterstock
image and has been dropped. `rooms/dorm1.jpg` and `rooms/dorm3.jpg` do not
appear to show this property; they are still here but are not referenced by the
new site. See docs/LAUNCH.md.

Delete this folder once the rebuild is live and you are happy with it.
