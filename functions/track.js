// Cloudflare Pages Function: receives listening events from the site player
// and writes them to an Analytics Engine dataset.
//
// One-time setup in the Pages project:
//   Settings -> Bindings -> Add -> Analytics Engine
//   Variable name: PODCAST_EVENTS   Dataset: podcast_events
//
// Each row: blobs = [event, episode, episodeTitle, country, userAgentFamily]
//           doubles = [positionSeconds, durationSeconds, percent]

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response('bad json', { status: 400 }); }

  const { event, episode, title, position, duration, percent } = body ?? {};
  const allowed = new Set(['play', 'milestone', 'complete', 'leave']);
  if (!allowed.has(event) || typeof episode !== 'string') {
    return new Response('bad event', { status: 400 });
  }

  const ua = request.headers.get('user-agent') || '';
  const uaFamily = /iPhone|iPad/.test(ua) ? 'ios'
                 : /Android/.test(ua) ? 'android'
                 : /Macintosh/.test(ua) ? 'mac'
                 : /Windows/.test(ua) ? 'windows'
                 : /Linux/.test(ua) ? 'linux' : 'other';

  if (env.PODCAST_EVENTS) {
    env.PODCAST_EVENTS.writeDataPoint({
      indexes: [episode.slice(0, 96)],
      blobs: [event, episode.slice(0, 200), String(title ?? '').slice(0, 200),
              request.cf?.country ?? '', uaFamily],
      doubles: [Number(position) || 0, Number(duration) || 0, Number(percent) || 0],
    });
  }
  return new Response(null, { status: 204 });
}
