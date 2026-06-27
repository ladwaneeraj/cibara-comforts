# Visit notifications — setup guide

A small script in `index.html` pings your phone whenever someone opens the site.
Only **your** phone (the device subscribed to the topic) gets the notification.
Visitors send the ping but receive nothing.

**Your secret topic:** `cibara-comforts-YXkKWWEhj1`

---

## One-time setup (~3 minutes)

1. **Install the ntfy app** (free): search "ntfy" in the App Store (iOS) or Google Play (Android).
2. **Subscribe to your topic.** In the app tap **+ / Subscribe to topic**, leave the server as the default `ntfy.sh`, enter the topic exactly:
   `cibara-comforts-YXkKWWEhj1`, then Subscribe. Allow notifications when prompted.
3. **Deploy the site.** This is a GitHub Pages site, so the change only goes live after you push it:
   ```bash
   git add index.html
   git commit -m "Add visit notification (ntfy)"
   git push
   ```
   Wait ~1 minute for Pages to rebuild.
4. **Test.** Open https://www.cibaracomforts.com in a private/incognito window (or on another device).
   Within a few seconds you should get a push on your phone.
5. **(Optional) Mute your own visits.** On your own browser, open the site, then open DevTools
   (F12) → Console and run:
   ```js
   localStorage.setItem('ntfy_mute','1')
   ```
   After this, that browser will never ping you. Do this *after* step 4, not before.

---

## How it behaves

- **Once per browser session.** A visitor browsing several pages pings you once, not on every click/refresh.
- **Each notification shows only business-relevant info:** new vs returning visitor, which page they
  landed on, how they found you (Google / Instagram / WhatsApp / direct, etc.), approximate location
  (city, region, country + flag), device (mobile or desktop), and the local time.
- **Location is approximate.** It is IP-based — usually city/ISP level, often the mobile carrier's
  gateway city rather than the exact town, and VPNs will mislead it. Treat it as a rough hint, not a fix.
- **Privacy:** to look up location, each visitor's IP is sent to ipapi.co (a third party). Your site
  stores nothing. Want location removed? Tell me and I'll strip just that part out.
- **It counts everything** that loads the page with JavaScript on — including bots, crawlers, and you.
  Treat it as a "someone stopped by" signal, not analytics.
- **Edge cases:** won't fire if a visitor blocks JavaScript; very fast bounces (under ~2s) may
  occasionally be missed because the location lookup runs first. The free location tier (ipapi.co) is
  ~1,000 lookups/day — past that the location line reads "(rate-limited)" and the rest still arrives.

## Security note (important)

The topic name is visible in your page source, so it acts like a weak password. Anyone who reads the
HTML could send spam pings to your phone (they still can't *receive* your notifications). For a small
site this is unlikely. If it ever happens:

1. Pick a new topic name.
2. Replace `cibara-comforts-YXkKWWEhj1` in `index.html` (one place) with the new name.
3. Re-subscribe to the new topic in the app, push the change.

If you want this to be spoof-proof and to filter out bots, the next step is a free Cloudflare Worker
that hides the topic behind a server. Ask and I'll set it up.

## Turn it off

Delete the `<!-- Visit notification via ntfy.sh -->` script block in `index.html`, or just unsubscribe
in the app.
