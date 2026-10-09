// Cloudflare Pages Function: serves the Libsyn RSS feed from this domain.
// Deployed automatically from /functions/feed.js -> https://<site>/feed
const FEED = 'https://feeds.libsyn.com/625985/rss';

export async function onRequestGet() {
  const upstream = await fetch(FEED, {
    headers: { 'User-Agent': 'brainandthebot.ai site' },
    cf: { cacheTtl: 600, cacheEverything: true },
  });
  if (!upstream.ok) {
    return new Response('feed unavailable', { status: 502 });
  }
  const body = await upstream.text();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
